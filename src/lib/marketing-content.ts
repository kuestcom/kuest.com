import { parseHTML } from "linkedom/worker";
import type { LandingMessages, SiteLocale } from "@/i18n/site";
import { defaultSiteLocale, localeHref } from "@/i18n/site";
import {
  type ProofCard,
  type ShowcaseNiche,
} from "@/lib/marketing-shared-data";

export const DEMO_ORIGIN = "https://demo.kuest.com";

export const DEFAULT_HERO_MARKET_TITLES = [
  "",
  "Will the Fed cut rates before July?",
  "",
  "",
  "",
  "Will Trump announce a U.S. Bitcoin reserve this year?",
  "",
  "",
  "",
  "Will a Russia-Ukraine ceasefire be announced before year-end?",
  "",
  "",
] as const;

const LANDING_HERO_TITLE_ACCENT_BY_LOCALE: Record<SiteLocale, string> = {
  en: "Free",
  de: "Kostenlos",
  es: "Gratis",
  pt: "Grátis",
  fr: "Gratuit",
  zh: "免费开始",
};

const LANDING_NICHE_STATIC = [
  {
    accent: "#f7931a",
    accentRgb: "247,147,26",
    icon: "bitcoin" as const,
    cards: [
      { type: "single", img: "/assets/images/bitcoin-150k.png", pct: 61, volValue: "$42k" },
      { type: "single", img: "/assets/images/ethereum-flippening.png", pct: 18, volValue: "$29k" },
      { type: "multi", img: "/assets/images/fed-rate-move.png", rowPcts: [42, 51, 7], volValue: "$31k" },
    ],
  },
  {
    accent: "#34d07f",
    accentRgb: "52,208,127",
    icon: "trophy" as const,
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
    icon: "landmark" as const,
    cards: [
      { type: "single", img: "/assets/images/elon-usa-election.png", pct: 42, volValue: "$331k" },
      { type: "single", img: "/assets/images/russia-x-ukraine.png", pct: 34, volValue: "$22k" },
      { type: "multi", img: "/assets/images/uk-general-election.png", rowPcts: [58, 28, 14], volValue: "$19k" },
    ],
  },
  {
    accent: "#f43f5e",
    accentRgb: "244,63,94",
    icon: "clapperboard" as const,
    cards: [
      { type: "single", img: "/assets/images/marvel-opening-weekend.png", pct: 70, volValue: "$9k" },
      { type: "multi", img: "/assets/images/big-brother-brasil.png", rowPcts: [41, 33, 26], volValue: "$14k" },
      { type: "single", img: "/assets/images/taylor-swift-album.png", pct: 55, volValue: "$6k" },
    ],
  },
  {
    accent: "#4f8ef7",
    accentRgb: "79,142,247",
    icon: "users" as const,
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
    icon: "zap" as const,
    cards: [
      { type: "single", img: "/assets/images/mrbeast-vs-tseries.png", pct: 67, volValue: "$21k" },
      { type: "single", img: "/assets/images/elon-500b-net-worth.png", pct: 38, volValue: "$15k" },
      { type: "single", img: "/assets/images/pop-star-arrest.png", pct: 12, volValue: "$9k" },
    ],
  },
] as const;

export const ENTERPRISE_NICHES: ShowcaseNiche[] = [
  {
    tag: "Crypto & Assets",
    tagline: "Deploy a branded market around crypto and digital assets.",
    accent: "#f7931a",
    accentRgb: "247,147,26",
    icon: "bitcoin",
    cards: [
      {
        type: "single",
        img: "/assets/images/bitcoin-150k.png",
        title: "Will Bitcoin close above $150K before Q4?",
        vol: "$42k Vol.",
        cat: "Crypto",
        pct: 61,
      },
      {
        type: "single",
        img: "/assets/images/ethereum-flippening.png",
        title: "Will Ethereum flip Bitcoin's market cap in 2026?",
        vol: "$29k Vol.",
        cat: "Crypto",
        pct: 18,
      },
      {
        type: "multi",
        img: "/assets/images/uniswap-v4-mainnet.png",
        title: "Which asset class leads net inflows next quarter?",
        vol: "$31k Vol.",
        cat: "Assets",
        rows: [
          { label: "BTC", pct: 42 },
          { label: "ETH", pct: 51 },
          { label: "Other", pct: 7 },
        ],
      },
    ],
  },
  {
    tag: "Elections & Policy",
    tagline: "Own political and public policy flows in your market.",
    accent: "#8b5cf6",
    accentRgb: "139,92,246",
    icon: "landmark",
    cards: [
      {
        type: "single",
        img: "/assets/images/brazil-election-2026.png",
        title: "Will the incumbent coalition keep a governing majority?",
        vol: "$38k Vol.",
        cat: "Politics",
        pct: 47,
      },
      {
        type: "single",
        img: "/assets/images/donald-trump-president.png",
        title: "Will the next U.S. administration create a strategic BTC reserve?",
        vol: "$24k Vol.",
        cat: "Policy",
        pct: 35,
      },
      {
        type: "multi",
        img: "/assets/images/uk-general-election.png",
        title: "Who wins the next UK general election?",
        vol: "$19k Vol.",
        cat: "UK",
        rows: [
          { label: "Labour", pct: 58 },
          { label: "Conservative", pct: 28 },
          { label: "Other", pct: 14 },
        ],
      },
    ],
  },
  {
    tag: "Macro & Rates",
    tagline: "Price macro outcomes directly on your own platform.",
    accent: "#4f8ef7",
    accentRgb: "79,142,247",
    icon: "trending-up",
    cards: [
      {
        type: "multi",
        img: "/assets/images/fed-rate-move.png",
        title: "Next Fed decision",
        vol: "$31k Vol.",
        cat: "Rates",
        rows: [
          { label: "Cut", pct: 42 },
          { label: "Hold", pct: 51 },
          { label: "Hike", pct: 7 },
        ],
      },
      {
        type: "single",
        img: "/assets/images/russia-x-ukraine.png",
        title: "Will a ceasefire lower global energy prices before year-end?",
        vol: "$22k Vol.",
        cat: "Macro",
        pct: 34,
      },
      {
        type: "single",
        img: "/assets/images/elon-500b-net-worth.png",
        title: "Will real rates fall below 1% before Q1?",
        vol: "$15k Vol.",
        cat: "Macro",
        pct: 38,
      },
    ],
  },
  {
    tag: "Commodities",
    tagline: "Turn volatility in commodities into client engagement and fees.",
    accent: "#f0b429",
    accentRgb: "240,180,41",
    icon: "bar-chart-2",
    cards: [
      {
        type: "single",
        img: "/assets/images/bitcoin-150k.png",
        title: "Will gold hit a new all-time high this quarter?",
        vol: "$17k Vol.",
        cat: "Gold",
        pct: 56,
      },
      {
        type: "single",
        img: "/assets/images/fed-rate-move.png",
        title: "Will Brent close above $100 before year-end?",
        vol: "$12k Vol.",
        cat: "Oil",
        pct: 29,
      },
      {
        type: "multi",
        img: "/assets/images/governance-vote-chain.png",
        title: "Which commodity outperforms next month?",
        vol: "$14k Vol.",
        cat: "Macro",
        rows: [
          { label: "Gold", pct: 44 },
          { label: "Oil", pct: 33 },
          { label: "Copper", pct: 23 },
        ],
      },
    ],
  },
  {
    tag: "Sports",
    tagline: "Launch sports markets under your own regulated surface.",
    accent: "#34d07f",
    accentRgb: "52,208,127",
    icon: "trophy",
    cards: [
      {
        type: "multi",
        img: "/assets/images/champions-league-top-scorer.png",
        title: "Top scorer - Champions League final",
        vol: "$18k Vol.",
        cat: "Sports",
        rows: [
          { label: "Mbappe", pct: 34 },
          { label: "Vinicius", pct: 28 },
          { label: "Bellingham", pct: 19 },
        ],
      },
      {
        type: "single",
        img: "/assets/images/warriors-playoffs.png",
        title: "Will the Warriors make the playoffs?",
        vol: "$11k Vol.",
        cat: "NBA",
        pct: 55,
      },
      {
        type: "single",
        img: "/assets/images/daniel-negranu-wsop.png",
        title: "Will Daniel Negreanu reach the WSOP final table?",
        vol: "$8k Vol.",
        cat: "Poker",
        pct: 38,
      },
    ],
  },
  {
    tag: "Custom Markets",
    tagline: "Create exclusive event contracts tailored to your own audience.",
    accent: "#f43f5e",
    accentRgb: "244,63,94",
    icon: "sliders",
    cards: [
      {
        type: "single",
        img: "/assets/images/discord-50k-members.png",
        title: "Will our private client community hit 50K members this quarter?",
        vol: "$9k Vol.",
        cat: "Community",
        pct: 44,
      },
      {
        type: "single",
        img: "/assets/images/marvel-opening-weekend.png",
        title: "Will the flagship local IPO price above its range?",
        vol: "$10k Vol.",
        cat: "Custom",
        pct: 41,
      },
      {
        type: "multi",
        img: "/assets/images/elon-usa-election.png",
        title: "Which bespoke macro scenario plays out first?",
        vol: "$13k Vol.",
        cat: "Scenario",
        rows: [
          { label: "Soft landing", pct: 39 },
          { label: "Reflation", pct: 35 },
          { label: "Shock", pct: 26 },
        ],
      },
    ],
  },
];

export function buildThemeBootstrapScript() {
  return "(function(){var root=document.documentElement;var meta=document.querySelector('meta[name=\"theme-color\"]');var mode='dark';try{var saved=window.localStorage.getItem('kuest-theme-mode');if(saved==='dark'||saved==='light')mode=saved;}catch(error){}root.setAttribute('data-theme-mode',mode);if(meta){var fallback=mode==='dark'?'#CDFF00':'#0e1117';try{var accent=getComputedStyle(root).getPropertyValue('--color-accent').trim();meta.setAttribute('content',accent||fallback);}catch(error){meta.setAttribute('content',fallback);}}})();";
}

export function serializeJsonForHtmlScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003C")
    .replaceAll(">", "\\u003E")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function stripTrailingArrow(value?: string | null) {
  return (value ?? "").replace(/\s*→\s*$/, "");
}

export function stripTerminalPeriod(value?: string | null) {
  return (value ?? "").replace(/[.。]\s*$/, "");
}

const MONEY_SUFFIX_PATTERN = [
  "trillion(?:s)?",
  "billion(?:s)?",
  "million(?:s)?",
  "thousand",
  "milliarde?n?",
  "millionen",
  "millon(?:es)?",
  "milh(?:ão|ões|ao|oes)",
  "bilh(?:ão|ões|ao|oes)",
  "billones?",
  "mrd\\.?",
  "mio\\.?",
  "tn",
  "bn",
  "mn",
  "mil",
  "t",
  "b",
  "m",
  "k",
].join("|");

const MONEY_TOKEN_RE = new RegExp(
  `\\$\\s*\\d(?:[\\d.,\\s\\u00A0]*\\d)?(?:\\s*(?:${MONEY_SUFFIX_PATTERN}))?`,
  "giu",
);

function normalizeMoneyAmountText(value: string) {
  const compact = value.replaceAll(/\s|\u00A0/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");

  if (hasComma && hasDot) {
    const decimalSeparator = compact.lastIndexOf(",") > compact.lastIndexOf(".") ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    return compact.replaceAll(thousandsSeparator, "").replace(decimalSeparator, ".");
  }

  const normalizeSingleSeparator = (separator: "," | ".") => {
    const parts = compact.split(separator);

    if (parts.length === 1) {
      return compact;
    }

    const fractionalPart = parts[parts.length - 1] ?? "";
    const useAsThousandsSeparator =
      fractionalPart.length === 3 && parts.slice(0, -1).every((part, index) => (index === 0 ? part.length > 0 : part.length === 3));

    return useAsThousandsSeparator ? parts.join("") : `${parts.slice(0, -1).join("")}.${fractionalPart}`;
  };

  if (hasComma) {
    return normalizeSingleSeparator(",");
  }

  if (hasDot) {
    return normalizeSingleSeparator(".");
  }

  return compact;
}

function normalizeMoneySuffix(value: string) {
  return value
    .toLowerCase()
    .replaceAll(".", "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function extractLargestMoneyToken(value?: string | null) {
  const matches = Array.from((value ?? "").matchAll(MONEY_TOKEN_RE), (match) => match[0].trim());

  if (!matches?.length) {
    return "";
  }

  const multiplierBySuffix: Record<string, number> = {
    k: 1_000,
    thousand: 1_000,
    mil: 1_000,
    m: 1_000_000,
    mn: 1_000_000,
    mio: 1_000_000,
    million: 1_000_000,
    millions: 1_000_000,
    millionen: 1_000_000,
    millon: 1_000_000,
    millones: 1_000_000,
    milhao: 1_000_000,
    milhoes: 1_000_000,
    b: 1_000_000_000,
    bn: 1_000_000_000,
    billion: 1_000_000_000,
    billions: 1_000_000_000,
    billones: 1_000_000_000,
    mrd: 1_000_000_000,
    milliard: 1_000_000_000,
    milliarde: 1_000_000_000,
    milliarden: 1_000_000_000,
    bilhao: 1_000_000_000,
    bilhoes: 1_000_000_000,
    t: 1_000_000_000_000,
    tn: 1_000_000_000_000,
    trillion: 1_000_000_000_000,
    trillions: 1_000_000_000_000,
  };

  const best = matches.reduce<{ token: string; value: number } | null>((largest, token) => {
    const suffixMatch = token.match(new RegExp(`(${MONEY_SUFFIX_PATTERN})$`, "iu"));
    const suffix = normalizeMoneySuffix(suffixMatch?.[0] ?? "");
    const amountText = token
      .replace(/^\$\s*/, "")
      .slice(0, suffixMatch ? -suffixMatch[0].length : undefined)
      .trim();
    const numericValue =
      Number(normalizeMoneyAmountText(amountText)) * (multiplierBySuffix[suffix] ?? 1);

    if (!largest || numericValue > largest.value) {
      return { token, value: numericValue };
    }

    return largest;
  }, null);

  return best?.token ?? matches[0];
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

export function buildLandingNiches(
  bundle: LandingMessages,
  fallbackBundle: LandingMessages,
): ShowcaseNiche[] {
  return LANDING_NICHE_STATIC.map((staticNiche, nicheIndex) => {
    const fallbackTranslated = fallbackBundle.niches.data[nicheIndex];
    const translated = bundle.niches.data[nicheIndex] ?? fallbackTranslated;

    return {
      tag: translated?.tag ?? fallbackTranslated?.tag ?? bundle.niches.tabs[nicheIndex] ?? "",
      accent: staticNiche.accent,
      accentRgb: staticNiche.accentRgb,
      tagline: translated?.tagline ?? fallbackTranslated?.tagline ?? "",
      icon: staticNiche.icon,
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

export function buildLandingProofCards(
  bundle: LandingMessages,
  locale: SiteLocale,
): ProofCard[] {
  return bundle.social.cards.map((card) => ({
    label: card.label,
    value: extractLargestMoneyToken(card.subHtml),
    copyHtml: sanitizeTranslatedHtml(card.subHtml, locale),
  }));
}
