import { handle } from '@astrojs/cloudflare/handler'
import { runAffiliateCron } from '@/server/affiliate/processor'

export default {
  fetch: handle,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runAffiliateCron(env))
  },
} satisfies ExportedHandler<Env>
