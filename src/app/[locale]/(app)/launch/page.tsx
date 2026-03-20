import type { Metadata, Viewport } from 'next'
import { hasLocale } from 'next-intl'
import { getExtracted } from 'next-intl/server'
import { notFound } from 'next/navigation'
import KuestMark from '@/components/KuestMark'
import LaunchpadForm from '@/components/LaunchpadForm'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export async function generateMetadata({ params }: PageProps<'/[locale]/launch'>): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getExtracted()

  return {
    metadataBase: new URL(process.env.SITE_URL!),
    title: t(`Kuest Create Prediction Market`),
    description: t('Guided Kuest launch flow with wallet, Vercel, and Supabase integration.'),
  }
}

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: '#CDFF00',
  }
}

export default async function LaunchPage({ params }: PageProps<'/[locale]/launch'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getExtracted()

  return (
    <main className="page launch-page">
      <div className="panel-inner launch-panel-inner">
        <section className="launch-hero-shell">
          <div className="hero-brand-row launch-brand-row">
            <Link href="/" locale={locale} className="hero-brand launch-brand">
              <KuestMark />
              <span>Kuest</span>
            </Link>
          </div>

          <div className="launch-hero-copy">
            <div className="hero-kicker mb-5! animate-none! gap-3! opacity-100!">
              {t('The Shopify for Prediction Markets')}
            </div>

            <h1 className="hero-title launch-hero-title">
              {t('Launch your Prediction Market')}
            </h1>

            <p className="hero-copy-sub launch-hero-subtitle text-muted">
              {t('From zero to live in under 15 minutes')}
            </p>
          </div>

          <div className="launch-form-intro">
            <LaunchpadForm locale={locale} />
          </div>
        </section>
      </div>
    </main>
  )
}
