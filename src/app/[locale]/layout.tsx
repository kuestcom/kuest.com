import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRootLayout, siteRootMetadata } from "@/components/site-root-layout";
import { getSiteMessages, isSiteLocale, siteLocales } from "@/i18n/site";
import "../globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return siteLocales.map((locale) => ({ locale }));
}

export const metadata: Metadata = siteRootMetadata;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  const messages = await getSiteMessages(locale);

  return <SiteRootLayout locale={locale} messages={messages}>{children}</SiteRootLayout>;
}
