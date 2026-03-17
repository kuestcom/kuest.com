import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildEnterpriseMetadata,
  EnterprisePageContent,
} from "@/components/enterprise-page-content";
import { isSiteLocale } from "@/i18n/site";

interface EnterprisePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: EnterprisePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  return buildEnterpriseMetadata();
}

export default async function EnterprisePage({ params }: EnterprisePageProps) {
  const { locale } = await params;

  if (!isSiteLocale(locale)) {
    notFound();
  }

  return <EnterprisePageContent locale={locale} />;
}
