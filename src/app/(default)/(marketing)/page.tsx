import type { Metadata } from "next";
import {
  buildLandingMetadata,
  LandingPageContent,
} from "@/components/landing-page-content";
import { defaultSiteLocale } from "@/i18n/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildLandingMetadata(defaultSiteLocale);
}

export default function DefaultLandingPage() {
  return <LandingPageContent locale={defaultSiteLocale} />;
}
