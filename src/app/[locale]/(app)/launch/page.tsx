import type {Metadata, Viewport} from "next";
import BackgroundParticles from "@/components/BackgroundParticles";
import LaunchpadForm from "@/components/LaunchpadForm";
import {getExtracted} from "next-intl/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";


export async function generateMetadata({ params }: PageProps<'/[locale]/launch'>): Promise<Metadata> {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getExtracted()

  return {
    metadataBase: new URL(process.env.SITE_URL!),
    title: t(`Kuest Create Prediction Market`),
    description: t('Guided Kuest launch flow with wallet, Vercel, and Supabase integration.')
  }
}

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: "#CDFF00",
  }
}

export default async function LaunchPage({ params }: PageProps<'/[locale]/launch'>) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
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

        <div className="relative z-1 launch-form-intro">
          <LaunchpadForm locale={locale} />
        </div>
      </main>
  )
}
