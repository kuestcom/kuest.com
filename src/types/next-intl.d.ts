import messages from "@/i18n/messages/en.json";
import { siteLocales } from "@/i18n/site-config";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof siteLocales)[number];
    Messages: typeof messages;
  }
}
