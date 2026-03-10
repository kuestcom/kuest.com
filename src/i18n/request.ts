import { getRequestConfig } from "next-intl/server";
import { getSiteMessages, normalizeSiteLocale } from "@/i18n/site";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = normalizeSiteLocale(await requestLocale);

  return {
    locale,
    messages: await getSiteMessages(locale),
  };
});
