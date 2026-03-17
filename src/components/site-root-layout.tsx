import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { LocaleSync } from "@/i18n/locale-sync";
import { getSiteOrigin, type SiteLocale, type SiteMessages } from "@/i18n/site";
import { geistMono, openSauceOne } from "@/lib/fonts";

interface SiteRootLayoutProps {
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

export function SiteRootLayout({ children, locale, messages }: SiteRootLayoutProps) {
  return (
    <html
      lang={locale}
      className={`${openSauceOne.variable} ${geistMono.variable}`}
      data-theme-mode="dark"
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#CDFF00" />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleSync />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
