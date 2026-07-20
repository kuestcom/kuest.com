import { verifyTypedData, type Address, type Hex } from 'viem'
import type { WalletControlProof } from '../../lib/launch-types'
import { isWalletProofFresh, WALLET_PROOF_MAX_AGE_SECONDS } from '../../lib/wallet-proof'

const MESSAGE = 'This message attests that I control the given wallet'

async function hashText(value: string) {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
  )
  return `sha256:${Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

export async function verifyWalletControlProof(params: {
  proof: WalletControlProof
  expectedWallet: string
  expectedChainId: number
  nowSeconds?: number
}) {
  const address = params.proof.address.toLowerCase()
  if (address !== params.expectedWallet.toLowerCase()) {
    throw new Error('Wallet proof does not match KUEST_ADDRESS.')
  }
  if (params.proof.chainId !== params.expectedChainId) {
    throw new Error('Wallet proof chain does not match the configured launch chain.')
  }
  if (params.proof.nonce !== '0') throw new Error('Wallet proof nonce is not supported.')
  const timestamp = Number(params.proof.timestamp)
  const now = params.nowSeconds ?? Math.floor(Date.now() / 1_000)
  if (!isWalletProofFresh(params.proof, now)) {
    throw new Error('Wallet proof is expired or has an invalid timestamp.')
  }
  const valid = await verifyTypedData({
    address: address as Address,
    domain: {
      name: 'ClobAuthDomain',
      version: '1',
      chainId: params.proof.chainId,
    },
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
      address: address as Address,
      timestamp: params.proof.timestamp,
      nonce: 0n,
      message: MESSAGE,
    },
    signature: params.proof.signature as Hex,
  })
  if (!valid) throw new Error('Wallet control signature is invalid.')
  const canonical = JSON.stringify({
    address,
    signature: params.proof.signature.toLowerCase(),
    timestamp: params.proof.timestamp,
    nonce: params.proof.nonce,
    chainId: params.proof.chainId,
  })
  return {
    address,
    proofHash: await hashText(canonical),
    expiresAt: new Date((timestamp + WALLET_PROOF_MAX_AGE_SECONDS) * 1_000).toISOString(),
  }
}
