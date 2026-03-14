import type { Metadata, Viewport } from "next";
import {
  buildProtocolMetadata,
  buildProtocolViewport,
  ProtocolPageContent,
} from "@/components/protocol-page-content";
import { defaultSiteLocale } from "@/i18n/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildProtocolMetadata(defaultSiteLocale);
}

export function generateViewport(): Viewport {
  return buildProtocolViewport();
}

export default function DefaultProtocolPage() {
  return <ProtocolPageContent locale={defaultSiteLocale} />;
}
