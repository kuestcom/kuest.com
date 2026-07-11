import { POST as handler } from '@/server/api/domain-register/route'
import { wrapApiHandler } from '@/server/wrap-api'
export const prerender = false
export const POST = wrapApiHandler(handler)
