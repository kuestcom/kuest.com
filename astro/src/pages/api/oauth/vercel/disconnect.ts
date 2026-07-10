import { POST as legacyHandler } from '@/server/api/oauth/vercel/disconnect/route'
import { wrapApiHandler } from '@/server/wrap-api'
export const prerender = false
export const POST = wrapApiHandler(legacyHandler as (request: Request) => Promise<Response>)
