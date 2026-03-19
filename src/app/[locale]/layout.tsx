import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { notFound } from 'next/navigation'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { geistMono, openSauceOne } from '@/lib/fonts'

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: '#CDFF00',
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: `%s`,
      default: `Kuest | Create Your Own White-Label Prediction Market`,
    },
    description: 'Create your own white-label prediction market in 15 minutes. Launch under your brand, set your fees, use your domain, and start with shared liquidity from day one.',
    icons: {
      icon: '/images/kuest-logo.svg',
      apple: '/images/kuest-logo.svg',
      shortcut: '/images/kuest-logo.svg',
    },
  }
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function LocaleLayout({ params, children }: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      className={`${openSauceOne.variable} ${geistMono.variable}`}
      data-theme-mode="dark"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider
          attribute="data-theme-mode"
          storageKey="kuest-theme-mode"
          enableSystem={false}
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
