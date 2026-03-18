import { parseHTML } from "linkedom/worker";
import type { SiteLocale } from "@/i18n/site";
import { defaultSiteLocale, localeHref } from "@/i18n/site";

export const DEMO_ORIGIN = "https://demo.kuest.com";

const LANDING_HERO_TITLE_ACCENT_BY_LOCALE: Record<SiteLocale, string> = {
  en: "Free",
  de: "Kostenlos",
  es: "Gratis",
  pt: "Grátis",
  fr: "Gratuit",
  zh: "免费开始",
};

export function buildThemeBootstrapScript() {
  return "(function(){var root=document.documentElement;var meta=document.querySelector('meta[name=\"theme-color\"]');var mode='dark';try{var saved=window.localStorage.getItem('kuest-theme-mode');if(saved==='dark'||saved==='light')mode=saved;}catch(error){}root.setAttribute('data-theme-mode',mode);if(meta){var fallback=mode==='dark'?'#CDFF00':'#0e1117';try{var accent=getComputedStyle(root).getPropertyValue('--color-accent').trim();meta.setAttribute('content',accent||fallback);}catch(error){meta.setAttribute('content',fallback);}}})();";
}

export function buildEmbedPreviewBootstrapScript() {
  return "if(new URLSearchParams(window.location.search).has('embed-preview')){document.documentElement.classList.add('embed-preview');}";
}

export function serializeJsonForHtmlScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003C")
    .replaceAll(">", "\\u003E")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeTranslatedHref(href: string, locale: SiteLocale) {
  const trimmedHref = href.trim();
  const localizedHref = trimmedHref === "/launch" ? localeHref(locale, "/launch") : trimmedHref;

  if (!localizedHref) {
    return null;
  }

  if (localizedHref.startsWith("#")) {
    return localizedHref;
  }

  if (localizedHref.startsWith("/") && !localizedHref.startsWith("//")) {
    return localizedHref;
  }

  if (localizedHref.startsWith("mailto:")) {
    return localizedHref;
  }

  try {
    const url = new URL(localizedHref);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function sanitizeTranslatedClassName(className: string | null) {
  return (className ?? "")
    .split(/\s+/)
    .filter((token) => token === "source-link")
    .join(" ");
}

function sanitizeTranslatedTarget(target: string | null) {
  return target === "_blank" ? "_blank" : null;
}

function sanitizeTranslatedRel(rel: string | null, target: string | null) {
  const allowedTokens = new Set(["noopener", "noreferrer"]);
  const relTokens = new Set(
    (rel ?? "")
      .split(/\s+/)
      .map((token) => token.trim().toLowerCase())
      .filter((token) => allowedTokens.has(token)),
  );

  if (target === "_blank") {
    relTokens.add("noopener");
    relTokens.add("noreferrer");
  }

  return relTokens.size > 0 ? Array.from(relTokens).join(" ") : null;
}

function sanitizeTranslatedNode(node: ChildNode, locale: SiteLocale): string {
  if (node.nodeType === 3) {
    return escapeHtml(node.textContent ?? "");
  }

  if (node.nodeType !== 1) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const childMarkup = Array.from(element.childNodes)
    .map((childNode) => sanitizeTranslatedNode(childNode, locale))
    .join("");

  if (tagName === "br") {
    return "<br>";
  }

  if (tagName === "em" || tagName === "strong") {
    return `<${tagName}>${childMarkup}</${tagName}>`;
  }

  if (tagName === "a") {
    const href = sanitizeTranslatedHref(element.getAttribute("href") ?? "", locale);

    if (!href) {
      return childMarkup;
    }

    const attrs = [`href="${escapeHtml(href)}"`];
    const className = sanitizeTranslatedClassName(element.getAttribute("class"));
    const target = sanitizeTranslatedTarget(element.getAttribute("target"));
    const rel = sanitizeTranslatedRel(element.getAttribute("rel"), target);

    if (className) {
      attrs.push(`class="${escapeHtml(className)}"`);
    }

    if (target) {
      attrs.push(`target="${target}"`);
    }

    if (rel) {
      attrs.push(`rel="${escapeHtml(rel)}"`);
    }

    ["data-source-outlet", "data-source-title", "data-source-summary"].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (value) {
        attrs.push(`${attr}="${escapeHtml(value)}"`);
      }
    });

    return `<a ${attrs.join(" ")}>${childMarkup}</a>`;
  }

  return childMarkup;
}

export function sanitizeTranslatedHtml(html: string, locale: SiteLocale) {
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

  return Array.from(document.body.childNodes)
    .map((node) => sanitizeTranslatedNode(node, locale))
    .join("");
}

export function getDemoLocalePath(locale: SiteLocale) {
  return locale === defaultSiteLocale ? "" : `/${locale}`;
}

export function getDemoHref(locale: SiteLocale) {
  return `${DEMO_ORIGIN}${getDemoLocalePath(locale)}`;
}

export function getDemoEmbedSrc(locale: SiteLocale) {
  const path = getDemoLocalePath(locale);
  return `${DEMO_ORIGIN}${path ? `${path}/` : "/"}?embed-preview=1`;
}

export function getDemoLabel(locale: SiteLocale) {
  return `demo.kuest.com${getDemoLocalePath(locale)}`;
}

export function getLandingHeroAccent(locale: SiteLocale) {
  return LANDING_HERO_TITLE_ACCENT_BY_LOCALE[locale];
}
