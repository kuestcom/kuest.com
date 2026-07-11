import type { SupportedLocale } from "@/i18n/locales";
import { createTranslator, I18nProvider } from "@/i18n";
import KuestMark from "@/components/KuestMark";
import LaunchpadForm from "@/components/LaunchpadForm";
import { AppProviders } from "@/providers/AppProviders";
import { Link } from "@/i18n/navigation";
import type { PublicRuntimeConfig } from "@/lib/runtime-config";

function LaunchPageContent({
  locale,
  runtimeConfig,
}: {
  locale: SupportedLocale;
  runtimeConfig: PublicRuntimeConfig;
}) {
  const t = createTranslator(locale);

  return (
    <main className="page launch-page">
      <div className="panel-inner launch-panel-inner">
        <section className="launch-hero-shell">
          <div className="hero-brand-row launch-brand-row">
            <Link href="/" locale={locale} className="hero-brand launch-brand">
              <KuestMark />
              <span>Kuest</span>
            </Link>
          </div>

          <div className="launch-hero-copy">
            <div className="hero-kicker mb-5! animate-none! gap-3! opacity-100!">
              {t("The Shopify for Prediction Markets")}
            </div>

            <h1 className="hero-title launch-hero-title">{t("Launch your Prediction Market")}</h1>

            <p className="hero-copy-sub launch-hero-subtitle text-muted">
              {t("From zero to live in under 15 minutes")}
            </p>
          </div>

          <div className="launch-form-intro">
            <LaunchpadForm locale={locale} runtimeConfig={runtimeConfig} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LaunchPage({
  locale,
  runtimeConfig,
}: {
  locale: SupportedLocale;
  runtimeConfig: PublicRuntimeConfig;
}) {
  return (
    <I18nProvider locale={locale}>
      <div
        data-theme-mode="dark"
        className="min-h-screen bg-background text-foreground"
        style={{ colorScheme: "dark" }}
      >
        <AppProviders runtimeConfig={runtimeConfig}>
          <LaunchPageContent locale={locale} runtimeConfig={runtimeConfig} />
        </AppProviders>
      </div>
    </I18nProvider>
  );
}
