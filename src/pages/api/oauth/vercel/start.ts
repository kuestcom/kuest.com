import { GET as handler } from "@/server/api/oauth/vercel/start/route";
import { wrapApiHandler } from "@/server/wrap-api";
export const prerender = false;
export const GET = wrapApiHandler(handler);
