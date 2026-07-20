import { encodeFunctionResult, parseAbi } from 'viem'
import { describe, expect, it, vi } from 'vite-plus/test'
import { getAffiliateConfig } from './constants'
import { readDubClickId } from './cookie'
import { confirmedSafeBlockNumber, deterministicInvoiceId, retryAt } from './logic'
import { rawToCentsWithRemainder } from './money'
import { loadHistoryWindow, operatorPageFromRows } from './processor'
import { deriveCanonicalDepositWallet, fetchFeeHistoryPage } from './source'

function json(value: unknown) {
  return new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } })
}

describe('affiliate source and rollout safety', () => {
  it('keeps dry-run enabled and block zero invalid until production is explicitly configured', () => {
    const config = getAffiliateConfig({ AFFILIATE_DB: {} as D1Database })
    expect(config.dryRun).toBe(true)
    expect(config.startBlock).toBe(0)
  })

  it('captures only a valid Dub cookie', () => {
    expect(
      readDubClickId(
        new Request('https://kuest.com/launch', {
          headers: { cookie: 'theme=dark; dub_id=click_123-abc' },
        }),
      ),
    ).toBe('click_123-abc')
    expect(
      readDubClickId(
        new Request('https://kuest.com/launch', {
          headers: { cookie: 'dub_id=invalid%20value' },
        }),
      ),
    ).toBeNull()
  })

  it('validates the optimized fee history response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      json({
        items: [
          {
            amount: '00125000',
            feeType: 'KUEST',
            txHash: `0x${'a'.repeat(64)}`,
            timestamp: 1_784_550_000,
          },
        ],
        nextCursor: null,
        hasMore: false,
      }),
    )
    const page = await fetchFeeHistoryPage({
      baseUrl: 'https://data-api.kuest.com',
      address: `0x${'1'.repeat(40)}`,
      feeType: 'KUEST',
      fetcher,
    })
    expect(page.items[0]).toMatchObject({ amount: '125000', feeType: 'KUEST' })
    expect(String(fetcher.mock.calls[0][0])).toContain('/fees/history?')
  })

  it('rejects a fee type that does not match the requested history stream', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      json({
        items: [
          {
            amount: '10',
            feeType: 'AFFILIATE',
            txHash: `0x${'a'.repeat(64)}`,
            timestamp: 1_784_550_000,
          },
        ],
        nextCursor: null,
        hasMore: false,
      }),
    )
    await expect(
      fetchFeeHistoryPage({
        baseUrl: 'https://data-api.kuest.com',
        address: `0x${'1'.repeat(40)}`,
        feeType: 'BUILDER',
        fetcher,
      }),
    ).rejects.toThrow('unexpected fee type')
  })

  it('paginates until the permanent cut boundary without losing the boundary timestamp', async () => {
    const hash = (character: string) => `0x${character.repeat(64)}`
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        json({
          items: [
            { amount: '10', feeType: 'BUILDER', txHash: hash('a'), timestamp: 200 },
            { amount: '10', feeType: 'BUILDER', txHash: hash('b'), timestamp: 150 },
          ],
          nextCursor: 'next',
          hasMore: true,
        }),
      )
      .mockResolvedValueOnce(
        json({
          items: [
            { amount: '10', feeType: 'BUILDER', txHash: hash('c'), timestamp: 150 },
            { amount: '10', feeType: 'BUILDER', txHash: hash('d'), timestamp: 99 },
          ],
          nextCursor: null,
          hasMore: false,
        }),
      )
    const items = await loadHistoryWindow({
      baseUrl: 'https://data-api.kuest.com',
      address: `0x${'1'.repeat(40)}`,
      feeType: 'BUILDER',
      minimumTimestamp: 100,
      safeTimestamp: 180,
      maxPages: 5,
      fetcher,
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(items.map((item) => item.timestamp)).toEqual([150, 150])
  })

  it('derives the deterministic deposit wallet through one factory view call', async () => {
    const abi = parseAbi(['function predictWalletAddress(bytes32 walletId) view returns (address)'])
    const depositWallet = `0x${'2'.repeat(40)}` as `0x${string}`
    const fetcher = vi.fn().mockResolvedValue(
      json({
        jsonrpc: '2.0',
        id: 1,
        result: encodeFunctionResult({
          abi,
          functionName: 'predictWalletAddress',
          result: depositWallet,
        }),
      }),
    )
    const result = await deriveCanonicalDepositWallet({
      rpcUrl: 'https://polygon-amoy.drpc.org',
      factory: `0x${'3'.repeat(40)}`,
      operatorWallet: `0x${'1'.repeat(40)}`,
      fetcher,
    })
    expect(result.depositWallet).toBe(depositWallet)
    expect(result.walletId).toBe(`0x${'0'.repeat(24)}${'1'.repeat(40)}`)
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('uses operator identity for invoices and carries exact sub-cent remainder', () => {
    expect(
      deterministicInvoiceId({
        chainId: 80002,
        operatorWallet: `0x${'A'.repeat(40)}`,
        txHash: `0x${'B'.repeat(64)}`,
      }),
    ).toBe(`80002:0x${'a'.repeat(40)}:0x${'b'.repeat(64)}`)
    expect(rawToCentsWithRemainder({ amountRaw: '12500', decimals: 6 })).toEqual({
      cents: 1,
      remainderRaw: '2500',
      scaleRawPerCent: '10000',
    })
    expect(() =>
      rawToCentsWithRemainder({ amountRaw: '12500', decimals: 6, remainderRaw: '-1' }),
    ).toThrow('unsigned integer string')
    expect(() =>
      rawToCentsWithRemainder({ amountRaw: '12500', decimals: 6, remainderRaw: 'invalid' }),
    ).toThrow('unsigned integer string')
  })

  it('waits for the initial confirmation window and shares deterministic retry timing', () => {
    expect(
      confirmedSafeBlockNumber({ latestBlockNumber: 1_050, confirmations: 64, startBlock: 1_000 }),
    ).toBeNull()
    expect(
      confirmedSafeBlockNumber({ latestBlockNumber: 1_064, confirmations: 64, startBlock: 1_000 }),
    ).toBe(1_000)
    expect(retryAt(2, 1_000, 0)).toBe(new Date(3_000).toISOString())
  })

  it('finishes a round-robin cycle without wrapping into an unscanned next cycle', () => {
    const operator = (character: string) => ({
      operator_wallet: `0x${character.repeat(40)}`,
      deposit_wallet: `0x${character.repeat(40)}`,
      chain_id: 80002,
    })
    expect(operatorPageFromRows([operator('1'), operator('2'), operator('3')], 2)).toEqual({
      operators: [operator('1'), operator('2')],
      cycleComplete: false,
    })
    expect(operatorPageFromRows([operator('3')], 2)).toEqual({
      operators: [operator('3')],
      cycleComplete: true,
    })
  })
})
