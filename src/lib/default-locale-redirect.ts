import { permanentRedirect } from "next/navigation";
import { defaultSiteLocale, localeHref } from "@/i18n/site";

export function redirectToDefaultLocale(path = "/") {
  permanentRedirect(localeHref(defaultSiteLocale, path));
}
