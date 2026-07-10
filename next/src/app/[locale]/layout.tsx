import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getExtracted, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { geistMono, openSauceOne } from '@/lib/fonts'

const GOOGLE_ANALYTICS_ID = 'G-S0S2K7EQE4'

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: '#CDFF00',
  }
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const t = await getExtracted({ locale })

  return {
    title: {
      template: `%s`,
      default: t('Kuest Create Prediction Market'),
    },
    description: t('Create your own white-label prediction market in 15 minutes. Launch under your brand, set your fees, use your domain, and start with shared liquidity from day one.'),
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
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
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
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
    </html>
  )
}
