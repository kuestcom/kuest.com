import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteRootLayout, siteRootMetadata } from "@/components/site-root-layout";
import { defaultSiteLocale, getSiteMessages } from "@/i18n/site";
import "../globals.css";

export const metadata: Metadata = siteRootMetadata;

export default async function DefaultLocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const messages = await getSiteMessages(defaultSiteLocale);

  return (
    <SiteRootLayout locale={defaultSiteLocale} messages={messages}>
      {children}
    </SiteRootLayout>
  );
}
