import { POST as handler } from "@/server/api/reown/connection/route";
import { wrapApiHandler } from "@/server/wrap-api";
export const prerender = false;
export const POST = wrapApiHandler(handler);
