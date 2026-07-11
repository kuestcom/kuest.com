import type { PublicRuntimeConfig } from '@/lib/runtime-config'

export const POLYGON_MAINNET_CHAIN_ID = 137

export const AMOY_CHAIN_ID = 80_002

export function isTestMode(config: PublicRuntimeConfig) {
  return config.KUEST_CHAIN_MODE === 'amoy'
}
