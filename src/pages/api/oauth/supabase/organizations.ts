import { GET as legacyHandler } from "@/server/api/oauth/supabase/organizations/route";
import { wrapApiHandler } from "@/server/wrap-api";
export const prerender = false;
export const GET = wrapApiHandler(legacyHandler as (request: Request) => Promise<Response>);
