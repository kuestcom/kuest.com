import { permanentRedirect } from "next/navigation";
import { defaultSiteLocale, localeHref } from "@/i18n/site";

export type RedirectSearchParams = Record<string, string | string[] | undefined>;

function buildRedirectHref(path: string, searchParams?: RedirectSearchParams) {
  const redirectUrl = new URL(localeHref(defaultSiteLocale, path), "https://kuest.com");

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          redirectUrl.searchParams.append(key, entry);
        });
        return;
      }

      if (typeof value === "string") {
        redirectUrl.searchParams.set(key, value);
      }
    });
  }

  return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
}

export async function redirectToDefaultLocale(
  path = "/",
  searchParams?: RedirectSearchParams | Promise<RedirectSearchParams>,
) {
  permanentRedirect(buildRedirectHref(path, await searchParams));
}
