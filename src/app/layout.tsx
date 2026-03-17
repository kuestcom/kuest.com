import type { ReactNode } from "react";
import {
  SiteDocument,
  siteRootMetadata,
  siteRootViewport,
} from "@/components/site-root-layout";
import "./globals.css";

export const metadata = siteRootMetadata;
export const viewport = siteRootViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
