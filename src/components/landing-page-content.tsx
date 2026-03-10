import type { Metadata } from "next";
import Script from "next/script";
import {
  getLandingMessages,
  getSiteOrigin,
  localeHref,
  siteLocales,
  type SiteLocale,
} from "@/i18n/site";
import {
  buildLandingRuntimeScript,
  renderLandingMarkup,
} from "@/lib/landing/render-landing";

export async function buildLandingMetadata(locale: SiteLocale): Promise<Metadata> {
  const bundle = await getLandingMessages(locale);
  const siteOrigin = getSiteOrigin();
  const canonical = new URL(localeHref(locale), siteOrigin);
  const ogImage = new URL("/assets/images/your-predictoin-market-500mi-vol.png", siteOrigin);

  return {
    title: bundle.meta.title,
    description: bundle.meta.description,
    keywords: [
      "create your prediction market",
      "white label prediction market",
      "prediction market whitelabel",
      "launch your own prediction market",
      "no-code prediction market",
      "branded prediction market",
      "shared liquidity",
    ],
    authors: [{ name: "Kuest" }],
    alternates: {
      canonical,
      languages: Object.fromEntries(siteLocales.map((entry) => [entry, localeHref(entry)])),
    },
    openGraph: {
      type: "website",
      siteName: "Kuest",
      title: bundle.meta.ogTitle,
      description: bundle.meta.ogDescription,
      url: canonical,
      images: [
        {
          url: ogImage,
          alt: "Kuest prediction market preview",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: bundle.meta.twitterTitle,
      description: bundle.meta.twitterDescription,
      images: [ogImage],
    },
  };
}

export async function LandingPageContent({ locale }: { locale: SiteLocale }) {
  const bundle = await getLandingMessages(locale);
  const { markup, nicheData } = await renderLandingMarkup(locale, bundle);

  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: markup }} />
      <Script
        id="landing-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Kuest",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: new URL(localeHref(locale), getSiteOrigin()).toString(),
            description: bundle.meta.description,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "White-label prediction market platform",
              "Custom domain and branding",
              "Shared liquidity from day one",
              "Configurable trading fees",
              "No-code launch",
            ],
          }),
        }}
      />
      <Script
        id="landing-embed-preview"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html:
            "if(new URLSearchParams(window.location.search).has('embed-preview')){document.documentElement.classList.add('embed-preview');}",
        }}
      />
      <Script
        id="landing-runtime-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: buildLandingRuntimeScript(bundle, nicheData),
        }}
      />
      <Script src="/assets/app.js" strategy="afterInteractive" />
    </>
  );
}
