import { describe, expect, it } from 'vite-plus/test'
import { createFeeBatches } from './processor'

type TestStatement = D1PreparedStatement & { query: string; values: unknown[] }

function createBatchDb() {
  const operatorWallet = `0x${'1'.repeat(40)}`
  const row = {
    operator_wallet: operatorWallet,
    chain_id: 80002,
    tx_hash: `0x${'a'.repeat(64)}`,
    event_timestamp: 1_800_000_000,
    amount_raw: '12500',
    has_builder_fee: 1,
    has_affiliate_fee: 0,
  }
  let sourceStatus = 'observed'
  let leaseId: string | null = null
  let remainderRaw = '0'
  let grossFeeRaw = '0'
  let grossFeeCents = 0
  const batches = new Set<string>()

  const statement = (query: string, values: unknown[] = []): TestStatement =>
    ({
      query,
      values,
      bind: (...nextValues: unknown[]) => statement(query, nextValues),
      async all() {
        if (query.includes('FROM affiliate_operator_fee_transactions operator_fee')) {
          return {
            success: true,
            results: sourceStatus === 'observed' ? [row] : [],
            meta: { changes: 0 },
          }
        }
        return { success: true, results: [], meta: { changes: 0 } }
      },
      async first() {
        if (query.includes('RETURNING rounding_remainder_raw')) {
          if (leaseId) return null
          leaseId = String(values[0])
          return {
            rounding_remainder_raw: remainderRaw,
            gross_fee_raw: grossFeeRaw,
            gross_fee_cents: grossFeeCents,
          }
        }
        if (query.includes('SELECT id FROM affiliate_fee_batches')) {
          return batches.has(String(values[0])) ? { id: 'existing' } : null
        }
        return null
      },
      async run() {
        if (query.includes('SET fee_batch_lease_id = NULL') && leaseId === values[3]) {
          leaseId = null
          return { success: true, results: [], meta: { changes: 1 } }
        }
        if (query.includes("SET status = 'batched'")) sourceStatus = 'batched'
        return { success: true, results: [], meta: { changes: 1 } }
      },
    }) as TestStatement

  const db = {
    prepare: (query: string) => statement(query),
    async batch(statements: D1PreparedStatement[]) {
      const [insert, sourceUpdate, attributionUpdate] = statements as TestStatement[]
      const invoiceId = String(insert.values[1])
      if (batches.has(invoiceId)) throw new Error('UNIQUE constraint failed')
      if (leaseId !== attributionUpdate.values.at(-1)) throw new Error('Affiliate lease was lost')
      batches.add(invoiceId)
      sourceStatus = 'batched'
      remainderRaw = String(attributionUpdate.values[0])
      grossFeeRaw = String(attributionUpdate.values[1])
      grossFeeCents = Number(attributionUpdate.values[2])
      expect(sourceUpdate.query).toContain("status = 'observed'")
      return statements.map(() => ({ success: true, results: [], meta: { changes: 1 } }))
    },
  } as unknown as D1Database

  return {
    db,
    state: () => ({ sourceStatus, leaseId, remainderRaw, grossFeeRaw, grossFeeCents, batches }),
  }
}

describe('affiliate fee batching', () => {
  it('serializes concurrent batches per operator and updates carried totals once', async () => {
    const database = createBatchDb()

    await Promise.all([
      createFeeBatches(database.db, 80002, 6, 100),
      createFeeBatches(database.db, 80002, 6, 100),
    ])

    const state = database.state()
    expect(state.batches.size).toBe(1)
    expect(state).toMatchObject({
      sourceStatus: 'batched',
      leaseId: null,
      remainderRaw: '2500',
      grossFeeRaw: '12500',
      grossFeeCents: 1,
    })
  })
})
