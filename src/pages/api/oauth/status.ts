import { GET as legacyHandler } from '@/server/api/oauth/status/route'
import { wrapApiHandler } from '@/server/wrap-api'
export const prerender = false
export const GET = wrapApiHandler(legacyHandler as (request: Request) => Promise<Response>)
