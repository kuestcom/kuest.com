import { describe, expect, it, vi } from 'vite-plus/test'
import { deliverPendingLead } from './lead'
import { completeOperatorAttribution, markOperatorLaunchFailed } from './repository'
import type { DubTracker } from './types'

type Statement = { query: string; values: unknown[] }

function createLeadDb() {
  const operatorWallet = `0x${'1'.repeat(40)}`
  let status = 'lead_pending'
  let leaseId: string | null = null
  let attempts = 0
  let dubCustomerId: string | null = null

  const statement = (query: string, values: unknown[] = []): D1PreparedStatement =>
    ({
      query,
      values,
      bind: (...nextValues: unknown[]) => statement(query, nextValues),
      async first() {
        if (!query.includes('RETURNING operator_wallet')) return null
        if (status !== 'lead_pending') return null
        status = 'lead_sending'
        leaseId = String(values[0])
        attempts += 1
        return {
          operator_wallet: operatorWallet,
          operator_email: 'operator@example.com',
          operator_name: 'Operator',
          deposit_wallet: `0x${'2'.repeat(40)}`,
          first_project_id: 'project-1',
          chain_id: 80002,
          dub_click_id: 'click-1',
          lead_attempts: attempts,
        }
      },
      async run() {
        return { success: true, results: [], meta: { changes: 0 } }
      },
      async all() {
        return { success: true, results: [], meta: { changes: 0 } }
      },
    }) as D1PreparedStatement

  const db = {
    prepare: (query: string) => statement(query),
    async batch(statements: D1PreparedStatement[]) {
      const update = statements[0] as unknown as Statement
      if (update.query.includes("attribution_status = 'active'")) {
        const expectedLease = String(update.values.at(-1))
        if (status === 'lead_sending' && leaseId === expectedLease) {
          status = 'active'
          dubCustomerId = String(update.values[0])
          leaseId = null
        }
      }
      return statements.map(() => ({ success: true, results: [], meta: { changes: 1 } }))
    },
  } as unknown as D1Database

  return {
    db,
    operatorWallet,
    state: () => ({ status, attempts, dubCustomerId }),
  }
}

describe('affiliate lead delivery', () => {
  it('leases a pending lead so concurrent launch and Cron delivery call Dub only once', async () => {
    const database = createLeadDb()
    const trackLead = vi.fn().mockResolvedValue({
      customer: { externalId: database.operatorWallet },
    })
    const dub = {
      trackLead,
      trackSale: vi.fn(),
      findCommission: vi.fn(),
    } satisfies DubTracker
    const input = {
      db: database.db,
      dub,
      operatorWallet: database.operatorWallet,
      chainId: 80002,
      maxAttempts: 1,
    }

    const results = await Promise.all([deliverPendingLead(input), deliverPendingLead(input)])

    expect(results.filter(Boolean)).toHaveLength(1)
    expect(trackLead).toHaveBeenCalledOnce()
    expect(database.state()).toEqual({
      status: 'active',
      attempts: 1,
      dubCustomerId: database.operatorWallet,
    })
  })

  it('keeps a failed post-persistence launch recoverable without demoting active operators', async () => {
    let status = 'provisioning'
    const db = {
      prepare(query: string) {
        return {
          bind() {
            return {
              async run() {
                if (query.includes("SET attribution_status = 'launch_failed'")) {
                  if (status !== 'provisioning') {
                    return { success: true, results: [], meta: { changes: 0 } }
                  }
                  status = 'launch_failed'
                  return { success: true, results: [], meta: { changes: 1 } }
                }
                if (query.includes("IN ('provisioning', 'launch_failed')")) {
                  if (!['provisioning', 'launch_failed'].includes(status)) {
                    return { success: true, results: [], meta: { changes: 0 } }
                  }
                  status = 'lead_pending'
                  return { success: true, results: [], meta: { changes: 1 } }
                }
                return { success: true, results: [], meta: { changes: 0 } }
              },
            }
          },
        }
      },
    } as unknown as D1Database

    await markOperatorLaunchFailed(db, `0x${'1'.repeat(40)}`, 80002)
    expect(status).toBe('launch_failed')
    expect(await completeOperatorAttribution(db, `0x${'1'.repeat(40)}`, 80002)).toBe(true)
    expect(status).toBe('lead_pending')

    status = 'active'
    await markOperatorLaunchFailed(db, `0x${'1'.repeat(40)}`, 80002)
    expect(status).toBe('active')
  })
})
