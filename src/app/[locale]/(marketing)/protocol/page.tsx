import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  buildProtocolMetadata,
  buildProtocolViewport,
  ProtocolPageContent,
} from "@/components/protocol-page-content";
import {
  isSiteLocale,
} from "@/i18n/site";

interface ProtocolPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProtocolPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  return buildProtocolMetadata(locale);
}

export function generateViewport(): Viewport {
  return buildProtocolViewport();
}

export default async function ProtocolPage({ params }: ProtocolPageProps) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  return <ProtocolPageContent locale={locale} />;
}
