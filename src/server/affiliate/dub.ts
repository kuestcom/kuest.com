import { Dub } from 'dub'
import { DUB_CURRENCY, DUB_LEAD_EVENT, DUB_PAYMENT_PROCESSOR, DUB_SALE_EVENT } from './constants'
import type { DubTracker } from './types'

export function createDubTracker(apiKey: string): DubTracker {
  if (!apiKey) throw new Error('DUB_API_KEY is not configured.')
  const dub = new Dub({ token: apiKey })
  return {
    trackLead(input) {
      return dub.track.lead({
        clickId: input.clickId,
        eventName: DUB_LEAD_EVENT,
        customerExternalId: input.operatorWallet,
        customerName: input.operatorName,
        customerEmail: input.operatorEmail,
        metadata: input.metadata,
        mode: 'wait',
      })
    },
    trackSale(input) {
      return dub.track.sale({
        customerExternalId: input.operatorWallet,
        amount: input.amountCents,
        currency: DUB_CURRENCY,
        eventName: DUB_SALE_EVENT,
        paymentProcessor: DUB_PAYMENT_PROCESSOR,
        invoiceId: input.invoiceId,
        leadEventName: DUB_LEAD_EVENT,
        metadata: input.metadata,
      })
    },
    async findCommission(invoiceId) {
      const pages = await dub.commissions.list({ invoiceId, pageSize: 1 })
      for await (const page of pages) return page.result[0] || null
      return null
    },
  }
}
