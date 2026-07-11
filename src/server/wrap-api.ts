import type { APIRoute } from "astro";
import { runWithRequestContext } from "./request-context";

type LegacyHandler = (request: Request) => Response | Promise<Response>;

export function wrapApiHandler(handler: LegacyHandler): APIRoute {
  return ({ request, cookies }) => runWithRequestContext(cookies, () => handler(request));
}
