import type { DubTracker } from './types'
import { nowIso } from './repository'
import { retryDelayMs } from './logic'

type LeadRow = {
  operator_wallet: string
  operator_email: string
  operator_name: string
  deposit_wallet: string
  first_project_id: string
  chain_id: number
  dub_click_id: string
  lead_attempts: number
}

function retryAt(attempt: number) {
  return new Date(Date.now() + retryDelayMs(attempt)).toISOString()
}

export async function deliverPendingLead(params: {
  db: D1Database
  dub?: DubTracker
  operatorWallet: string
  chainId: number
  maxAttempts: number
  dryRun?: boolean
}) {
  const row = await params.db
    .prepare(
      `SELECT operator_wallet, operator_email, operator_name, deposit_wallet, first_project_id,
            chain_id, dub_click_id, lead_attempts
       FROM affiliate_operator_attributions
      WHERE operator_wallet = ? AND chain_id = ? AND attribution_status = 'lead_pending'`,
    )
    .bind(params.operatorWallet.toLowerCase(), params.chainId)
    .first<LeadRow>()
  if (!row) return false
  const request = {
    clickId: row.dub_click_id,
    operatorWallet: row.operator_wallet,
    operatorName: row.operator_name,
    operatorEmail: row.operator_email,
    metadata: {
      operatorWallet: row.operator_wallet,
      depositWallet: row.deposit_wallet,
      chainId: row.chain_id,
      firstProjectId: row.first_project_id,
    },
  }
  const now = nowIso()
  const requestJson = JSON.stringify(request)
  if (params.dryRun) {
    await params.db
      .prepare(
        `UPDATE affiliate_operator_attributions SET lead_payload_json = ?, updated_at = ?
        WHERE operator_wallet = ? AND chain_id = ? AND attribution_status = 'lead_pending'
          AND (lead_payload_json IS NULL OR lead_payload_json != ?)`,
      )
      .bind(requestJson, now, row.operator_wallet, row.chain_id, requestJson)
      .run()
    return false
  }
  if (!params.dub) throw new Error('Dub tracker is required when affiliate dry-run is disabled.')
  const attempt = row.lead_attempts + 1
  try {
    const response = await params.dub.trackLead(request)
    const customer = (response as { customer?: { id?: string } } | null)?.customer
    await params.db.batch([
      params.db
        .prepare(
          `UPDATE affiliate_operator_attributions
            SET attribution_status = 'active', dub_customer_id = ?, lead_payload_json = ?,
                lead_response_json = ?, lead_attempts = ?, lead_last_error = NULL,
                lead_next_attempt_at = NULL, updated_at = ?
          WHERE operator_wallet = ? AND chain_id = ? AND attribution_status = 'lead_pending'`,
        )
        .bind(
          customer?.id || null,
          requestJson,
          JSON.stringify(response),
          attempt,
          now,
          row.operator_wallet,
          row.chain_id,
        ),
      params.db
        .prepare(
          `INSERT INTO affiliate_delivery_attempts
           (id, target_type, target_id, attempt_number, request_json, response_json, created_at)
         VALUES (?, 'lead', ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          `${row.chain_id}:${row.operator_wallet}`,
          attempt,
          requestJson,
          JSON.stringify(response),
          now,
        ),
    ])
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1_000) : 'Dub lead failed.'
    const dead = attempt >= params.maxAttempts
    const next = dead ? null : retryAt(attempt)
    await params.db.batch([
      params.db
        .prepare(
          `UPDATE affiliate_operator_attributions
            SET attribution_status = ?, lead_payload_json = ?, lead_attempts = ?, lead_last_error = ?,
                lead_next_attempt_at = ?, updated_at = ?
          WHERE operator_wallet = ? AND chain_id = ?`,
        )
        .bind(
          dead ? 'dead_letter' : 'lead_pending',
          requestJson,
          attempt,
          message,
          next,
          now,
          row.operator_wallet,
          row.chain_id,
        ),
      params.db
        .prepare(
          `INSERT INTO affiliate_delivery_attempts
           (id, target_type, target_id, attempt_number, request_json, error, retry_at, created_at)
         VALUES (?, 'lead', ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          `${row.chain_id}:${row.operator_wallet}`,
          attempt,
          requestJson,
          message,
          next,
          now,
        ),
    ])
    return false
  }
}

export async function deliverLeadOutbox(params: {
  db: D1Database
  dub?: DubTracker
  maxAttempts: number
  limit: number
  dryRun?: boolean
}) {
  const rows = await params.db
    .prepare(
      `SELECT operator_wallet, chain_id FROM affiliate_operator_attributions
      WHERE attribution_status = 'lead_pending'
        AND (lead_next_attempt_at IS NULL OR lead_next_attempt_at <= ?)
        ${params.dryRun ? 'AND lead_payload_json IS NULL' : ''}
      ORDER BY created_at LIMIT ?`,
    )
    .bind(nowIso(), params.limit)
    .all<{ operator_wallet: string; chain_id: number }>()
  for (const row of rows.results || []) {
    await deliverPendingLead({
      ...params,
      operatorWallet: row.operator_wallet,
      chainId: row.chain_id,
    })
  }
}
