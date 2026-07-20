export function deterministicInvoiceId(params: {
  chainId: number
  operatorWallet: string
  txHash: string
}) {
  return `${params.chainId}:${params.operatorWallet.toLowerCase()}:${params.txHash.toLowerCase()}`
}

export function retryDelayMs(attempt: number, random = Math.random()) {
  const base = Math.min(43_200_000, 1_000 * 2 ** Math.max(0, attempt - 1))
  return base + Math.floor(random * Math.max(1, base / 4))
}

export function retryAt(attempt: number, nowMs = Date.now(), random = Math.random()) {
  return new Date(nowMs + retryDelayMs(attempt, random)).toISOString()
}

export function confirmedSafeBlockNumber(params: {
  latestBlockNumber: number
  confirmations: number
  startBlock: number
}) {
  const safeBlockNumber = params.latestBlockNumber - params.confirmations
  return safeBlockNumber >= params.startBlock ? safeBlockNumber : null
}
