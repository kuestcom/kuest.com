import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import enMessages from "@/i18n/messages/en.json";
export {
  defaultSiteLocale,
  isSiteLocale,
  localeHref,
  normalizeSiteLocale,
  siteLocales,
} from "@/i18n/site-config";
import type { SiteLocale } from "@/i18n/site-config";
export type { SiteLocale } from "@/i18n/site-config";

export type SiteMessages = typeof enMessages;
export type LandingMessages = SiteMessages["landing"];
export type LaunchMessages = SiteMessages["launch"];

export const getSiteMessages = cache(async (locale: SiteLocale): Promise<SiteMessages> => {
  const filePath = join(process.cwd(), "src", "i18n", "messages", `${locale}.json`);
  const fileContents = await readFile(filePath, "utf8");

  return JSON.parse(fileContents) as SiteMessages;
});

export const getLandingMessages = cache(async (locale: SiteLocale): Promise<LandingMessages> => {
  return (await getSiteMessages(locale)).landing;
});

export function getSiteOrigin() {
  const fallbackOrigin = "https://kuest.com";
  const candidate = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!candidate) {
    return fallbackOrigin;
  }

  try {
    return new URL(candidate).origin;
  } catch {
    return fallbackOrigin;
  }
}
