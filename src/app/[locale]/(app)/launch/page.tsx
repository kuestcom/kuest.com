import type { Metadata, Viewport } from 'next'
import { hasLocale } from 'next-intl'
import { getExtracted } from 'next-intl/server'
import { notFound } from 'next/navigation'
import BackgroundParticles from '@/components/BackgroundParticles'
import LaunchpadForm from '@/components/LaunchpadForm'
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
    <main className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <BackgroundParticles />

      <section className="relative z-1 mb-10">
        <h1 className="launch-hero-title text-center">{t('Launch your Prediction Market')}</h1>
        <p className="launch-hero-subtitle mx-auto mt-4 max-w-3xl text-center">
          {t('From zero to live in under 15 minutes')}
        </p>
      </section>

      <div className="launch-form-intro relative z-1">
        <LaunchpadForm locale={locale} />
      </div>
    </main>
  )
}
