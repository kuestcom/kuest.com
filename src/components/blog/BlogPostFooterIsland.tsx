import type { ComponentProps } from "react";
import type { SupportedLocale } from "@/i18n/locales";
import { I18nProvider } from "@/i18n";
import BlogPostFooter from "./BlogPostFooter";

export default function BlogPostFooterIsland({
  locale,
  ...props
}: ComponentProps<typeof BlogPostFooter> & { locale: SupportedLocale }) {
  return (
    <I18nProvider locale={locale}>
      <BlogPostFooter {...props} />
    </I18nProvider>
  );
}
