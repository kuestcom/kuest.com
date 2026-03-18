import type { Metadata } from "next";
import LaunchPage from "@/components/LaunchPage";
import { getSiteOrigin } from "@/i18n/site";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Kuest";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: `${siteName} Create Prediction Market`,
  description:
    "Guided Kuest launch flow with wallet, Vercel, and Supabase integration.",
};

export default function LaunchRoutePage() {
  return <LaunchPage />;
}
