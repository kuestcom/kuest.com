CREATE TABLE affiliate_operator_attributions (
  operator_wallet TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  operator_email TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  deposit_wallet TEXT NOT NULL,
  first_project_id TEXT NOT NULL,
  dub_click_id TEXT,
  dub_customer_id TEXT,
  attribution_status TEXT NOT NULL CHECK (attribution_status IN ('provisioning', 'unattributed', 'lead_pending', 'active', 'dead_letter')),
  fee_processing_status TEXT NOT NULL DEFAULT 'active' CHECK (fee_processing_status IN ('active', 'manual_review')),
  lead_payload_json TEXT,
  lead_response_json TEXT,
  lead_attempts INTEGER NOT NULL DEFAULT 0,
  lead_next_attempt_at TEXT,
  lead_last_error TEXT,
  gross_fee_raw TEXT NOT NULL DEFAULT '0',
  gross_fee_cents INTEGER NOT NULL DEFAULT 0,
  rounding_remainder_raw TEXT NOT NULL DEFAULT '0',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (operator_wallet, chain_id),
  UNIQUE (deposit_wallet, chain_id)
);
CREATE INDEX idx_affiliate_operator_lead_outbox
  ON affiliate_operator_attributions (attribution_status, lead_next_attempt_at);
CREATE INDEX idx_affiliate_operator_fee_processing
  ON affiliate_operator_attributions (fee_processing_status);

CREATE TABLE affiliate_wallet_authorizations (
  proof_hash TEXT PRIMARY KEY,
  operator_wallet TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'consumed', 'failed')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE affiliate_source_checkpoints (
  stream_key TEXT PRIMARY KEY,
  latest_timestamp INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE affiliate_runtime_state (
  state_key TEXT PRIMARY KEY,
  state_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE affiliate_operator_fee_transactions (
  chain_id INTEGER NOT NULL,
  operator_wallet TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  event_timestamp INTEGER NOT NULL,
  has_builder_fee INTEGER NOT NULL DEFAULT 0,
  has_affiliate_fee INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('observed', 'matched', 'batched', 'delivered', 'manual_review')),
  source_payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (chain_id, operator_wallet, tx_hash),
  FOREIGN KEY (operator_wallet, chain_id)
    REFERENCES affiliate_operator_attributions(operator_wallet, chain_id)
);
CREATE INDEX idx_affiliate_operator_fee_match
  ON affiliate_operator_fee_transactions (chain_id, tx_hash, status);

CREATE TABLE affiliate_kuest_fee_transactions (
  chain_id INTEGER NOT NULL,
  tx_hash TEXT NOT NULL,
  event_timestamp INTEGER NOT NULL,
  amount_raw TEXT NOT NULL,
  source_payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (chain_id, tx_hash)
);

CREATE TABLE affiliate_fee_batches (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  operator_wallet TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  tx_hash TEXT NOT NULL,
  event_timestamp INTEGER NOT NULL,
  amount_raw TEXT NOT NULL,
  token_decimals INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  remainder_in_raw TEXT NOT NULL,
  remainder_out_raw TEXT NOT NULL,
  dub_payload_json TEXT NOT NULL,
  dub_response_json TEXT,
  dry_run_prepared_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT,
  last_error TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'retry', 'delivered', 'below_minimum', 'dead_letter', 'manual_review')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (operator_wallet, chain_id)
    REFERENCES affiliate_operator_attributions(operator_wallet, chain_id)
);
CREATE INDEX idx_affiliate_batch_outbox ON affiliate_fee_batches (status, next_attempt_at);

CREATE TABLE affiliate_delivery_attempts (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('lead', 'sale', 'reconciliation')),
  target_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  request_json TEXT,
  response_json TEXT,
  error TEXT,
  retry_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (target_type, target_id, attempt_number)
);

CREATE TABLE affiliate_reconciliations (
  id TEXT PRIMARY KEY,
  operator_wallet TEXT,
  invoice_id TEXT,
  reconciliation_type TEXT NOT NULL,
  source_amount_raw TEXT,
  d1_amount_raw TEXT,
  dub_sale_cents INTEGER,
  dub_commission_cents INTEGER,
  status TEXT NOT NULL CHECK (status IN ('matched', 'missing', 'mismatch', 'manual_review')),
  details_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_affiliate_reconciliation_invoice
  ON affiliate_reconciliations (invoice_id, created_at DESC);
