import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  buildLandingMetadata,
  buildLandingViewport,
  LandingPageContent,
} from "@/components/landing-page-content";
import {
  isSiteLocale,
} from "@/i18n/site";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  return buildLandingMetadata(locale);
}

export async function generateViewport(): Promise<Viewport> {
  return buildLandingViewport();
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  return <LandingPageContent locale={locale} />;
}
