import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { LocaleSync } from "@/i18n/locale-sync";
import {
  getSiteOrigin,
  type SiteLocale,
  type SiteMessages,
} from "@/i18n/site";
import { geistMono, openSauceOne } from "@/lib/fonts";

interface SiteDocumentProps {
  children: ReactNode;
  locale: string;
}

interface SiteLocaleProvidersProps {
  children: ReactNode;
  locale: SiteLocale;
  messages: SiteMessages;
}

export const siteRootMetadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  icons: {
    icon: "/images/kuest-logo.svg",
    shortcut: "/images/kuest-logo.svg",
    apple: "/images/kuest-logo.svg",
  },
};

export const siteRootViewport: Viewport = {
  themeColor: "#CDFF00",
};

export function SiteDocument({
  children,
  locale,
}: SiteDocumentProps) {
  return (
    <html
      lang={locale}
      className={`${openSauceOne.variable} ${geistMono.variable}`}
      data-theme-mode="dark"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">{children}</body>
    </html>
  );
}

export function SiteLocaleProviders({
  children,
  locale,
  messages,
}: SiteLocaleProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleSync />
      {children}
    </NextIntlClientProvider>
  );
}
