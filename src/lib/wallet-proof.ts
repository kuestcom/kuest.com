import type { WalletControlProof } from './launch-types'

export const WALLET_PROOF_MAX_AGE_SECONDS = 24 * 60 * 60
export const WALLET_PROOF_MAX_FUTURE_SKEW_SECONDS = 5 * 60

export function isWalletProofFresh(
  proof: Pick<WalletControlProof, 'timestamp'>,
  nowSeconds = Math.floor(Date.now() / 1_000),
  minimumRemainingSeconds = 0,
) {
  const timestamp = Number(proof.timestamp)
  return (
    Number.isSafeInteger(timestamp) &&
    timestamp <= nowSeconds + WALLET_PROOF_MAX_FUTURE_SKEW_SECONDS &&
    timestamp >= nowSeconds - WALLET_PROOF_MAX_AGE_SECONDS + minimumRemainingSeconds
  )
}
