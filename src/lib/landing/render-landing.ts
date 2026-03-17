import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseHTML } from "linkedom/worker";
import { __iconNode as activityIconNode } from "lucide-react/dist/esm/icons/activity.js";
import { __iconNode as banknoteIconNode } from "lucide-react/dist/esm/icons/banknote.js";
import { __iconNode as bitcoinIconNode } from "lucide-react/dist/esm/icons/bitcoin.js";
import { __iconNode as chartColumnIncreasingIconNode } from "lucide-react/dist/esm/icons/chart-column-increasing.js";
import { __iconNode as chevronDownIconNode } from "lucide-react/dist/esm/icons/chevron-down.js";
import { __iconNode as chevronRightIconNode } from "lucide-react/dist/esm/icons/chevron-right.js";
import { __iconNode as circleDollarSignIconNode } from "lucide-react/dist/esm/icons/circle-dollar-sign.js";
import { __iconNode as clapperboardIconNode } from "lucide-react/dist/esm/icons/clapperboard.js";
import { __iconNode as dollarSignIconNode } from "lucide-react/dist/esm/icons/dollar-sign.js";
import { __iconNode as flameIconNode } from "lucide-react/dist/esm/icons/flame.js";
import { __iconNode as globe2IconNode } from "lucide-react/dist/esm/icons/earth.js";
import { __iconNode as hexagonIconNode } from "lucide-react/dist/esm/icons/hexagon.js";
import { __iconNode as landmarkIconNode } from "lucide-react/dist/esm/icons/landmark.js";
import { __iconNode as monitorSmartphoneIconNode } from "lucide-react/dist/esm/icons/monitor-smartphone.js";
import { __iconNode as moonIconNode } from "lucide-react/dist/esm/icons/moon.js";
import { __iconNode as slidersHorizontalIconNode } from "lucide-react/dist/esm/icons/sliders-horizontal.js";
import { __iconNode as squarePenIconNode } from "lucide-react/dist/esm/icons/square-pen.js";
import { __iconNode as sunIconNode } from "lucide-react/dist/esm/icons/sun.js";
import { __iconNode as targetIconNode } from "lucide-react/dist/esm/icons/target.js";
import { __iconNode as trophyIconNode } from "lucide-react/dist/esm/icons/trophy.js";
import { __iconNode as usersIconNode } from "lucide-react/dist/esm/icons/users.js";
import { __iconNode as zapIconNode } from "lucide-react/dist/esm/icons/zap.js";
import type { LandingMessages } from "@/i18n/site";
import type { SiteLocale } from "@/i18n/site-config";
import { defaultSiteLocale, getLandingMessages, localeHref } from "@/i18n/site";

const LANDING_TEMPLATE_PATH = join(process.cwd(), "src", "lib", "landing", "template.html");
const DEMO_ORIGIN = "https://demo.kuest.com";
const NICHE_TAB_ICONS = ["bitcoin", "trophy", "landmark", "clapperboard", "users", "flame"];
type LucideIconNode = ReadonlyArray<readonly [string, Record<string, string | number>]>;

const LUCIDE_ICONS: Record<string, LucideIconNode> = {
  activity: activityIconNode,
  banknote: banknoteIconNode,
  bitcoin: bitcoinIconNode,
  "chart-column-increasing": chartColumnIncreasingIconNode,
  "chevron-down": chevronDownIconNode,
  "chevron-right": chevronRightIconNode,
  "circle-dollar-sign": circleDollarSignIconNode,
  clapperboard: clapperboardIconNode,
  "dollar-sign": dollarSignIconNode,
  flame: flameIconNode,
  "globe-2": globe2IconNode,
  hexagon: hexagonIconNode,
  landmark: landmarkIconNode,
  "monitor-smartphone": monitorSmartphoneIconNode,
  moon: moonIconNode,
  "sliders-horizontal": slidersHorizontalIconNode,
  "square-pen": squarePenIconNode,
  sun: sunIconNode,
  target: targetIconNode,
  trophy: trophyIconNode,
  users: usersIconNode,
  zap: zapIconNode,
};

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flagSrc: "/assets/flags/en.svg" },
  { code: "de", label: "Deutsch", flagSrc: "/assets/flags/de.svg" },
  { code: "es", label: "Español", flagSrc: "/assets/flags/es.svg" },
  { code: "pt", label: "Português", flagSrc: "/assets/flags/pt.svg" },
  { code: "fr", label: "Français", flagSrc: "/assets/flags/fr.svg" },
  { code: "zh", label: "中文", flagSrc: "/assets/flags/zh.svg" },
] as const;

const HERO_TITLE_ACCENT_BY_LOCALE: Record<SiteLocale, string> = {
  en: "Free",
  de: "Kostenlos",
  es: "Gratis",
  pt: "Grátis",
  fr: "Gratuit",
  zh: "免费开始",
};

const NICHE_STATIC = [
  {
    accent: "#f7931a",
    accentRgb: "247,147,26",
    cards: [
      { type: "single", img: "/assets/images/bitcoin-150k.png", pct: 61, volValue: "$42k" },
      { type: "single", img: "/assets/images/ethereum-flippening.png", pct: 18, volValue: "$29k" },
      { type: "multi", img: "/assets/images/fed-rate-move.png", rowPcts: [42, 51, 7], volValue: "$31k" },
    ],
  },
  {
    accent: "#34d07f",
    accentRgb: "52,208,127",
    cards: [
      {
        type: "multi",
        img: "/assets/images/champions-league-top-scorer.png",
        rowPcts: [34, 28, 19],
        volValue: "$18k",
      },
      { type: "single", img: "/assets/images/warriors-playoffs.png", pct: 55, volValue: "$11k" },
      { type: "single", img: "/assets/images/daniel-negranu-wsop.png", pct: 38, volValue: "$8k" },
    ],
  },
  {
    accent: "#8b5cf6",
    accentRgb: "139,92,246",
    cards: [
      { type: "single", img: "/assets/images/elon-usa-election.png", pct: 42, volValue: "$331k" },
      { type: "single", img: "/assets/images/russia-x-ukraine.png", pct: 34, volValue: "$22k" },
      { type: "multi", img: "/assets/images/uk-general-election.png", rowPcts: [58, 28, 14], volValue: "$19k" },
    ],
  },
  {
    accent: "#f43f5e",
    accentRgb: "244,63,94",
    cards: [
      { type: "single", img: "/assets/images/marvel-opening-weekend.png", pct: 70, volValue: "$9k" },
      { type: "multi", img: "/assets/images/big-brother-brasil.png", rowPcts: [41, 33, 26], volValue: "$14k" },
      { type: "single", img: "/assets/images/taylor-swift-album.png", pct: 55, volValue: "$6k" },
    ],
  },
  {
    accent: "#4f8ef7",
    accentRgb: "79,142,247",
    cards: [
      { type: "single", img: "/assets/images/uniswap-v4-mainnet.png", pct: 73, volValue: "$7k" },
      {
        type: "multi",
        img: "/assets/images/governance-vote-chain.png",
        rowPcts: [55, 30, 15],
        volValue: "$5k",
      },
      { type: "single", img: "/assets/images/discord-50k-members.png", pct: 44, volValue: "$3k" },
    ],
  },
  {
    accent: "#f5c842",
    accentRgb: "245,200,66",
    cards: [
      { type: "single", img: "/assets/images/mrbeast-vs-tseries.png", pct: 67, volValue: "$21k" },
      { type: "single", img: "/assets/images/elon-500b-net-worth.png", pct: 38, volValue: "$15k" },
      { type: "single", img: "/assets/images/pop-star-arrest.png", pct: 12, volValue: "$9k" },
    ],
  },
] as const;

type LandingNicheCard =
  | {
      type: "single";
      img: string;
      title: string;
      vol: string;
      cat: string;
      pct: number;
    }
  | {
      type: "multi";
      img: string;
      title: string;
      vol: string;
      cat: string;
      rows: Array<{ label: string; pct: number }>;
    };

type LandingNiche = {
  tag: string;
  accent: string;
  accentRgb: string;
  tagline: string;
  cards: LandingNicheCard[];
};

const getLandingTemplate = cache(async () => readFile(LANDING_TEMPLATE_PATH, "utf8"));

function setText(target: Element | null, value?: string | null) {
  if (target) {
    target.textContent = value ?? "";
  }
}

function setHtml(target: Element | null, value?: string | null) {
  if (target) {
    target.innerHTML = value ?? "";
  }
}

function setTextWithAccent(target: Element | null, value: string | null | undefined, accent?: string) {
  if (!target) {
    return;
  }

  const text = value ?? "";
  const accentText = accent?.trim();

  if (!accentText) {
    target.textContent = text;
    return;
  }

  const matchIndex = text.lastIndexOf(accentText);

  if (matchIndex === -1) {
    target.textContent = text;
    return;
  }

  let beforeText = text.slice(0, matchIndex);

  if (/\s$/.test(beforeText)) {
    beforeText = `${beforeText.slice(0, -1)}\u00a0`;
  }

  const before = escapeHtml(beforeText);
  const highlighted = escapeHtml(text.slice(matchIndex, matchIndex + accentText.length));
  const after = escapeHtml(text.slice(matchIndex + accentText.length));

  target.innerHTML = `${before}<span class="hero-title-accent">${highlighted}</span>${after}`;
}

function setAttr(target: Element | null, attr: string, value: string) {
  if (target) {
    target.setAttribute(attr, value);
  }
}

const KUEST_MARK_HTML = '<span class="kuest-logo-mark" aria-hidden="true"></span>';

function buildSolutionSubtitleHtml(titleRest: string[], subtitle: string) {
  const introLines = titleRest.map((line) => line.trim()).filter(Boolean);
  const subtitleLines = subtitle
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const [calloutLine, ...bodyLines] = subtitleLines;
  const conclusionLine = bodyLines.length > 0 ? bodyLines[bodyLines.length - 1] : "";
  const proseLines = conclusionLine ? bodyLines.slice(0, -1) : bodyLines;

  const proseHtml = proseLines.flatMap((line, index) => {
    if (index !== 0) {
      return `<span class="solution-copy-line">${escapeHtml(line)}</span>`;
    }

    const sentenceBreakMatch = line.match(/^(.+?[.!?]["']?)(?:\s+)(.+)$/);

    if (!sentenceBreakMatch) {
      return `<span class="solution-copy-line">${escapeHtml(line)}</span>`;
    }

    const [, firstSentence, remainingCopy] = sentenceBreakMatch;

    return `<span class="solution-copy-block"><span class="solution-copy-line">${escapeHtml(
      firstSentence.trim(),
    )}</span><span class="solution-copy-line">${escapeHtml(remainingCopy.trim())}</span></span>`;
  });

  return [
    ...introLines.map((line) => `<span class="solution-copy-line">${escapeHtml(line)}</span>`),
    calloutLine
      ? `<span class="solution-copy-callout"><span class="solution-copy-callout-mark">${KUEST_MARK_HTML}</span><span>${escapeHtml(calloutLine)}</span></span>`
      : "",
    ...proseHtml,
  ]
    .filter(Boolean)
    .join("");
}

function formatSolutionConclusionHeading(conclusionLine?: string | null) {
  const value = (conclusionLine ?? "").trim();
  return value ? `${value.replace(/[.:!?\u3002\uff01\uff1f]\s*$/, "").trim()}:` : "";
}

function extractSolutionConclusionHeading(subtitle: string) {
  const subtitleLines = subtitle
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const bodyLines = subtitleLines.slice(1);
  const conclusionLine = bodyLines.length > 0 ? bodyLines[bodyLines.length - 1] : "";

  return formatSolutionConclusionHeading(conclusionLine);
}

function stripTrailingArrow(value?: string | null) {
  return (value ?? "").replace(/\s*→\s*$/, "");
}

function stripTerminalPeriod(value?: string | null) {
  return (value ?? "").replace(/[.。]\s*$/, "");
}

function extractLargestMoneyToken(value?: string | null) {
  const matches = (value ?? "").match(/\$\d+(?:\.\d+)?[TBMK]?/g);

  if (!matches?.length) {
    return "";
  }

  const multiplierBySuffix: Record<string, number> = {
    K: 1_000,
    M: 1_000_000,
    B: 1_000_000_000,
    T: 1_000_000_000_000,
  };

  const best = matches.reduce<{ token: string; value: number } | null>((largest, token) => {
    const [, amountText = "0", suffix = ""] = token.match(/^\$(\d+(?:\.\d+)?)([TBMK]?)$/) ?? [];
    const numericValue = Number(amountText) * (multiplierBySuffix[suffix] ?? 1);

    if (!largest || numericValue > largest.value) {
      return { token, value: numericValue };
    }

    return largest;
  }, null);

  return best?.token ?? matches[0];
}

function setCtaContent(target: Element | null, value?: string | null) {
  if (!target) {
    return;
  }

  target.innerHTML = `<span class="cta-label">${escapeHtml(stripTrailingArrow(value))}</span><i data-lucide="chevron-right"></i>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeImageSrc(src: string) {
  const prefix = "/assets/images/";

  if (!src.startsWith(prefix)) {
    return "/assets/images/bitcoin-150k.png";
  }

  const relative = src.slice(prefix.length);
  if (!relative) {
    return "/assets/images/bitcoin-150k.png";
  }

  const segments = relative.split("/");
  return segments.every((segment) => segment && segment !== "." && segment !== ".." && /^[\w.-]+$/.test(segment))
    ? `${prefix}${segments.join("/")}`
    : "/assets/images/bitcoin-150k.png";
}

function toSvgAttrName(name: string) {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function renderLucideIcon(name: string) {
  const iconNode = LUCIDE_ICONS[name];

  if (!iconNode) {
    return "";
  }

  const iconChildren = iconNode
    .map(([tagName, attrs]) => {
      const attrString = Object.entries(attrs)
        .filter(([attrName]) => attrName !== "key")
        .map(([attrName, value]) => `${toSvgAttrName(attrName)}="${escapeHtml(String(value))}"`)
        .join(" ");

      return `<${tagName}${attrString ? ` ${attrString}` : ""}></${tagName}>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}" aria-hidden="true" focusable="false">${iconChildren}</svg>`;
}

function replaceLucidePlaceholders(document: Document) {
  document.querySelectorAll("[data-lucide]").forEach((placeholder) => {
    const iconName = placeholder.getAttribute("data-lucide");

    if (!iconName) {
      return;
    }

    const iconMarkup = renderLucideIcon(iconName);
    if (!iconMarkup) {
      return;
    }

    placeholder.outerHTML = iconMarkup;
  });
}

function serializeForInlineScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003C")
    .replaceAll(">", "\\u003E")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function sanitizeTranslatedHref(href: string, locale: SiteLocale) {
  const trimmedHref = href.trim();
  const localizedHref = trimmedHref === "/launch" ? localeHref(locale, "/launch") : trimmedHref;

  if (!localizedHref) {
    return null;
  }

  if (localizedHref.startsWith("/") || localizedHref.startsWith("#")) {
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

function sanitizeTranslatedHtml(html: string, locale: SiteLocale) {
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

  return Array.from(document.body.childNodes)
    .map((node) => sanitizeTranslatedNode(node, locale))
    .join("");
}

function getDemoLocalePath(locale: SiteLocale) {
  return locale === defaultSiteLocale ? "" : `/${locale}`;
}

function getDemoHref(locale: SiteLocale) {
  return `${DEMO_ORIGIN}${getDemoLocalePath(locale)}`;
}

function getDemoEmbedSrc(locale: SiteLocale) {
  const path = getDemoLocalePath(locale);
  return `${DEMO_ORIGIN}${path ? `${path}/` : "/"}?embed-preview=1`;
}

function getDemoLabel(locale: SiteLocale) {
  return `demo.kuest.com${getDemoLocalePath(locale)}`;
}

function buildNicheData(bundle: LandingMessages, fallbackBundle: LandingMessages): LandingNiche[] {
  return NICHE_STATIC.map((staticNiche, nicheIndex) => {
    const fallbackTranslated = fallbackBundle.niches.data[nicheIndex];
    const translated = bundle.niches.data[nicheIndex] ?? fallbackTranslated;

    return {
      tag: translated?.tag ?? fallbackTranslated?.tag ?? bundle.niches.tabs[nicheIndex] ?? "",
      accent: staticNiche.accent,
      accentRgb: staticNiche.accentRgb,
      tagline: translated?.tagline ?? fallbackTranslated?.tagline ?? "",
      cards: staticNiche.cards.map((staticCard, cardIndex) => {
        const fallbackCard = fallbackTranslated?.cards[cardIndex];
        const translatedCard = translated?.cards[cardIndex] ?? fallbackCard;
        const base = {
          type: staticCard.type,
          img: staticCard.img,
          title: translatedCard?.title ?? fallbackCard?.title ?? "",
          vol: `${staticCard.volValue} ${bundle.niches.volumeSuffix ?? fallbackBundle.niches.volumeSuffix}`,
          cat: translatedCard?.cat ?? fallbackCard?.cat ?? "",
        };

        if (staticCard.type === "single") {
          return {
            ...base,
            type: "single" as const,
            pct: staticCard.pct,
          };
        }

        const rowLabels: string[] =
          translatedCard && "rows" in translatedCard
            ? translatedCard.rows ?? []
            : fallbackCard && "rows" in fallbackCard
              ? fallbackCard.rows ?? []
              : [];

        return {
          ...base,
          type: "multi" as const,
          rows: staticCard.rowPcts.map((pct, rowIndex) => ({
            label: rowLabels[rowIndex] ?? "",
            pct,
          })),
        };
      }),
    };
  });
}

function buildPredictionShowcaseCardHtml(
  card: LandingNicheCard,
  niche: LandingNiche,
  ui: { yes: string; no: string },
) {
  const isLongTitle = card.title.length > 58;
  const rows =
    card.type === "single"
      ? [
          { label: ui.yes, pct: card.pct },
          { label: ui.no, pct: Math.max(0, 100 - card.pct) },
        ]
      : card.rows;

  return `<article class="prediction-showcase-card" style="--prediction-accent:${escapeHtml(niche.accent)};--prediction-accent-rgb:${escapeHtml(
    niche.accentRgb,
  )};"><img src="${escapeHtml(sanitizeImageSrc(card.img))}" alt="" class="prediction-showcase-thumb"><h3 class="prediction-showcase-title${
    isLongTitle ? " is-long" : ""
  }">${escapeHtml(
    card.title,
  )}</h3><div class="prediction-showcase-list">${rows
    .map(
      (row) =>
        `<div class="prediction-showcase-row"><span class="prediction-showcase-row-label">${escapeHtml(
          row.label,
        )}</span><span class="prediction-showcase-row-track"><span class="prediction-showcase-row-fill" style="width:${row.pct}%"></span></span><span class="prediction-showcase-row-pct">${row.pct}%</span></div>`,
    )
    .join("")}</div></article>`;
}

function buildLanguageMenu(locale: SiteLocale) {
  return LANGUAGE_OPTIONS.map((option) => {
    const isSelected = option.code === locale;

    return `<a href="${localeHref(option.code)}" class="site-language-option${
      isSelected ? " is-selected" : ""
    }" role="option" aria-selected="${isSelected}"><span class="site-language-option-row"><img class="site-language-flag" src="${option.flagSrc}" alt="" width="18" height="12"><span>${option.label}</span></span></a>`;
  }).join("");
}

export async function renderLandingMarkup(locale: SiteLocale, bundle: LandingMessages) {
  const template = await getLandingTemplate();
  const { document } = parseHTML(template);
  const fallbackBundle = locale === defaultSiteLocale ? bundle : await getLandingMessages(defaultSiteLocale);
  const nicheData = buildNicheData(bundle, fallbackBundle);
  const initialNiche = nicheData[0];
  const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.code === locale) ?? LANGUAGE_OPTIONS[0];
  const launchHref = localeHref(locale, "/launch");
  const protocolHref = localeHref(locale, "/protocol");

  document.querySelectorAll("script").forEach((script) => script.remove());

  document.documentElement.setAttribute("lang", locale);

  document.querySelectorAll("nav .nav-logo").forEach((logo) => setAttr(logo, "href", localeHref(locale)));
  [
    {
      button: "#siteLanguageButton",
      menu: "#siteLanguageMenu",
      flag: "#siteLanguageCurrentFlag",
      label: "#siteLanguageCurrentLabel",
    },
    {
      button: "#heroBrandLanguageButton",
      menu: "#heroBrandLanguageMenu",
      flag: "#heroBrandLanguageCurrentFlag",
      label: "#heroBrandLanguageCurrentLabel",
    },
    {
      button: "#dockSiteLanguageButton",
      menu: "#dockSiteLanguageMenu",
      flag: "#dockSiteLanguageCurrentFlag",
      label: "#dockSiteLanguageCurrentLabel",
    },
  ].forEach((control) => {
    setAttr(document.querySelector(control.button), "aria-label", bundle.languageSelector.ariaLabel);
    setAttr(document.querySelector(control.menu), "aria-label", bundle.languageSelector.ariaLabel);
    setAttr(document.querySelector(control.flag), "src", currentLanguage.flagSrc);
    setText(document.querySelector(control.label), currentLanguage.label);
    setHtml(document.querySelector(control.menu), buildLanguageMenu(locale));
  });
  document.querySelectorAll("nav .nav-cta").forEach((cta) => {
    setCtaContent(cta, bundle.nav.cta);
    setAttr(cta, "href", launchHref);
  });
  setAttr(document.querySelector("#dockSiteNavProtocolOption"), "href", protocolHref);

  const heroLines = Array.from(document.querySelectorAll(".hero-title-line"));
  setText(document.querySelector(".hero-kicker"), bundle.hero.kicker);
  setText(heroLines[0] ?? null, stripTerminalPeriod(bundle.hero.titleLine1));
  setTextWithAccent(
    heroLines[1] ?? null,
    stripTerminalPeriod(bundle.hero.titleLine2),
    HERO_TITLE_ACCENT_BY_LOCALE[locale],
  );
  setText(document.querySelector("#attentionLine1"), bundle.attentionScroll.block1.line1);
  setText(document.querySelector("#attentionLine2"), bundle.attentionScroll.block1.line2);
  setText(document.querySelector("#attentionLine3"), bundle.attentionScroll.block1.line3);
  setText(document.querySelector("#attentionLine4"), bundle.attentionScroll.block1.line4);
  setText(document.querySelector("#attentionLine5"), bundle.attentionScroll.block2.line1);
  setText(document.querySelector("#attentionLine6"), bundle.attentionScroll.block2.line3);
  setText(document.querySelector("#attentionLine7"), bundle.attentionScroll.block2.line4);
  setText(document.querySelector("#attentionLine8"), bundle.attentionScroll.block3.lead);
  setText(document.querySelector("#attentionLine9"), bundle.attentionScroll.block3.line2);
  setText(document.querySelector("#attentionLine10"), bundle.attentionScroll.block3.line3);
  setText(document.querySelector(".hero-copy-sub"), bundle.hero.subtitle);
  setCtaContent(document.querySelector(".hero-copy-actions .btn-cta"), bundle.hero.cta);
  setAttr(document.querySelector(".hero-copy-actions .btn-cta"), "href", launchHref);
  setText(document.querySelector(".hero-copy-proof"), bundle.hero.proof);
  setText(document.querySelector("#siteDemoTitle"), bundle.preview.title);
  setText(document.querySelector("#siteDemoSubtitle"), bundle.preview.subtitle);
  setText(document.querySelector(".site-preview-url"), getDemoLabel(locale));
  setAttr(document.querySelector(".site-preview-url"), "href", getDemoHref(locale));
  setAttr(document.querySelector("#sitePreviewFrame"), "src", getDemoEmbedSrc(locale));

  setText(document.querySelector("#predictionExplainerEyebrow"), bundle.social.eyebrow);
  setText(document.querySelector("#predictionExplainerTitle"), bundle.social.title);
  setText(document.querySelector("#predictionExplainerSubtitle"), bundle.social.subtitle);
  const predictionTabs = Array.from(document.querySelectorAll("#predictionNicheTabs .niche-tab"));
  predictionTabs.forEach((tab, index) => {
    const label = bundle.niches.tabs[index] ?? fallbackBundle.niches.tabs[index];
    if (!label) {
      return;
    }

    setHtml(tab, `<i data-lucide="${NICHE_TAB_ICONS[index]}"></i> ${escapeHtml(label)}`);
  });
  setHtml(
    document.querySelector("#predictionNicheCardsGrid"),
    initialNiche.cards
      .map((card) =>
        buildPredictionShowcaseCardHtml(card, initialNiche, {
          yes: bundle.common.yes,
          no: bundle.common.no,
        }),
      )
      .join(""),
  );

  const [solutionHeadline, ...solutionTitleRest] = bundle.solution.title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  setText(document.querySelector("#p3 .sh"), solutionHeadline ?? bundle.solution.title);
  setHtml(document.querySelector("#p3 .bt"), buildSolutionSubtitleHtml(solutionTitleRest, bundle.solution.subtitle));
  setText(document.querySelector("#solutionFlowHeading"), extractSolutionConclusionHeading(bundle.solution.subtitle));
  bundle.solution.points.forEach((point, index) => {
    setText(document.querySelector(`#solutionTimelineTitle${index + 1}`), point.title);
    setText(document.querySelector(`#solutionTimelineText${index + 1}`), point.copy);
  });
  setCtaContent(document.querySelector("#solutionCtaBtn"), bundle.solution.cta);
  setAttr(document.querySelector("#solutionCtaBtn"), "href", launchHref);
  setText(document.querySelector("#solutionCtaNote"), bundle.solution.note);
  setHtml(
    document.querySelector("#solutionProofRotator"),
    bundle.social.cards
      .map((card, index) => {
        const safeLabel = escapeHtml(card.label);
        const safeCopy = sanitizeTranslatedHtml(card.subHtml, locale);
        const safeValue = escapeHtml(extractLargestMoneyToken(card.subHtml));

        return `<article class="solution-proof-card${index === 0 ? " is-active" : ""}"><div class="solution-proof-card-label">${safeLabel}</div><div class="solution-proof-card-value">${safeValue}</div><div class="solution-proof-card-copy">${safeCopy}</div></article>`;
      })
      .join(""),
  );

  setText(document.querySelector("#p8 .sh"), "FAQ");
  setHtml(
    document.querySelector("#p8 .faq-list"),
    bundle.faq.items
      .map(
        (item) =>
          `<details class="faq-item"><summary class="faq-q" aria-expanded="false">${escapeHtml(item.q)}</summary><div class="faq-divider" aria-hidden="true"></div><div class="faq-panel"><div class="faq-panel-inner"><div class="faq-a">${sanitizeTranslatedHtml(item.aHtml, locale)}</div></div></div></details>`,
      )
      .join(""),
  );

  setText(document.querySelector("#p9 .slbl"), bundle.finalCta.eyebrow);
  setText(document.querySelector("#p9 .cta-h"), bundle.finalCta.title);
  setText(document.querySelector("#p9 .cta-sub"), bundle.finalCta.subtitle);
  setCtaContent(document.querySelector("#p9 .btn-cta"), bundle.finalCta.cta);
  setAttr(document.querySelector("#p9 .btn-cta"), "href", launchHref);
  setText(document.querySelector("#p9 .cta-note"), bundle.finalCta.note);

  [
    { selector: "#footerDocsLink", label: bundle.footer.docs },
    { selector: "#footerMailLink", label: bundle.footer.contact },
    { selector: "#footerXLink", label: "X" },
    { selector: "#footerDiscordLink", label: "Discord" },
  ].forEach(({ selector, label }) => {
    const link = document.querySelector(selector);
    setAttr(link, "aria-label", label);
    setAttr(link, "title", label);
  });

  setText(document.querySelector("#sourceModalOutlet"), bundle.sourceModal.outlet);
  setText(document.querySelector("#sourceModalTitle"), bundle.sourceModal.title);
  setText(document.querySelector("#sourceModalLoading"), bundle.sourceModal.loading);
  setText(document.querySelector("#sourceModalNote"), bundle.sourceModal.note);
  setText(document.querySelector("#sourceModalExternal"), bundle.sourceModal.external);
  setText(document.querySelector(".source-modal-actions button[data-source-close]"), bundle.sourceModal.back);

  replaceLucidePlaceholders(document);

  document.querySelectorAll('a[href="/launch"]').forEach((link) => {
    link.setAttribute("href", launchHref);
  });

  return {
    markup: document.body.innerHTML,
    nicheData,
  };
}

export function buildLandingRuntimeScript(
  bundle: LandingMessages,
  nicheData: LandingNiche[],
) {
  const runtimeMessages = {
    preview: bundle.preview,
    sourceModal: {
      dynamicNote: bundle.sourceModal.dynamicNote,
    },
  };

  return `window.KUEST_I18N_MESSAGES=${serializeForInlineScript(runtimeMessages)};window.KUEST_I18N={t:function(key,options){var value=window.KUEST_I18N_MESSAGES;key.split(".").forEach(function(part){value=value&&value[part];});if(typeof value!=="string")return"";return value.replace(/\\{\\{(\\w+)\\}\\}/g,function(match,name){return options&&options[name]!=null?String(options[name]):match;});}};window.KUEST_I18N_UI=${serializeForInlineScript({yes: bundle.common.yes, no: bundle.common.no, chance: bundle.common.chance})};window.NICHE_DATA=${serializeForInlineScript(nicheData)};`;
}
