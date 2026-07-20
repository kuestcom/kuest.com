export type FeeType = 'KUEST' | 'BUILDER' | 'AFFILIATE'

export interface FeeHistoryItem {
  amount: string
  feeType: FeeType
  txHash: string
  timestamp: number
}

export interface FeeHistoryPage {
  items: FeeHistoryItem[]
  nextCursor: string | null
  hasMore: boolean
}

export interface OperatorAttributionInput {
  operatorWallet: string
  operatorEmail: string
  operatorName: string
  depositWallet: string
  chainId: number
  dubClickId: string | null
  proofHash: string
  firstProjectId: string
}

export interface DubTracker {
  trackLead(input: {
    clickId: string
    operatorWallet: string
    operatorName: string
    operatorEmail: string
    metadata: Record<string, unknown>
  }): Promise<unknown>
  trackSale(input: {
    operatorWallet: string
    amountCents: number
    invoiceId: string
    metadata: Record<string, unknown>
  }): Promise<unknown>
  findCommission(invoiceId: string): Promise<{
    invoiceId?: string | null
    amount?: number
    earnings?: number
  } | null>
}
