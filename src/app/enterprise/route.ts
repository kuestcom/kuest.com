import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { defaultSiteLocale, getLandingMessages } from "@/i18n/site";
import {
  buildLandingRuntimeScript,
  renderLandingMarkup,
} from "@/lib/landing/render-landing";

const ENTERPRISE_TEMPLATE_PATH = join(process.cwd(), "src", "lib", "enterprise", "template.html");
const LUCIDE_CDN_URL = "https://cdn.jsdelivr.net/npm/lucide@0.577.0/dist/umd/lucide.min.js";

const getEnterpriseRuntimeScript = cache(async () => {
  const bundle = await getLandingMessages(defaultSiteLocale);
  const { nicheData } = await renderLandingMarkup(defaultSiteLocale, bundle);

  return buildLandingRuntimeScript(bundle, nicheData);
});

function buildEnterpriseDocument(template: string, runtimeScript: string) {
  return [
    template.trimEnd(),
    `<script id="enterprise-runtime-data">${runtimeScript}</script>`,
    `<script src="${LUCIDE_CDN_URL}"></script>`,
    '<script src="/assets/app.js"></script>',
    "<script>window.lucide && window.lucide.createIcons();</script>",
    "</body>",
    "</html>",
  ].join("\n");
}

export const runtime = "nodejs";

export async function GET() {
  const [template, runtimeScript] = await Promise.all([
    readFile(ENTERPRISE_TEMPLATE_PATH, "utf8"),
    getEnterpriseRuntimeScript(),
  ]);

  return new Response(buildEnterpriseDocument(template, runtimeScript), {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
