import { decodeFunctionResult, encodeFunctionData, parseAbi, type Hex } from 'viem'
import type { FeeHistoryPage, FeeType } from './types'

const WALLET_FACTORY_ABI = parseAbi([
  'function predictWalletAddress(bytes32 walletId) view returns (address)',
])

function validateFeeHistoryPage(value: unknown): FeeHistoryPage {
  if (!value || typeof value !== 'object')
    throw new Error('Data API returned an invalid fee history page.')
  const page = value as Record<string, unknown>
  if (!Array.isArray(page.items) || typeof page.hasMore !== 'boolean') {
    throw new Error('Data API returned an invalid fee history page.')
  }
  const items = page.items.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('Data API returned an invalid fee item.')
    const row = item as Record<string, unknown>
    const amount = typeof row.amount === 'string' ? row.amount : ''
    const feeType = typeof row.feeType === 'string' ? row.feeType : ''
    const txHash = typeof row.txHash === 'string' ? row.txHash.toLowerCase() : ''
    const timestamp = typeof row.timestamp === 'number' ? row.timestamp : Number.NaN
    if (
      !/^\d+$/.test(amount) ||
      !['KUEST', 'BUILDER', 'AFFILIATE'].includes(feeType) ||
      !/^0x[0-9a-f]{64}$/.test(txHash) ||
      !Number.isSafeInteger(timestamp) ||
      timestamp < 0
    ) {
      throw new Error('Data API returned an invalid fee item.')
    }
    return { amount: BigInt(amount).toString(), feeType: feeType as FeeType, txHash, timestamp }
  })
  const nextCursor =
    page.nextCursor == null ? null : typeof page.nextCursor === 'string' ? page.nextCursor : null
  if (page.hasMore && !nextCursor) throw new Error('Data API fee cursor is missing.')
  return { items, nextCursor, hasMore: page.hasMore }
}

export async function fetchFeeHistoryPage(params: {
  baseUrl: string
  address: string
  feeType: FeeType
  cursor?: string | null
  fetcher?: typeof fetch
}): Promise<FeeHistoryPage> {
  const url = new URL('/fees/history', `${params.baseUrl}/`)
  url.searchParams.set('address', params.address)
  url.searchParams.set('feeType', params.feeType)
  url.searchParams.set('interval', 'all')
  if (params.cursor) url.searchParams.set('cursor', params.cursor)
  const response = await (params.fetcher || fetch)(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Fee history API failed with HTTP ${response.status}.`)
  return validateFeeHistoryPage(await response.json())
}

async function rpc<T>(
  rpcUrl: string,
  method: string,
  params: unknown[],
  fetcher: typeof fetch,
): Promise<T> {
  const response = await fetcher(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!response.ok) throw new Error(`Affiliate RPC failed with HTTP ${response.status}.`)
  const payload = (await response.json()) as { result?: T; error?: { message?: string } }
  if (payload.error || payload.result == null)
    throw new Error(payload.error?.message || 'Affiliate RPC returned no result.')
  return payload.result
}

export async function deriveCanonicalDepositWallet(params: {
  rpcUrl: string
  factory: string
  operatorWallet: string
  fetcher?: typeof fetch
}) {
  const owner = params.operatorWallet.toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(owner)) throw new Error('Invalid operator wallet.')
  const walletId = `0x${'0'.repeat(24)}${owner.slice(2)}` as Hex
  const data = encodeFunctionData({
    abi: WALLET_FACTORY_ABI,
    functionName: 'predictWalletAddress',
    args: [walletId],
  })
  const result = await rpc<Hex>(
    params.rpcUrl,
    'eth_call',
    [{ to: params.factory, data }, 'latest'],
    params.fetcher || fetch,
  )
  const depositWallet = decodeFunctionResult({
    abi: WALLET_FACTORY_ABI,
    functionName: 'predictWalletAddress',
    data: result,
  }).toLowerCase()
  return { owner, walletId, depositWallet, factory: params.factory.toLowerCase() }
}

export async function getBlockTimestamp(params: {
  rpcUrl: string
  blockNumber: number | 'latest'
  fetcher?: typeof fetch
}) {
  const tag = params.blockNumber === 'latest' ? 'latest' : `0x${params.blockNumber.toString(16)}`
  const block = await rpc<{ number: Hex; timestamp: Hex }>(
    params.rpcUrl,
    'eth_getBlockByNumber',
    [tag, false],
    params.fetcher || fetch,
  )
  return { blockNumber: Number(BigInt(block.number)), timestamp: Number(BigInt(block.timestamp)) }
}
