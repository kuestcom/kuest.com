# Dub affiliate integration

## Business rule

Dub receives the gross Kuest trading revenue in integer USD cents and applies the 30% commission
configured in the Dub program. The Worker never sends 30% itself and never calls payout APIs or
`commissions.create()`.

Attribution is permanent per operator wallet and chain. `customerExternalId` is the lowercase
operator wallet. A later referral, reload or project launch cannot replace the first attribution.
Different projects from the same operator therefore share the same affiliate attribution.

## Data flow

1. `@dub/analytics` stores `dub_id` when the visitor opens `/launch` through a Dub link.
2. Launch requires an email and verifies the same EIP-712 wallet proof already used to create the
   Kuest API credentials.
3. The Worker calls `predictWalletAddress(bytes32)` on the configured DepositWalletFactory. This
   is one read-only `eth_call`; it does not use `data-api`, deploy a wallet or change order flow.
4. After Vercel creates the fork, D1 stores the immutable operator attribution and the Worker sends
   `Prediction Market Launched` to Dub. Dry-run stores the exact payload without calling Dub.
5. The disabled-by-default Cron reads `/fees/history` from `data-api` for:
   - the operator deposit wallet with `feeType=BUILDER` and `feeType=AFFILIATE`;
   - the global Kuest receiver with `feeType=KUEST`.
6. A shared transaction hash links a fee-producing trade to its Kuest revenue. The gross KUEST
   amount is converted from USDC base units to cents with `BigInt` and sub-cent remainder carry.
7. The Worker sends `Trading Fees Received` with a deterministic invoice ID and the operator wallet
   as `customerExternalId`.

If the same transaction appears for deposit wallets owned by different operators, all involved
operators are moved to `manual_review`; Kuest revenue is never duplicated between them.

## D1 and idempotency

`migrations/0001_dub_affiliates.sql` creates operator attributions, replay-protected wallet proofs,
source checkpoints, operator fee transactions, Kuest fee transactions, Dub batches, delivery
attempts, round-robin runtime state and reconciliations.

Important keys:

- `(operator_wallet, chain_id)` is the immutable attribution identity;
- `(deposit_wallet, chain_id)` is unique;
- `(chain_id, operator_wallet, tx_hash)` identifies an operator trade;
- `(chain_id, tx_hash)` holds the aggregated gross Kuest fee for that transaction;
- invoice ID is `chainId:operatorWallet:txHash`.

History reads overlap the last processed timestamp so events sharing a timestamp are not lost.
Conditional upserts avoid rewriting unchanged D1 rows. A complete round-robin operator sweep must
finish before new batches are created, so cross-operator transaction conflicts are quarantined first.
Lead delivery and per-operator fee batching use 15-minute leases. After a sale-delivery crash, the
Worker checks the invoice in Dub before retrying, while Dub also enforces invoice idempotency.

## Configuration

Plaintext Worker variables:

```text
AFFILIATE_DATA_API_URL=https://data-api.kuest.com
AFFILIATE_RPC_URL=https://polygon-amoy.drpc.org
AFFILIATE_DEPOSIT_WALLET_FACTORY=0x2CcdC6C5dDcd895aFcCD259F291de9b618A5cA6c
AFFILIATE_KUEST_FEE_RECEIVER=0x645E67CC15DAE4F312dc941fA190c52E7d598c67
AFFILIATE_CHAIN_ID=80002
AFFILIATE_CONFIRMATIONS=64
AFFILIATE_TOKEN_DECIMALS=6
AFFILIATE_START_BLOCK=42753000
AFFILIATE_DRY_RUN=true
AFFILIATE_BATCH_LIMIT=25
AFFILIATE_MAX_ATTEMPTS=8
AFFILIATE_MAX_HISTORY_PAGES=20
```

`AFFILIATE_START_BLOCK=0` remains an invalid sentinel in code. The checked-in Amoy configuration
uses the explicit cut block `42753000`, keeps `AFFILIATE_DRY_RUN=true` and has `crons = []`. The Cron
must stay disabled until the pinned D1 database has its migration applied.

Only `DUB_API_KEY` is a secret:

```sh
pnpm exec wrangler secret put DUB_API_KEY
```

The fee history endpoints are public read-only endpoints, so no data-api machine secret is used.

## Cutover and rollout

No `subgraph`, `data-api` or order-flow deployment is required for this integration. The existing
`data-api` fee endpoints are the only fee source.

1. Deploy Kuest with no Cron and `AFFILIATE_DRY_RUN=true`. Before choosing a cut block, use
   `AFFILIATE_START_BLOCK=0` as the invalid safety sentinel.
2. Create the `kuest-affiliates` D1 database, pin its ID in Wrangler, apply the migration and set
   `DUB_API_KEY`. Never enable the Cron while the migration is pending.
3. Claim/settle any historical fees that must remain outside the program, wait for confirmation and
   record block `B`. Set `AFFILIATE_START_BLOCK=B+1`; the Worker resolves this block to a timestamp
   and permanently ignores older fee history.
4. Add a five-minute Cron only after the migration is confirmed, while keeping dry-run enabled:

   ```toml
   [triggers]
   crons = ["*/5 * * * *"]
   ```

5. Inspect the exact lead and sale payloads:

   ```sh
   pnpm exec wrangler d1 execute kuest-affiliates --remote --command \
     "SELECT operator_wallet, attribution_status, lead_payload_json FROM affiliate_operator_attributions WHERE lead_payload_json IS NOT NULL ORDER BY created_at"

   pnpm exec wrangler d1 execute kuest-affiliates --remote --command \
     "SELECT invoice_id, operator_wallet, tx_hash, amount_raw, amount_cents, status, dry_run_prepared_at, dub_payload_json FROM affiliate_fee_batches ORDER BY created_at"
   ```

6. Reconcile sample transaction hashes against `/fees/history` and confirm that dry-run rows remain
   `pending`, never `delivered`.
7. Set `AFFILIATE_DRY_RUN=false` and deploy. The next Cron sends the already prepared lead and batch
   once; it does not rebuild a different invoice.

Monitor `dead_letter`, `manual_review`, delivery attempts, data-api lag and cent remainders during
the first production runs. Automatic Dub payouts should remain disabled until finance defines the
payout process.

Official references:

- [Dub lead tracking](https://dub.co/docs/api-reference/track/lead)
- [Dub sale tracking](https://dub.co/docs/api-reference/track/sale)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
