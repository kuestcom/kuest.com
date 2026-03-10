export const siteLocales = ["en", "de", "es", "pt", "fr", "zh"] as const;
export type SiteLocale = (typeof siteLocales)[number];

export const defaultSiteLocale: SiteLocale = "en";

export function isSiteLocale(value: string): value is SiteLocale {
  return siteLocales.includes(value as SiteLocale);
}

export function normalizeSiteLocale(input?: string | null): SiteLocale {
  if (!input) {
    return defaultSiteLocale;
  }

  const normalized = input.toLowerCase().split("-")[0];
  return isSiteLocale(normalized) ? normalized : defaultSiteLocale;
}

export function localeHref(locale: SiteLocale, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === defaultSiteLocale) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}
