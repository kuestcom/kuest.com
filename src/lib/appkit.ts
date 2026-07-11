import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon, polygonAmoy } from '@reown/appkit/networks'
import type { PublicRuntimeConfig } from '@/lib/runtime-config'

export function createAppKitRuntime(config: PublicRuntimeConfig) {
  const projectId = config.REOWN_APPKIT_PROJECT_ID.trim()
  const defaultNetwork = config.KUEST_CHAIN_MODE === 'polygon' ? polygon : polygonAmoy
  const networks = [defaultNetwork] as [AppKitNetwork, ...AppKitNetwork[]]
  const wagmiAdapter = new WagmiAdapter({
    ssr: false,
    projectId,
    networks,
  })

  return {
    defaultNetwork,
    networks,
    projectId,
    wagmiAdapter,
    wagmiConfig: wagmiAdapter.wagmiConfig,
  }
}
