import type { ReactNode } from "react";
import {
  SiteDocument,
  siteRootMetadata,
  siteRootViewport,
} from "@/components/site-root-layout";
import { defaultSiteLocale } from "@/i18n/site-config";
import "../globals.css";

export const metadata = siteRootMetadata;
export const viewport = siteRootViewport;

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return <SiteDocument locale={defaultSiteLocale}>{children}</SiteDocument>;
}
