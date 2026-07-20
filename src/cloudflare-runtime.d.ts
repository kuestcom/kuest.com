interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  meta: { changes: number; [key: string]: unknown }
  error?: string
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

interface ScheduledController {
  cron: string
  scheduledTime: number
  noRetry(): void
}

type ExportedHandler<TEnv> = {
  fetch?: (request: Request, env: TEnv, ctx: ExecutionContext) => Response | Promise<Response>
  scheduled?: (
    controller: ScheduledController,
    env: TEnv,
    ctx: ExecutionContext,
  ) => void | Promise<void>
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env
}
