import type { MDXComponents } from "mdx/types";
import type { SupportedLocale } from "@/i18n/locales";
import Image from "@/compat/Image";
import Callout from "@/components/blog/blocks/Callout";
import Comparison from "@/components/blog/blocks/Comparison";
import KuestCTA from "@/components/blog/blocks/KuestCTA";
import MarketEmbed from "@/components/blog/blocks/MarketEmbed";
import Stat from "@/components/blog/blocks/Stat";
import TwoColumn from "@/components/blog/blocks/TwoColumn";
import { Link } from "@/i18n/navigation";
import { toSafeHref } from "@/lib/url-safety";

export function createMdxComponents(locale: SupportedLocale): MDXComponents {
  return {
    a: ({ href, children, ...rest }) => {
      if (typeof href !== "string") return <a {...rest}>{children}</a>;
      const safeHref = toSafeHref(href);
      if (!safeHref) return <>{children}</>;
      if (/^(?:https?:|mailto:|tel:)/i.test(safeHref)) {
        return (
          <a href={safeHref} target="_blank" rel="noopener noreferrer" {...rest}>
            {children}
          </a>
        );
      }
      const isStaticOrApi = safeHref.startsWith("/api/") || /\.[a-z0-9]+(?:[?#]|$)/i.test(safeHref);
      if (safeHref.startsWith("/") && !isStaticOrApi) {
        return (
          <Link href={safeHref} locale={locale} {...rest}>
            {children}
          </Link>
        );
      }
      return (
        <a href={safeHref} {...rest}>
          {children}
        </a>
      );
    },
    img: ({ src, alt, width, height }) => {
      const resolvedSrc = typeof src === "string" ? src : "";
      if (!resolvedSrc) return null;
      return (
        <figure>
          <Image
            src={resolvedSrc}
            alt={alt ?? ""}
            width={Number(width) || 1600}
            height={Number(height) || 900}
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {alt ? <figcaption>{alt}</figcaption> : null}
        </figure>
      );
    },
    table: ({ children }) => (
      <div className="blog-prose-table-wrap">
        <table>{children}</table>
      </div>
    ),
    Callout,
    Stat,
    MarketEmbed,
    Comparison,
    KuestCTA,
    TwoColumn,
  };
}
