import type { ComponentProps } from "react";
import type { SupportedLocale } from "@/i18n/locales";
import { I18nProvider } from "@/i18n";
import BlogPostHero from "./BlogPostHero";

export default function BlogPostHeroIsland({
  locale,
  ...props
}: ComponentProps<typeof BlogPostHero> & { locale: SupportedLocale }) {
  return (
    <I18nProvider locale={locale}>
      <BlogPostHero {...props} />
    </I18nProvider>
  );
}
