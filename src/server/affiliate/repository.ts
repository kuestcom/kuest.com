import type { OperatorAttributionInput } from './types'

export function nowIso() {
  return new Date().toISOString()
}

export async function reserveWalletAuthorization(params: {
  db: D1Database
  proofHash: string
  operatorWallet: string
  chainId: number
  expiresAt: string
}) {
  const now = nowIso()
  const result = await params.db
    .prepare(
      `INSERT INTO affiliate_wallet_authorizations
         (proof_hash, operator_wallet, chain_id, status, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, 'reserved', ?, ?, ?)
       ON CONFLICT(proof_hash) DO NOTHING`,
    )
    .bind(
      params.proofHash,
      params.operatorWallet.toLowerCase(),
      params.chainId,
      params.expiresAt,
      now,
      now,
    )
    .run()
  if (!result.meta.changes) throw new Error('Wallet authorization was already used.')
}

export async function failWalletAuthorization(db: D1Database, proofHash: string) {
  await db
    .prepare(
      `UPDATE affiliate_wallet_authorizations SET status = 'failed', updated_at = ?
        WHERE proof_hash = ? AND status = 'reserved'`,
    )
    .bind(nowIso(), proofHash)
    .run()
}

export async function getOperatorAttribution(
  db: D1Database,
  operatorWallet: string,
  chainId: number,
) {
  return db
    .prepare(
      `SELECT operator_wallet, operator_email, operator_name, deposit_wallet, first_project_id,
              chain_id, dub_click_id, attribution_status
         FROM affiliate_operator_attributions
        WHERE operator_wallet = ? AND chain_id = ?`,
    )
    .bind(operatorWallet.toLowerCase(), chainId)
    .first<{
      operator_wallet: string
      operator_email: string
      operator_name: string
      deposit_wallet: string
      first_project_id: string
      chain_id: number
      dub_click_id: string | null
      attribution_status: string
    }>()
}

export async function persistOperatorAttribution(db: D1Database, input: OperatorAttributionInput) {
  const wallet = input.operatorWallet.toLowerCase()
  const depositWallet = input.depositWallet.toLowerCase()
  const existing = await getOperatorAttribution(db, wallet, input.chainId)
  if (existing) {
    if (existing.deposit_wallet !== depositWallet) {
      await markDepositConflict(
        db,
        wallet,
        input.chainId,
        depositWallet,
        'operator_deposit_changed',
      )
      throw new Error('The operator deposit wallet changed and requires manual review.')
    }
    await consumeWalletAuthorization(db, input.proofHash)
    return { created: false, attribution: existing }
  }

  const conflict = await db
    .prepare(
      `SELECT operator_wallet FROM affiliate_operator_attributions
        WHERE deposit_wallet = ? AND chain_id = ? AND operator_wallet != ?`,
    )
    .bind(depositWallet, input.chainId, wallet)
    .first<{ operator_wallet: string }>()
  if (conflict) {
    await markDepositConflict(
      db,
      conflict.operator_wallet,
      input.chainId,
      depositWallet,
      'deposit_operator_conflict',
    )
    throw new Error('This deposit wallet belongs to another operator and requires manual review.')
  }

  const now = nowIso()
  await db.batch([
    db
      .prepare(
        `INSERT INTO affiliate_operator_attributions (
         operator_wallet, chain_id, operator_email, operator_name, deposit_wallet,
         first_project_id, dub_click_id, attribution_status, lead_next_attempt_at,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, 'provisioning', NULL, ?, ?)`,
      )
      .bind(
        wallet,
        input.chainId,
        input.operatorEmail,
        input.operatorName,
        depositWallet,
        input.firstProjectId,
        input.dubClickId,
        now,
        now,
      ),
    db
      .prepare(
        `UPDATE affiliate_wallet_authorizations SET status = 'consumed', updated_at = ?
        WHERE proof_hash = ? AND status = 'reserved'`,
      )
      .bind(now, input.proofHash),
  ])
  return {
    created: true,
    attribution: await getOperatorAttribution(db, wallet, input.chainId),
  }
}

export async function consumeWalletAuthorization(db: D1Database, proofHash: string) {
  const result = await db
    .prepare(
      `UPDATE affiliate_wallet_authorizations SET status = 'consumed', updated_at = ?
        WHERE proof_hash = ? AND status = 'reserved'`,
    )
    .bind(nowIso(), proofHash)
    .run()
  if (!result.meta.changes) throw new Error('Wallet authorization reservation was lost.')
}

export async function completeOperatorAttribution(
  db: D1Database,
  operatorWallet: string,
  chainId: number,
) {
  const now = nowIso()
  const result = await db
    .prepare(
      `UPDATE affiliate_operator_attributions
          SET attribution_status = CASE WHEN dub_click_id IS NULL THEN 'unattributed' ELSE 'lead_pending' END,
              lead_next_attempt_at = CASE WHEN dub_click_id IS NULL THEN NULL ELSE ? END,
              updated_at = ?
        WHERE operator_wallet = ? AND chain_id = ?
          AND attribution_status IN ('provisioning', 'launch_failed')`,
    )
    .bind(now, now, operatorWallet.toLowerCase(), chainId)
    .run()
  return result.meta.changes > 0
}

export async function markOperatorLaunchFailed(
  db: D1Database,
  operatorWallet: string,
  chainId: number,
) {
  return db
    .prepare(
      `UPDATE affiliate_operator_attributions
          SET attribution_status = 'launch_failed', updated_at = ?
        WHERE operator_wallet = ? AND chain_id = ? AND attribution_status = 'provisioning'`,
    )
    .bind(nowIso(), operatorWallet.toLowerCase(), chainId)
    .run()
}

async function markDepositConflict(
  db: D1Database,
  operatorWallet: string,
  chainId: number,
  depositWallet: string,
  type: string,
) {
  const now = nowIso()
  await db.batch([
    db
      .prepare(
        `UPDATE affiliate_operator_attributions SET fee_processing_status = 'manual_review', updated_at = ?
        WHERE deposit_wallet = ? AND chain_id = ?`,
      )
      .bind(now, depositWallet, chainId),
    db
      .prepare(
        `INSERT OR IGNORE INTO affiliate_reconciliations
         (id, operator_wallet, reconciliation_type, status, details_json, created_at, updated_at)
       VALUES (?, ?, ?, 'manual_review', ?, ?, ?)`,
      )
      .bind(
        `${type}:${chainId}:${depositWallet}`,
        operatorWallet,
        type,
        JSON.stringify({ depositWallet, chainId, operatorWallet }),
        now,
        now,
      ),
  ])
}
