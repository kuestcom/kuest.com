import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  SiteDocument,
  SiteLocaleProviders,
  siteRootMetadata,
  siteRootViewport,
} from "@/components/site-root-layout";
import { getSiteMessages, isSiteLocale, siteLocales } from "@/i18n/site";
import "@/app/globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return siteLocales.map((locale) => ({ locale }));
}

export const metadata = siteRootMetadata;
export const viewport = siteRootViewport;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getSiteMessages(locale);

  return (
    <SiteDocument locale={locale}>
      <SiteLocaleProviders locale={locale} messages={messages}>
        {children}
      </SiteLocaleProviders>
    </SiteDocument>
  );
}
