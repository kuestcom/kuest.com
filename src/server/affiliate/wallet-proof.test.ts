import { privateKeyToAccount } from 'viem/accounts'
import { describe, expect, it } from 'vite-plus/test'
import type { WalletControlProof } from '../../lib/launch-types'
import { isWalletProofFresh, WALLET_PROOF_MAX_AGE_SECONDS } from '../../lib/wallet-proof'
import { verifyWalletControlProof } from './wallet-proof'

const account = privateKeyToAccount(`0x${'1'.repeat(64)}`)
const now = 1_800_000_000

async function createProof(overrides: Partial<WalletControlProof> = {}) {
  const timestamp = overrides.timestamp ?? String(now)
  const chainId = overrides.chainId ?? 80002
  const address = (overrides.address ?? account.address) as `0x${string}`
  const nonce = overrides.nonce ?? '0'
  const signature = await account.signTypedData({
    domain: { name: 'ClobAuthDomain', version: '1', chainId },
    types: {
      ClobAuth: [
        { name: 'address', type: 'address' },
        { name: 'timestamp', type: 'string' },
        { name: 'nonce', type: 'uint256' },
        { name: 'message', type: 'string' },
      ],
    },
    primaryType: 'ClobAuth',
    message: {
      address,
      timestamp,
      nonce: BigInt(nonce),
      message: 'This message attests that I control the given wallet',
    },
  })
  return { address, timestamp, nonce, chainId, signature, ...overrides }
}

describe('wallet control proof', () => {
  it('accepts a current signature and normalizes the replay hash identity', async () => {
    const proof = await createProof()
    const first = await verifyWalletControlProof({
      proof,
      expectedWallet: account.address.toLowerCase(),
      expectedChainId: 80002,
      nowSeconds: now,
    })
    const second = await verifyWalletControlProof({
      proof: { ...proof, address: account.address.toLowerCase() },
      expectedWallet: account.address,
      expectedChainId: 80002,
      nowSeconds: now,
    })
    expect(first.address).toBe(account.address.toLowerCase())
    expect(first.proofHash).toBe(second.proofHash)
    expect(first.expiresAt).toBe(
      new Date((now + WALLET_PROOF_MAX_AGE_SECONDS) * 1_000).toISOString(),
    )
  })

  it('rejects expired, future, wrong-wallet, wrong-chain and unsupported nonce proofs', async () => {
    const proof = await createProof()
    await expect(
      verifyWalletControlProof({
        proof: { ...proof, timestamp: String(now - WALLET_PROOF_MAX_AGE_SECONDS - 1) },
        expectedWallet: account.address,
        expectedChainId: 80002,
        nowSeconds: now,
      }),
    ).rejects.toThrow('expired')
    await expect(
      verifyWalletControlProof({
        proof: { ...proof, timestamp: String(now + 301) },
        expectedWallet: account.address,
        expectedChainId: 80002,
        nowSeconds: now,
      }),
    ).rejects.toThrow('expired')
    await expect(
      verifyWalletControlProof({
        proof,
        expectedWallet: `0x${'2'.repeat(40)}`,
        expectedChainId: 80002,
        nowSeconds: now,
      }),
    ).rejects.toThrow('does not match')
    await expect(
      verifyWalletControlProof({
        proof,
        expectedWallet: account.address,
        expectedChainId: 137,
        nowSeconds: now,
      }),
    ).rejects.toThrow('chain')
    await expect(
      verifyWalletControlProof({
        proof: { ...proof, nonce: '1' },
        expectedWallet: account.address,
        expectedChainId: 80002,
        nowSeconds: now,
      }),
    ).rejects.toThrow('nonce')
  })

  it('lets the UI reject proofs that are valid but too close to expiry', async () => {
    const proof = await createProof({
      timestamp: String(now - WALLET_PROOF_MAX_AGE_SECONDS + 30),
    })
    expect(isWalletProofFresh(proof, now)).toBe(true)
    expect(isWalletProofFresh(proof, now, 60)).toBe(false)
  })
})
