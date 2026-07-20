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

export function compareDubCommission(
  invoiceId: string,
  saleCents: number,
  commission: { invoiceId?: string | null; saleAmount?: number | null } | null,
) {
  if (commission?.invoiceId !== invoiceId) return 'missing' as const
  if (commission.saleAmount != null && commission.saleAmount !== saleCents)
    return 'mismatch' as const
  return 'matched' as const
}
