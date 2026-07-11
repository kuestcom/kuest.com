import type { APIRoute } from "astro";
import { SITE_URL } from "astro:env/client";

export const GET: APIRoute = () => {
  const origin = new URL(SITE_URL);
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL("/sitemap.xml", origin)}\n`,
    {
      headers: { "content-type": "text/plain; charset=utf-8" },
    },
  );
};
