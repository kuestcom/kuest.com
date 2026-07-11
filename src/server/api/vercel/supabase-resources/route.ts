import { LaunchError } from "@/lib/launch-utils";
import { getValidVercelSession } from "@/lib/oauth-session";
import { buildRateLimitHeaders, checkRateLimit, getRateLimitConfig } from "@/lib/rate-limit";
import { listSupabaseIntegrationResources } from "@/lib/vercel-api";
import { getServerRuntimeConfig } from "@/lib/server-env";

interface RequestBody {
  token?: string;
  teamId?: string;
}

export async function POST(request: Request) {
  const { RATE_LIMIT_SUPABASE_RESOURCES_MAX, RATE_LIMIT_WINDOW_MS } = getServerRuntimeConfig();
  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig({
      route: "api:supabase-resources",
      max: RATE_LIMIT_SUPABASE_RESOURCES_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    }),
  );
  if (!rateLimit.allowed) {
    return Response.json(
      {
        resources: [],
        error: "Too many refresh attempts. Please retry shortly.",
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimit),
      },
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const rawToken = typeof body.token === "string" ? body.token.trim() : "";
    const teamId =
      typeof body.teamId === "string" && body.teamId.trim() ? body.teamId.trim() : undefined;
    const session = rawToken ? null : await getValidVercelSession();
    const token = rawToken || session?.accessToken || "";

    if (!token) {
      return Response.json(
        {
          resources: [],
          error: "Missing Vercel authentication. Connect OAuth or paste an Access Token.",
        },
        { status: 400 },
      );
    }

    const listed = await listSupabaseIntegrationResources({
      token,
      teamId,
    });

    return Response.json({
      resources: listed.resources,
      resolvedTeamId: listed.resolvedTeamId,
    });
  } catch (error) {
    if (error instanceof LaunchError) {
      return Response.json(
        {
          resources: [],
          error: error.message,
          details: error.details,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        resources: [],
        error: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}
