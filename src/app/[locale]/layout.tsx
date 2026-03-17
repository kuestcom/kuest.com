import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  SiteLocaleProviders,
  siteRootMetadata,
} from "@/components/site-root-layout";
import { getSiteMessages, isSiteLocale, siteLocales } from "@/i18n/site";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return siteLocales.map((locale) => ({ locale }));
}

export const metadata = siteRootMetadata;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getSiteMessages(locale);

  return (
    <SiteLocaleProviders locale={locale} messages={messages}>
      {children}
    </SiteLocaleProviders>
  );
}
