import { cache } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseHTML } from "linkedom/worker";
import { __iconNode as activityIconNode } from "lucide-react/dist/esm/icons/activity.js";
import { __iconNode as banknoteIconNode } from "lucide-react/dist/esm/icons/banknote.js";
import { __iconNode as bitcoinIconNode } from "lucide-react/dist/esm/icons/bitcoin.js";
import { __iconNode as chartColumnIncreasingIconNode } from "lucide-react/dist/esm/icons/chart-column-increasing.js";
import { __iconNode as chevronDownIconNode } from "lucide-react/dist/esm/icons/chevron-down.js";
import { __iconNode as circleDollarSignIconNode } from "lucide-react/dist/esm/icons/circle-dollar-sign.js";
import { __iconNode as clapperboardIconNode } from "lucide-react/dist/esm/icons/clapperboard.js";
import { __iconNode as dollarSignIconNode } from "lucide-react/dist/esm/icons/dollar-sign.js";
import { __iconNode as flameIconNode } from "lucide-react/dist/esm/icons/flame.js";
import { __iconNode as globe2IconNode } from "lucide-react/dist/esm/icons/earth.js";
import { __iconNode as hexagonIconNode } from "lucide-react/dist/esm/icons/hexagon.js";
import { __iconNode as landmarkIconNode } from "lucide-react/dist/esm/icons/landmark.js";
import { __iconNode as monitorSmartphoneIconNode } from "lucide-react/dist/esm/icons/monitor-smartphone.js";
import { __iconNode as slidersHorizontalIconNode } from "lucide-react/dist/esm/icons/sliders-horizontal.js";
import { __iconNode as squarePenIconNode } from "lucide-react/dist/esm/icons/square-pen.js";
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
  "circle-dollar-sign": circleDollarSignIconNode,
  clapperboard: clapperboardIconNode,
  "dollar-sign": dollarSignIconNode,
  flame: flameIconNode,
  "globe-2": globe2IconNode,
  hexagon: hexagonIconNode,
  landmark: landmarkIconNode,
  "monitor-smartphone": monitorSmartphoneIconNode,
  "sliders-horizontal": slidersHorizontalIconNode,
  "square-pen": squarePenIconNode,
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

const NICHE_STATIC = [
  {
    accent: "#0f6b54",
    accentRgb: "15,107,84",
    cards: [
      { type: "single", img: "/assets/images/bitcoin-150k.png", pct: 61, volValue: "$42k" },
      { type: "single", img: "/assets/images/ethereum-flippening.png", pct: 18, volValue: "$29k" },
      { type: "multi", img: "/assets/images/fed-rate-move.png", rowPcts: [42, 51, 7], volValue: "$31k" },
    ],
  },
  {
    accent: "#b93e34",
    accentRgb: "185,62,52",
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
    accent: "#6c56c9",
    accentRgb: "108,86,201",
    cards: [
      { type: "single", img: "/assets/images/elon-usa-election.png", pct: 42, volValue: "$331k" },
      { type: "single", img: "/assets/images/russia-x-ukraine.png", pct: 34, volValue: "$22k" },
      { type: "multi", img: "/assets/images/uk-general-election.png", rowPcts: [58, 28, 14], volValue: "$19k" },
    ],
  },
  {
    accent: "#c73a66",
    accentRgb: "199,58,102",
    cards: [
      { type: "single", img: "/assets/images/marvel-opening-weekend.png", pct: 70, volValue: "$9k" },
      { type: "multi", img: "/assets/images/big-brother-brasil.png", rowPcts: [41, 33, 26], volValue: "$14k" },
      { type: "single", img: "/assets/images/taylor-swift-album.png", pct: 55, volValue: "$6k" },
    ],
  },
  {
    accent: "#2b6a57",
    accentRgb: "43,106,87",
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
    accent: "#8aa219",
    accentRgb: "138,162,25",
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

function setAttr(target: Element | null, attr: string, value: string) {
  if (target) {
    target.setAttribute(attr, value);
  }
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

function sanitizeTradeOutcomeClass(sideClass: string) {
  return sideClass === "yes" || sideClass === "no" ? sideClass : "neutral";
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

function buildTradeFeed(
  trades: Array<{
    avatar: string;
    name: string;
    action: string;
    side: string;
    sideClass: string;
    entry: string;
  }>,
) {
  return trades
    .concat(trades.slice(0, 2))
    .map(
      (item) => {
        const safeOutcomeClass = sanitizeTradeOutcomeClass(item.sideClass);
        return `<div class="mini-trade-row"><span class="mini-trade-avatar">${escapeHtml(item.avatar)}</span><span class="mini-trade-text"><span class="mini-trade-name">${escapeHtml(item.name)}</span> <span class="mini-trade-verb">${escapeHtml(item.action)}</span> <strong class="mini-trade-outcome is-${safeOutcomeClass}">${escapeHtml(item.side)}</strong> <span class="mini-trade-entry-price">${escapeHtml(item.entry)}</span></span></div>`;
      },
    )
    .join("");
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

function buildGaugeHtml(pct: number, chanceLabel: string) {
  const arcLen = 62.8;
  const offset = arcLen - (arcLen * pct) / 100;

  return `<div class="niche-market-gauge"><svg width="48" height="32" viewBox="0 0 48 32" fill="none"><path d="M4 28 A20 20 0 0 1 44 28" stroke="#d6cdc0" stroke-width="5" stroke-linecap="round"></path><path d="M4 28 A20 20 0 0 1 44 28" stroke="#15795a" stroke-width="5" stroke-linecap="round" stroke-dasharray="62.8" stroke-dashoffset="${offset}"></path></svg><div class="niche-market-gauge-value">${pct}%</div><div class="niche-market-gauge-label">${escapeHtml(chanceLabel)}</div></div>`;
}

function buildNicheCardHtml(
  card: LandingNicheCard,
  ui: { yes: string; no: string; chance: string },
) {
  const safeYes = escapeHtml(ui.yes);
  const safeNo = escapeHtml(ui.no);
  const safeTitle = escapeHtml(card.title);
  const safeVolume = escapeHtml(card.vol);
  const safeCategory = escapeHtml(card.cat);
  const safeImageSrc = escapeHtml(sanitizeImageSrc(card.img));
  const gauge = card.type === "single" ? buildGaugeHtml(card.pct, ui.chance) : "";
  const body =
    card.type === "single"
      ? `<div class="niche-market-body niche-market-body-single"><div class="niche-market-actions"><button class="niche-market-btn niche-market-btn-yes">${safeYes}</button><button class="niche-market-btn niche-market-btn-no">${safeNo}</button></div></div>`
      : `<div class="niche-market-body niche-market-body-multi"><div class="niche-market-list">${card.rows
          .map(
            (row) =>
              `<div class="niche-market-list-row"><span class="niche-market-row-label">${escapeHtml(row.label)}</span><div class="niche-market-row-actions"><span class="niche-market-row-pct">${row.pct}%</span><button class="niche-market-btn niche-market-btn-mini niche-market-btn-yes">${safeYes}</button><button class="niche-market-btn niche-market-btn-mini niche-market-btn-no">${safeNo}</button></div></div>`,
          )
          .join("")}</div></div>`;

  return `<div class="niche-market-card"><div class="niche-market-head"><img src="${safeImageSrc}" alt="" class="niche-market-thumb"><div class="niche-market-title-wrap"><div class="niche-market-title">${safeTitle}</div></div>${gauge}</div>${body}<div class="niche-market-footer"><span class="niche-market-volume">${safeVolume}</span><span class="niche-market-category">${safeCategory}</span></div></div>`;
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

  document.querySelectorAll("script").forEach((script) => script.remove());

  document.documentElement.setAttribute("lang", locale);

  setAttr(document.querySelector(".nav-logo"), "href", localeHref(locale));
  setAttr(document.querySelector("#siteLanguageButton"), "aria-label", bundle.languageSelector.ariaLabel);
  setAttr(document.querySelector("#siteLanguageMenu"), "aria-label", bundle.languageSelector.ariaLabel);
  setAttr(document.querySelector("#siteLanguageCurrentFlag"), "src", currentLanguage.flagSrc);
  setText(document.querySelector("#siteLanguageCurrentLabel"), currentLanguage.label);
  setHtml(document.querySelector("#siteLanguageMenu"), buildLanguageMenu(locale));
  setText(document.querySelector("nav .nb-solid"), bundle.nav.cta);

  const heroLines = Array.from(document.querySelectorAll(".hero-title-line"));
  setText(document.querySelector(".hero-kicker"), bundle.hero.kicker);
  setText(heroLines[0] ?? null, bundle.hero.titleLine1);
  setText(heroLines[1] ?? null, bundle.hero.titleLine2);
  setText(document.querySelector(".hero-copy-sub"), bundle.hero.subtitle);
  setText(document.querySelector(".hero-copy-actions .btn-cta"), bundle.hero.cta);
  setAttr(document.querySelector(".hero-copy-actions .btn-cta"), "href", launchHref);
  setText(document.querySelector(".hero-copy-proof"), bundle.hero.proof);
  setText(document.querySelector(".site-preview-url"), getDemoLabel(locale));
  setAttr(document.querySelector(".site-preview-url"), "href", getDemoHref(locale));
  setAttr(document.querySelector("#sitePreviewFrame"), "src", getDemoEmbedSrc(locale));

  const socialCards = Array.from(document.querySelectorAll("#p2 .mn"));
  setText(document.querySelector("#p2 .slbl"), bundle.social.eyebrow);
  setText(document.querySelector("#p2 .sh"), bundle.social.title);
  setText(document.querySelector("#p2 .bt"), bundle.social.subtitle);
  setHtml(
    document.querySelector("#p2 .live-badge"),
    `<div class="live-dot"></div>${escapeHtml(bundle.social.badge)}`,
  );
  socialCards.forEach((card, index) => {
    const data = bundle.social.cards[index];
    if (!data) {
      return;
    }

    setText(card.querySelector(".mn-label"), data.label);
    setHtml(card.querySelector(".mn-sub"), sanitizeTranslatedHtml(data.subHtml, locale));
  });

  const problemCards = Array.from(document.querySelectorAll("#p1 .mini-card"));
  setText(document.querySelector("#p1 .slbl"), bundle.problems.eyebrow);
  setText(document.querySelector("#p1 .sh"), bundle.problems.title);
  setText(document.querySelector("#p1 .bt"), bundle.problems.subtitle);
  problemCards.forEach((card, index) => {
    const data = bundle.problems.cards[index];
    if (!data) {
      return;
    }

    setText(card.querySelector(".mini-card-title"), data.title);
    setText(card.querySelector(".mini-card-copy"), data.copy);
  });

  const solutionPoints = Array.from(document.querySelectorAll("#p3 .solution-point"));
  setText(document.querySelector("#p3 .slbl"), bundle.solution.eyebrow);
  setText(document.querySelector("#p3 .sh"), bundle.solution.title);
  setText(document.querySelector("#p3 .bt"), bundle.solution.subtitle);
  setText(document.querySelector("#solutionCtaBtn"), bundle.hero.cta);
  setAttr(document.querySelector("#solutionCtaBtn"), "href", launchHref);
  setText(document.querySelector("#solutionCtaNote"), bundle.hero.proof);
  solutionPoints.forEach((point, index) => {
    const data = bundle.solution.points[index];
    if (!data) {
      return;
    }

    setText(point.querySelector("h3"), data.title);
    setText(point.querySelector("p"), data.copy);
  });

  setText(document.querySelector("#marketMockTitle"), bundle.solution.mock.title);
  setText(document.querySelector("#marketMockChanceSuffix"), bundle.solution.mock.chanceSuffix);
  setText(document.querySelector("#marketMockLogoLabel"), bundle.solution.mock.logoLabel);
  setHtml(
    document.querySelector("#marketMockMeta"),
    sanitizeTranslatedHtml(bundle.solution.mock.metaHtml, locale),
  );
  setText(document.querySelector("#marketMockYesBtn"), bundle.solution.mock.yesButton);
  setText(document.querySelector("#marketMockNoBtn"), bundle.solution.mock.noButton);

  const featureCards = Array.from(document.querySelectorAll("#p4 .mini-card"));
  setText(document.querySelector("#p4 .slbl"), bundle.features.eyebrow);
  setText(document.querySelector("#p4 .sh"), bundle.features.title);
  setText(document.querySelector("#p4 .bt"), bundle.features.subtitle);

  if (featureCards[0]) {
    setText(featureCards[0].querySelector(".mini-card-title"), bundle.features.cards[0].title);
    setText(featureCards[0].querySelector(".mini-card-copy"), bundle.features.cards[0].copy);
  }

  if (featureCards[1]) {
    setText(featureCards[1].querySelector(".mini-card-title"), bundle.features.cards[1].title);
    setText(featureCards[1].querySelector(".mini-card-copy"), bundle.features.cards[1].copy);
    setText(featureCards[1].querySelector(".mini-vote-question"), bundle.features.cards[1].question);
    const voteButtons = Array.from(featureCards[1].querySelectorAll(".mini-vote-btn"));
    setText(voteButtons[0] ?? null, bundle.common.yes);
    setText(voteButtons[1] ?? null, bundle.common.no);
  }

  if (featureCards[2]) {
    setText(featureCards[2].querySelector(".mini-card-title"), bundle.features.cards[2].title);
    setText(featureCards[2].querySelector(".mini-card-copy"), bundle.features.cards[2].copy);
    setText(featureCards[2].querySelector(".mini-trade-head > span:first-child"), bundle.features.cards[2].feedStatus);
    setHtml(
      featureCards[2].querySelector(".mini-trade-status"),
      `<span class="mini-trade-status-dot"></span>${escapeHtml(bundle.features.cards[2].feedLabel ?? "")}`,
    );
    setHtml(
      featureCards[2].querySelector(".mini-trade-track"),
      buildTradeFeed(bundle.features.cards[2].trades ?? []),
    );
  }

  setText(document.querySelector("#p5 .slbl"), bundle.calculator.eyebrow);
  setText(document.querySelector("#p5 .sh"), bundle.calculator.title);
  const calcLabels = Array.from(document.querySelectorAll("#p5 .calc-label"));
  setText(calcLabels[0] ?? null, bundle.calculator.dailyVolumeLabel);
  setText(calcLabels[1] ?? null, bundle.calculator.feeLabel);
  setAttr(document.querySelector("#feeSlider"), "aria-label", bundle.calculator.dailyVolumeAriaLabel);
  setAttr(document.querySelector("#feeRateDown"), "aria-label", bundle.calculator.decreaseFeeAriaLabel);
  setAttr(document.querySelector("#feeRateUp"), "aria-label", bundle.calculator.increaseFeeAriaLabel);
  setText(document.querySelector("#p5 .calc-result-label"), bundle.calculator.resultLabel);
  setText(document.querySelector("#p5 .calc-note"), bundle.calculator.note);
  setText(document.querySelector("#calculatorCtaPrompt"), bundle.calculator.ctaPrompt);
  setText(document.querySelector("#calculatorCtaBtn"), bundle.hero.cta);
  setAttr(document.querySelector("#calculatorCtaBtn"), "href", launchHref);
  setText(document.querySelector("#calculatorCtaNote"), bundle.hero.proof);

  const whyNowCards = Array.from(document.querySelectorAll("#p6 .mn"));
  setText(document.querySelector("#p6 .slbl"), bundle.whyNow.eyebrow);
  setText(document.querySelector("#p6 .sh"), bundle.whyNow.title);
  setText(document.querySelector("#p6 .bt"), bundle.whyNow.subtitle);
  whyNowCards.forEach((card, index) => {
    const data = bundle.whyNow.cards[index];
    if (!data) {
      return;
    }

    setText(card.querySelector(".mn-label"), data.label);
    setText(card.querySelector(".mn-sub"), data.sub);
  });

  setText(document.querySelector("#p7 .slbl"), bundle.niches.eyebrow);
  setText(document.querySelector("#p7 .sh"), bundle.niches.title);
  setText(document.querySelector("#nichesCtaPrompt"), bundle.niches.ctaPrompt);
  setText(document.querySelector("#nichesCtaBtn"), bundle.hero.cta);
  setAttr(document.querySelector("#nichesCtaBtn"), "href", launchHref);
  setText(document.querySelector("#nichesCtaNote"), bundle.hero.proof);

  const nicheTabs = Array.from(document.querySelectorAll("#nicheTabs .niche-tab"));
  nicheTabs.forEach((tab, index) => {
    const label = bundle.niches.tabs[index] ?? fallbackBundle.niches.tabs[index];
    if (!label) {
      return;
    }

    setHtml(tab, `<i data-lucide="${NICHE_TAB_ICONS[index]}"></i> ${escapeHtml(label)}`);
  });
  setText(document.querySelector("#nicheTagline"), initialNiche.tagline);
  setHtml(
    document.querySelector("#nicheCardsGrid"),
    initialNiche.cards
      .map((card) =>
        buildNicheCardHtml(card, {
          yes: bundle.common.yes,
          no: bundle.common.no,
          chance: bundle.common.chance,
        }),
      )
      .join(""),
  );

  setText(document.querySelector("#p8 .slbl"), bundle.faq.eyebrow);
  setHtml(document.querySelector("#p8 .sh"), sanitizeTranslatedHtml(bundle.faq.titleHtml, locale));
  setHtml(
    document.querySelector("#p8 .faq-list"),
    bundle.faq.items
      .map(
        (item) =>
          `<details class="faq-item"><summary class="faq-q" aria-expanded="false">${escapeHtml(item.q)}</summary><div class="faq-a">${sanitizeTranslatedHtml(item.aHtml, locale)}</div></details>`,
      )
      .join(""),
  );

  setText(document.querySelector("#p9 .slbl"), bundle.finalCta.eyebrow);
  setText(document.querySelector("#p9 .cta-h"), bundle.finalCta.title);
  setText(document.querySelector("#p9 .cta-sub"), bundle.finalCta.subtitle);
  setText(document.querySelector("#p9 .btn-cta"), bundle.finalCta.cta);
  setAttr(document.querySelector("#p9 .btn-cta"), "href", launchHref);
  setText(document.querySelector("#p9 .cta-note"), bundle.finalCta.note);

  const footerLinks = Array.from(document.querySelectorAll(".foot-links a"));
  if (footerLinks[0]) {
    footerLinks[0].textContent = bundle.footer.launch;
    footerLinks[0].setAttribute("href", launchHref);
  }
  if (footerLinks[1]) {
    footerLinks[1].textContent = bundle.footer.demo;
  }
  if (footerLinks[2]) {
    footerLinks[2].textContent = bundle.footer.docs;
  }
  if (footerLinks[5]) {
    footerLinks[5].textContent = bundle.footer.contact;
  }
  setText(document.querySelector("#footerLiveText"), bundle.footer.live);

  setText(document.querySelector("#sourceModalOutlet"), bundle.sourceModal.outlet);
  setText(document.querySelector("#sourceModalTitle"), bundle.sourceModal.title);
  setText(document.querySelector("#sourceModalLoading"), bundle.sourceModal.loading);
  setText(document.querySelector("#sourceModalNote"), bundle.sourceModal.note);
  setText(document.querySelector("#sourceModalExternal"), bundle.sourceModal.external);
  setText(document.querySelector(".source-modal-actions button[data-source-close]"), bundle.sourceModal.back);

  const languageDemoSelect = document.querySelector("#languageDemoSelect");
  if (languageDemoSelect) {
    const demoOptions = Array.from(languageDemoSelect.querySelectorAll("option"));
    demoOptions.forEach((option, index) => {
      const languageOption = LANGUAGE_OPTIONS[index];
      if (!languageOption) {
        return;
      }

      option.textContent = languageOption.label;
      if (languageOption.code === locale) {
        option.setAttribute("selected", "selected");
      } else {
        option.removeAttribute("selected");
      }
    });
  }

  replaceLucidePlaceholders(document);

  const demoLabels =
    locale === "de"
      ? ["Fußball", "Politik", "Krypto"]
      : locale === "es"
        ? ["Fútbol", "Política", "Cripto"]
        : locale === "pt"
          ? ["Futebol", "Política", "Cripto"]
        : locale === "fr"
          ? ["Football", "Politique", "Crypto"]
          : locale === "zh"
            ? ["足球", "政治", "加密"]
            : ["Soccer", "Politics", "Crypto"];
  const chips = Array.from(document.querySelectorAll("[data-lang-chip]"));
  chips.forEach((chip, index) => setText(chip, demoLabels[index] ?? ""));

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
