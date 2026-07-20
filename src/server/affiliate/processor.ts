import { createDubTracker } from './dub'
import { deliverLeadOutbox } from './lead'
import { confirmedSafeBlockNumber, deterministicInvoiceId, retryAt } from './logic'
import { rawToCentsWithRemainder } from './money'
import { nowIso } from './repository'
import { fetchFeeHistoryPage, getBlockTimestamp } from './source'
import { getAffiliateConfig, type AffiliateWorkerEnv } from './constants'
import type { DubTracker, FeeHistoryItem, FeeType } from './types'

type OperatorRow = {
  operator_wallet: string
  deposit_wallet: string
  chain_id: number
}

export function operatorPageFromRows(rows: OperatorRow[], limit: number) {
  return { operators: rows.slice(0, limit), cycleComplete: rows.length <= limit }
}

type MatchRow = {
  operator_wallet: string
  chain_id: number
  tx_hash: string
  event_timestamp: number
  amount_raw: string
  has_builder_fee: number
  has_affiliate_fee: number
}

async function readCheckpoint(db: D1Database, streamKey: string, fallback: number) {
  const row = await db
    .prepare(`SELECT latest_timestamp FROM affiliate_source_checkpoints WHERE stream_key = ?`)
    .bind(streamKey)
    .first<{ latest_timestamp: number }>()
  return row?.latest_timestamp ?? fallback
}

async function writeCheckpoint(db: D1Database, streamKey: string, timestamp: number) {
  await db
    .prepare(
      `INSERT INTO affiliate_source_checkpoints (stream_key, latest_timestamp, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(stream_key) DO UPDATE SET
       latest_timestamp = excluded.latest_timestamp,
       updated_at = excluded.updated_at
     WHERE excluded.latest_timestamp > affiliate_source_checkpoints.latest_timestamp`,
    )
    .bind(streamKey, timestamp, nowIso())
    .run()
}

async function listOperatorsRoundRobin(db: D1Database, chainId: number, limit: number) {
  const stateKey = `operator-cursor:${chainId}`
  const state = await db
    .prepare(`SELECT state_value FROM affiliate_runtime_state WHERE state_key = ?`)
    .bind(stateKey)
    .first<{ state_value: string }>()
  const cursor = state?.state_value || ''
  const page = await db
    .prepare(
      `SELECT operator_wallet, deposit_wallet, chain_id
         FROM affiliate_operator_attributions
        WHERE chain_id = ? AND dub_click_id IS NOT NULL AND fee_processing_status = 'active'
          AND operator_wallet > ?
        ORDER BY operator_wallet LIMIT ?`,
    )
    .bind(chainId, cursor, limit + 1)
    .all<OperatorRow>()
  return { ...operatorPageFromRows(page.results || [], limit), stateKey }
}

async function saveOperatorCursor(db: D1Database, stateKey: string, operatorWallet: string) {
  await db
    .prepare(
      `INSERT INTO affiliate_runtime_state (state_key, state_value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(state_key) DO UPDATE SET
         state_value = excluded.state_value, updated_at = excluded.updated_at
       WHERE affiliate_runtime_state.state_value != excluded.state_value`,
    )
    .bind(stateKey, operatorWallet, nowIso())
    .run()
}

export async function loadHistoryWindow(params: {
  baseUrl: string
  address: string
  feeType: FeeType
  minimumTimestamp: number
  safeTimestamp: number
  maxPages: number
  fetcher?: typeof fetch
}) {
  const items: FeeHistoryItem[] = []
  let cursor: string | null = null
  let reachedBoundary = false
  for (let pageNumber = 0; pageNumber < params.maxPages; pageNumber += 1) {
    const page = await fetchFeeHistoryPage({
      baseUrl: params.baseUrl,
      address: params.address,
      feeType: params.feeType,
      cursor,
      fetcher: params.fetcher,
    })
    for (const item of page.items) {
      if (item.timestamp < params.minimumTimestamp) reachedBoundary = true
      if (item.timestamp >= params.minimumTimestamp && item.timestamp <= params.safeTimestamp)
        items.push(item)
    }
    if (!page.hasMore || !page.nextCursor || reachedBoundary) return items
    cursor = page.nextCursor
  }
  throw new Error(`Fee history backlog exceeded ${params.maxPages * 100} ${params.feeType} events.`)
}

async function syncOperatorHistory(params: {
  db: D1Database
  operator: OperatorRow
  baseUrl: string
  feeType: 'BUILDER' | 'AFFILIATE'
  startTimestamp: number
  safeTimestamp: number
  maxPages: number
}) {
  const streamKey = `${params.operator.chain_id}:${params.operator.operator_wallet}:${params.feeType}`
  const checkpoint = await readCheckpoint(params.db, streamKey, params.startTimestamp)
  const items = await loadHistoryWindow({
    baseUrl: params.baseUrl,
    address: params.operator.deposit_wallet,
    feeType: params.feeType,
    minimumTimestamp: Math.max(params.startTimestamp, checkpoint),
    safeTimestamp: params.safeTimestamp,
    maxPages: params.maxPages,
  })
  const grouped = new Map<string, FeeHistoryItem[]>()
  for (const item of items) grouped.set(item.txHash, [...(grouped.get(item.txHash) || []), item])
  const now = nowIso()
  const statements = Array.from(grouped.entries()).map(([txHash, rows]) => {
    const timestamp = Math.max(...rows.map((row) => row.timestamp))
    const builder = params.feeType === 'BUILDER' ? 1 : 0
    const affiliate = params.feeType === 'AFFILIATE' ? 1 : 0
    return params.db
      .prepare(
        `INSERT INTO affiliate_operator_fee_transactions (
         chain_id, operator_wallet, tx_hash, event_timestamp, has_builder_fee,
         has_affiliate_fee, status, source_payload_json, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, 'observed', ?, ?, ?)
       ON CONFLICT(chain_id, operator_wallet, tx_hash) DO UPDATE SET
         event_timestamp = MAX(event_timestamp, excluded.event_timestamp),
         has_builder_fee = MAX(has_builder_fee, excluded.has_builder_fee),
         has_affiliate_fee = MAX(has_affiliate_fee, excluded.has_affiliate_fee),
         source_payload_json = excluded.source_payload_json,
         updated_at = excluded.updated_at
       WHERE excluded.event_timestamp > event_timestamp
          OR excluded.has_builder_fee > has_builder_fee
          OR excluded.has_affiliate_fee > has_affiliate_fee`,
      )
      .bind(
        params.operator.chain_id,
        params.operator.operator_wallet,
        txHash,
        timestamp,
        builder,
        affiliate,
        JSON.stringify(rows),
        now,
        now,
      )
  })
  for (let offset = 0; offset < statements.length; offset += 100) {
    await params.db.batch(statements.slice(offset, offset + 100))
  }
  const highest = items.reduce((value, item) => Math.max(value, item.timestamp), checkpoint)
  if (highest > checkpoint) await writeCheckpoint(params.db, streamKey, highest)
}

async function syncKuestHistory(params: {
  db: D1Database
  chainId: number
  baseUrl: string
  receiver: string
  startTimestamp: number
  safeTimestamp: number
  maxPages: number
}) {
  const streamKey = `${params.chainId}:kuest`
  const checkpoint = await readCheckpoint(params.db, streamKey, params.startTimestamp)
  const items = await loadHistoryWindow({
    baseUrl: params.baseUrl,
    address: params.receiver,
    feeType: 'KUEST',
    minimumTimestamp: Math.max(params.startTimestamp, checkpoint),
    safeTimestamp: params.safeTimestamp,
    maxPages: params.maxPages,
  })
  const grouped = new Map<string, FeeHistoryItem[]>()
  for (const item of items) grouped.set(item.txHash, [...(grouped.get(item.txHash) || []), item])
  const now = nowIso()
  const statements = Array.from(grouped.entries()).map(([txHash, rows]) => {
    const amount = rows.reduce((sum, row) => sum + BigInt(row.amount), 0n).toString()
    const timestamp = Math.max(...rows.map((row) => row.timestamp))
    return params.db
      .prepare(
        `INSERT INTO affiliate_kuest_fee_transactions (
         chain_id, tx_hash, event_timestamp, amount_raw, source_payload_json, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(chain_id, tx_hash) DO UPDATE SET
         event_timestamp = excluded.event_timestamp,
         amount_raw = excluded.amount_raw,
         source_payload_json = excluded.source_payload_json,
         updated_at = excluded.updated_at
       WHERE excluded.event_timestamp != event_timestamp OR excluded.amount_raw != amount_raw`,
      )
      .bind(params.chainId, txHash, timestamp, amount, JSON.stringify(rows), now, now)
  })
  for (let offset = 0; offset < statements.length; offset += 100) {
    await params.db.batch(statements.slice(offset, offset + 100))
  }
  const highest = items.reduce((value, item) => Math.max(value, item.timestamp), checkpoint)
  if (highest > checkpoint) await writeCheckpoint(params.db, streamKey, highest)
}

async function quarantineAmbiguousTransactions(db: D1Database, chainId: number) {
  const rows = await db
    .prepare(
      `SELECT tx_hash, GROUP_CONCAT(DISTINCT operator_wallet) AS operators
       FROM affiliate_operator_fee_transactions
      WHERE chain_id = ?
        AND tx_hash IN (
          SELECT tx_hash FROM affiliate_operator_fee_transactions
           WHERE chain_id = ? AND status = 'observed'
        )
      GROUP BY tx_hash HAVING COUNT(DISTINCT operator_wallet) > 1
      LIMIT 100`,
    )
    .bind(chainId, chainId)
    .all<{ tx_hash: string; operators: string }>()
  for (const row of rows.results || []) {
    const now = nowIso()
    const operators = row.operators.split(',')
    const statements = [
      db
        .prepare(
          `UPDATE affiliate_operator_fee_transactions SET status = 'manual_review', updated_at = ?
          WHERE chain_id = ? AND tx_hash = ?`,
        )
        .bind(now, chainId, row.tx_hash),
      db
        .prepare(
          `INSERT OR IGNORE INTO affiliate_reconciliations
           (id, reconciliation_type, status, details_json, created_at, updated_at)
         VALUES (?, 'ambiguous_operator_transaction', 'manual_review', ?, ?, ?)`,
        )
        .bind(
          `ambiguous:${chainId}:${row.tx_hash}`,
          JSON.stringify({ chainId, txHash: row.tx_hash, operators }),
          now,
          now,
        ),
      ...operators.map((operator) =>
        db
          .prepare(
            `UPDATE affiliate_operator_attributions SET fee_processing_status = 'manual_review', updated_at = ?
          WHERE chain_id = ? AND operator_wallet = ?`,
          )
          .bind(now, chainId, operator),
      ),
    ]
    await db.batch(statements)
  }
}

type FeeBatchLease = {
  leaseId: string
  roundingRemainderRaw: string
  grossFeeRaw: string
  grossFeeCents: number
}

async function claimFeeBatchLease(db: D1Database, row: MatchRow): Promise<FeeBatchLease | null> {
  const leaseId = crypto.randomUUID()
  const now = nowIso()
  const leaseUntil = new Date(Date.now() + 15 * 60_000).toISOString()
  const attribution = await db
    .prepare(
      `UPDATE affiliate_operator_attributions
          SET fee_batch_lease_id = ?, fee_batch_lease_until = ?, updated_at = ?
        WHERE operator_wallet = ? AND chain_id = ? AND fee_processing_status = 'active'
          AND (fee_batch_lease_until IS NULL OR fee_batch_lease_until <= ?)
      RETURNING rounding_remainder_raw, gross_fee_raw, gross_fee_cents`,
    )
    .bind(leaseId, leaseUntil, now, row.operator_wallet, row.chain_id, now)
    .first<{
      rounding_remainder_raw: string
      gross_fee_raw: string
      gross_fee_cents: number
    }>()
  return attribution
    ? {
        leaseId,
        roundingRemainderRaw: attribution.rounding_remainder_raw,
        grossFeeRaw: attribution.gross_fee_raw,
        grossFeeCents: attribution.gross_fee_cents,
      }
    : null
}

async function releaseFeeBatchLease(db: D1Database, row: MatchRow, leaseId: string) {
  await db
    .prepare(
      `UPDATE affiliate_operator_attributions
          SET fee_batch_lease_id = NULL, fee_batch_lease_until = NULL, updated_at = ?
        WHERE operator_wallet = ? AND chain_id = ? AND fee_batch_lease_id = ?`,
    )
    .bind(nowIso(), row.operator_wallet, row.chain_id, leaseId)
    .run()
}

export async function createFeeBatches(
  db: D1Database,
  chainId: number,
  tokenDecimals: number,
  limit: number,
) {
  const rows = await db
    .prepare(
      `SELECT operator_fee.operator_wallet, operator_fee.chain_id, operator_fee.tx_hash,
            operator_fee.event_timestamp, operator_fee.has_builder_fee,
            operator_fee.has_affiliate_fee, kuest_fee.amount_raw
       FROM affiliate_operator_fee_transactions operator_fee
       JOIN affiliate_kuest_fee_transactions kuest_fee
         ON kuest_fee.chain_id = operator_fee.chain_id AND kuest_fee.tx_hash = operator_fee.tx_hash
       JOIN affiliate_operator_attributions attribution
         ON attribution.chain_id = operator_fee.chain_id
        AND attribution.operator_wallet = operator_fee.operator_wallet
      WHERE operator_fee.chain_id = ? AND operator_fee.status = 'observed'
        AND attribution.dub_click_id IS NOT NULL
        AND attribution.fee_processing_status = 'active'
      ORDER BY operator_fee.operator_wallet, operator_fee.event_timestamp, operator_fee.tx_hash
      LIMIT ?`,
    )
    .bind(chainId, limit)
    .all<MatchRow>()

  const grouped = new Map<string, MatchRow[]>()
  for (const row of rows.results || []) {
    const key = `${row.chain_id}:${row.operator_wallet}`
    grouped.set(key, [...(grouped.get(key) || []), row])
  }

  for (const operatorRows of grouped.values()) {
    const firstRow = operatorRows[0]
    const lease = await claimFeeBatchLease(db, firstRow)
    if (!lease) continue
    let remainderRaw = lease.roundingRemainderRaw
    let grossFeeRaw = lease.grossFeeRaw
    let grossFeeCents = lease.grossFeeCents
    try {
      for (const row of operatorRows) {
        const invoiceId = deterministicInvoiceId({
          chainId: row.chain_id,
          operatorWallet: row.operator_wallet,
          txHash: row.tx_hash,
        })
        const existing = await db
          .prepare(`SELECT id FROM affiliate_fee_batches WHERE invoice_id = ?`)
          .bind(invoiceId)
          .first<{ id: string }>()
        const now = nowIso()
        if (existing) {
          await db
            .prepare(
              `UPDATE affiliate_operator_fee_transactions SET status = 'batched', updated_at = ?
                WHERE chain_id = ? AND operator_wallet = ? AND tx_hash = ?
                  AND status = 'observed'`,
            )
            .bind(now, row.chain_id, row.operator_wallet, row.tx_hash)
            .run()
          continue
        }
        const converted = rawToCentsWithRemainder({
          amountRaw: row.amount_raw,
          decimals: tokenDecimals,
          remainderRaw,
        })
        const nextGrossFeeRaw = (BigInt(grossFeeRaw) + BigInt(row.amount_raw)).toString()
        const nextGrossFeeCents = grossFeeCents + converted.cents
        const metadata = {
          operatorWallet: row.operator_wallet,
          chainId: row.chain_id,
          txHash: row.tx_hash,
          timestamp: row.event_timestamp,
          feeTypes: [
            row.has_builder_fee ? 'BUILDER' : null,
            row.has_affiliate_fee ? 'AFFILIATE' : null,
          ].filter(Boolean),
          grossKuestFeeRaw: row.amount_raw,
          tokenDecimals,
        }
        const payload = {
          operatorWallet: row.operator_wallet,
          amountCents: converted.cents,
          invoiceId,
          metadata,
        }
        const status = converted.cents > 0 ? 'pending' : 'below_minimum'
        await db.batch([
          db
            .prepare(
              `INSERT INTO affiliate_fee_batches (
               id, invoice_id, operator_wallet, chain_id, tx_hash, event_timestamp,
               amount_raw, token_decimals, amount_cents, remainder_in_raw, remainder_out_raw,
               dub_payload_json, status, created_at, updated_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              crypto.randomUUID(),
              invoiceId,
              row.operator_wallet,
              row.chain_id,
              row.tx_hash,
              row.event_timestamp,
              row.amount_raw,
              tokenDecimals,
              converted.cents,
              remainderRaw,
              converted.remainderRaw,
              JSON.stringify(payload),
              status,
              now,
              now,
            ),
          db
            .prepare(
              `UPDATE affiliate_operator_fee_transactions SET status = 'batched', updated_at = ?
                WHERE chain_id = ? AND operator_wallet = ? AND tx_hash = ?
                  AND status = 'observed'`,
            )
            .bind(now, row.chain_id, row.operator_wallet, row.tx_hash),
          db
            .prepare(
              `UPDATE affiliate_operator_attributions
                  SET rounding_remainder_raw = ?, gross_fee_raw = ?, gross_fee_cents = ?,
                      updated_at = ?
                WHERE operator_wallet = ? AND chain_id = ? AND fee_processing_status = 'active'
                  AND fee_batch_lease_id = ?`,
            )
            .bind(
              converted.remainderRaw,
              nextGrossFeeRaw,
              nextGrossFeeCents,
              now,
              row.operator_wallet,
              row.chain_id,
              lease.leaseId,
            ),
        ])
        remainderRaw = converted.remainderRaw
        grossFeeRaw = nextGrossFeeRaw
        grossFeeCents = nextGrossFeeCents
      }
    } finally {
      await releaseFeeBatchLease(db, firstRow, lease.leaseId)
    }
  }
}

async function prepareDryRunBatches(db: D1Database, limit: number) {
  const now = nowIso()
  await db
    .prepare(
      `UPDATE affiliate_fee_batches SET dry_run_prepared_at = ?, updated_at = ?
      WHERE id IN (
        SELECT id FROM affiliate_fee_batches
         WHERE status = 'pending' AND dry_run_prepared_at IS NULL
         ORDER BY created_at LIMIT ?
      )`,
    )
    .bind(now, now, limit)
    .run()
}

async function deliverSales(params: {
  db: D1Database
  dub: DubTracker
  limit: number
  maxAttempts: number
}) {
  const rows = await params.db
    .prepare(
      `SELECT batch.id, batch.invoice_id, batch.operator_wallet, batch.chain_id,
            batch.tx_hash, batch.amount_cents, batch.dub_payload_json, batch.attempts
       FROM affiliate_fee_batches batch
       JOIN affiliate_operator_attributions attribution
         ON attribution.operator_wallet = batch.operator_wallet AND attribution.chain_id = batch.chain_id
      WHERE batch.status IN ('pending', 'retry', 'sending')
        AND (batch.next_attempt_at IS NULL OR batch.next_attempt_at <= ?)
        AND attribution.attribution_status = 'active'
        AND attribution.fee_processing_status = 'active'
      ORDER BY batch.created_at LIMIT ?`,
    )
    .bind(nowIso(), params.limit)
    .all<{
      id: string
      invoice_id: string
      operator_wallet: string
      chain_id: number
      tx_hash: string
      amount_cents: number
      dub_payload_json: string
      attempts: number
    }>()

  for (const row of rows.results || []) {
    const leaseUntil = new Date(Date.now() + 15 * 60_000).toISOString()
    const claimed = await params.db
      .prepare(
        `UPDATE affiliate_fee_batches SET status = 'sending', next_attempt_at = ?, updated_at = ?
        WHERE id = ? AND status IN ('pending', 'retry', 'sending')
          AND (next_attempt_at IS NULL OR next_attempt_at <= ?)`,
      )
      .bind(leaseUntil, nowIso(), row.id, nowIso())
      .run()
    if (!claimed.meta.changes) continue
    const attempt = row.attempts + 1
    const request = JSON.parse(row.dub_payload_json) as {
      operatorWallet: string
      amountCents: number
      invoiceId: string
      metadata: Record<string, unknown>
    }
    try {
      const existing = await params.dub.findCommission(row.invoice_id)
      const response = existing || (await params.dub.trackSale(request))
      const now = nowIso()
      await params.db.batch([
        params.db
          .prepare(
            `UPDATE affiliate_fee_batches
              SET status = 'delivered', dub_response_json = ?, attempts = ?,
                  next_attempt_at = NULL, last_error = NULL, updated_at = ? WHERE id = ?`,
          )
          .bind(JSON.stringify(response), attempt, now, row.id),
        params.db
          .prepare(
            `UPDATE affiliate_operator_fee_transactions SET status = 'delivered', updated_at = ?
            WHERE chain_id = ? AND operator_wallet = ? AND tx_hash = ?`,
          )
          .bind(now, row.chain_id, row.operator_wallet, row.tx_hash),
        params.db
          .prepare(
            `INSERT INTO affiliate_delivery_attempts
             (id, target_type, target_id, attempt_number, request_json, response_json, created_at)
           VALUES (?, 'sale', ?, ?, ?, ?, ?)`,
          )
          .bind(
            crypto.randomUUID(),
            row.id,
            attempt,
            row.dub_payload_json,
            JSON.stringify(response),
            now,
          ),
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 1_000) : 'Dub sale failed.'
      const dead = attempt >= params.maxAttempts
      const next = dead ? null : retryAt(attempt)
      const now = nowIso()
      await params.db.batch([
        params.db
          .prepare(
            `UPDATE affiliate_fee_batches
              SET status = ?, attempts = ?, next_attempt_at = ?, last_error = ?, updated_at = ?
            WHERE id = ?`,
          )
          .bind(dead ? 'dead_letter' : 'retry', attempt, next, message, now, row.id),
        params.db
          .prepare(
            `INSERT INTO affiliate_delivery_attempts
             (id, target_type, target_id, attempt_number, request_json, error, retry_at, created_at)
           VALUES (?, 'sale', ?, ?, ?, ?, ?, ?)`,
          )
          .bind(crypto.randomUUID(), row.id, attempt, row.dub_payload_json, message, next, now),
      ])
    }
  }
}

export async function runAffiliateCron(env: AffiliateWorkerEnv) {
  const config = getAffiliateConfig(env)
  if (config.startBlock < 1)
    throw new Error('AFFILIATE_START_BLOCK must be explicitly configured above block zero.')
  const latest = await getBlockTimestamp({ rpcUrl: config.rpcUrl, blockNumber: 'latest' })
  const safeBlockNumber = confirmedSafeBlockNumber({
    latestBlockNumber: latest.blockNumber,
    confirmations: config.confirmations,
    startBlock: config.startBlock,
  })
  if (safeBlockNumber == null) return
  const [startBlock, safeBlock] = await Promise.all([
    getBlockTimestamp({ rpcUrl: config.rpcUrl, blockNumber: config.startBlock }),
    getBlockTimestamp({ rpcUrl: config.rpcUrl, blockNumber: safeBlockNumber }),
  ])
  const operatorPage = await listOperatorsRoundRobin(
    env.AFFILIATE_DB,
    config.chainId,
    config.batchLimit,
  )

  for (const operator of operatorPage.operators) {
    await syncOperatorHistory({
      db: env.AFFILIATE_DB,
      operator,
      baseUrl: config.dataApiUrl,
      feeType: 'BUILDER',
      startTimestamp: startBlock.timestamp,
      safeTimestamp: safeBlock.timestamp,
      maxPages: config.maxHistoryPages,
    })
    await syncOperatorHistory({
      db: env.AFFILIATE_DB,
      operator,
      baseUrl: config.dataApiUrl,
      feeType: 'AFFILIATE',
      startTimestamp: startBlock.timestamp,
      safeTimestamp: safeBlock.timestamp,
      maxPages: config.maxHistoryPages,
    })
  }
  const lastOperator = operatorPage.operators.at(-1)
  await saveOperatorCursor(
    env.AFFILIATE_DB,
    operatorPage.stateKey,
    operatorPage.cycleComplete ? '' : (lastOperator?.operator_wallet ?? ''),
  )
  await syncKuestHistory({
    db: env.AFFILIATE_DB,
    chainId: config.chainId,
    baseUrl: config.dataApiUrl,
    receiver: config.kuestFeeReceiver,
    startTimestamp: startBlock.timestamp,
    safeTimestamp: safeBlock.timestamp,
    maxPages: config.maxHistoryPages,
  })
  if (operatorPage.cycleComplete) {
    await quarantineAmbiguousTransactions(env.AFFILIATE_DB, config.chainId)
    await createFeeBatches(
      env.AFFILIATE_DB,
      config.chainId,
      config.tokenDecimals,
      config.batchLimit * 4,
    )
  }

  const dub = config.dryRun ? undefined : createDubTracker(config.dubApiKey)
  await deliverLeadOutbox({
    db: env.AFFILIATE_DB,
    dub,
    maxAttempts: config.maxAttempts,
    limit: config.batchLimit,
    dryRun: config.dryRun,
  })
  if (config.dryRun) {
    await prepareDryRunBatches(env.AFFILIATE_DB, config.batchLimit * 4)
  } else if (dub) {
    await deliverSales({
      db: env.AFFILIATE_DB,
      dub,
      limit: config.batchLimit,
      maxAttempts: config.maxAttempts,
    })
  }
}
