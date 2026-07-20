export const DUB_LEAD_EVENT = 'Prediction Market Launched'
export const DUB_SALE_EVENT = 'Trading Fees Received'
export const DUB_CURRENCY = 'USD'
export const DUB_PAYMENT_PROCESSOR = 'custom'

export interface AffiliateWorkerEnv {
  AFFILIATE_DB: D1Database
  DUB_API_KEY?: string
  AFFILIATE_DATA_API_URL?: string
  AFFILIATE_RPC_URL?: string
  AFFILIATE_DEPOSIT_WALLET_FACTORY?: string
  AFFILIATE_KUEST_FEE_RECEIVER?: string
  AFFILIATE_CHAIN_ID?: string
  AFFILIATE_CONFIRMATIONS?: string
  AFFILIATE_TOKEN_DECIMALS?: string
  AFFILIATE_BATCH_LIMIT?: string
  AFFILIATE_MAX_ATTEMPTS?: string
  AFFILIATE_START_BLOCK?: string
  AFFILIATE_DRY_RUN?: string
  AFFILIATE_MAX_HISTORY_PAGES?: string
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

function nonNegativeInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback
}

function address(value: string | undefined, fallback: string) {
  const normalized = (value || fallback).trim().toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(normalized))
    throw new Error('Invalid affiliate address configuration.')
  return normalized
}

function url(value: string | undefined, fallback: string) {
  const normalized = (value || fallback).trim().replace(/\/+$/, '')
  const parsed = new URL(normalized)
  if (!['http:', 'https:'].includes(parsed.protocol))
    throw new Error('Invalid affiliate URL configuration.')
  return normalized
}

export function getAffiliateConfig(env: AffiliateWorkerEnv) {
  return {
    chainId: positiveInteger(env.AFFILIATE_CHAIN_ID, 80002),
    confirmations: positiveInteger(env.AFFILIATE_CONFIRMATIONS, 64),
    tokenDecimals: positiveInteger(env.AFFILIATE_TOKEN_DECIMALS, 6),
    batchLimit: Math.min(100, positiveInteger(env.AFFILIATE_BATCH_LIMIT, 25)),
    maxAttempts: Math.min(20, positiveInteger(env.AFFILIATE_MAX_ATTEMPTS, 8)),
    maxHistoryPages: Math.min(200, positiveInteger(env.AFFILIATE_MAX_HISTORY_PAGES, 20)),
    startBlock: nonNegativeInteger(env.AFFILIATE_START_BLOCK, 0),
    dryRun: env.AFFILIATE_DRY_RUN?.trim().toLowerCase() !== 'false',
    dataApiUrl: url(env.AFFILIATE_DATA_API_URL, 'https://data-api.kuest.com'),
    rpcUrl: url(env.AFFILIATE_RPC_URL, 'https://polygon-amoy.drpc.org'),
    depositWalletFactory: address(
      env.AFFILIATE_DEPOSIT_WALLET_FACTORY,
      '0x2CcdC6C5dDcd895aFcCD259F291de9b618A5cA6c',
    ),
    kuestFeeReceiver: address(
      env.AFFILIATE_KUEST_FEE_RECEIVER,
      '0x645E67CC15DAE4F312dc941fA190c52E7d598c67',
    ),
    dubApiKey: env.DUB_API_KEY?.trim() || '',
  }
}
