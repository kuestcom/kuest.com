import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const mocks = vi.hoisted(() => ({
  lead: vi.fn(),
  sale: vi.fn(),
  list: vi.fn(),
}))

vi.mock('dub', () => ({
  Dub: class {
    track = { lead: mocks.lead, sale: mocks.sale }
    commissions = { list: mocks.list }
  },
}))

import { createDubTracker } from './dub'

describe('Dub server integration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the exact lead and gross sale API contracts from dub 0.73.1', async () => {
    const operatorWallet = `0x${'1'.repeat(40)}`
    mocks.lead.mockResolvedValue({ customer: { externalId: operatorWallet } })
    mocks.sale.mockResolvedValue({ sale: { invoiceId: 'invoice-1' } })
    const tracker = createDubTracker('secret')
    await tracker.trackLead({
      clickId: 'click-1',
      operatorWallet,
      operatorName: 'Operator',
      operatorEmail: 'operator@example.com',
      metadata: { depositWallet: '0xwallet' },
    })
    await tracker.trackSale({
      operatorWallet,
      amountCents: 10_000,
      invoiceId: 'invoice-1',
      metadata: { txHash: '0xtx' },
    })
    expect(mocks.lead).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Prediction Market Launched',
        customerExternalId: operatorWallet,
        clickId: 'click-1',
        mode: 'wait',
      }),
    )
    expect(mocks.sale).toHaveBeenCalledWith({
      customerExternalId: operatorWallet,
      amount: 10_000,
      currency: 'USD',
      eventName: 'Trading Fees Received',
      paymentProcessor: 'custom',
      invoiceId: 'invoice-1',
      leadEventName: 'Prediction Market Launched',
      metadata: { txHash: '0xtx' },
    })
  })

  it('propagates a temporary Dub failure to the durable retry outbox', async () => {
    mocks.sale.mockRejectedValue(new Error('rate limited'))
    await expect(
      createDubTracker('secret').trackSale({
        operatorWallet: `0x${'1'.repeat(40)}`,
        amountCents: 100,
        invoiceId: 'invoice-1',
        metadata: {},
      }),
    ).rejects.toThrow('rate limited')
  })
})
