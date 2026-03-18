import type { SiteLocale } from "@/i18n/site";
import type { ProofCard, ShowcaseIconName, ShowcaseNiche } from "@/lib/marketing-shared-data";

type EnterpriseFeature = {
  icon: ShowcaseIconName;
  title: string;
  copy: string;
};

type EnterpriseFaqItem = {
  q: string;
  aHtml: string;
};

type EnterpriseMarketStat = {
  value: string;
  label: string;
  sourceHref: string;
  sourceLabel: string;
};

type EnterpriseTimelinePoint = {
  title: string;
  copy: string;
};

type EnterpriseContent = {
  meta: {
    title: string;
    description: string;
    imageAlt: string;
  };
  hero: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    titleAccent: string;
    subtitle: string;
    contactCta: string;
    viewDemoCta: string;
    proof: string;
    heroMarketTitles: string[];
  };
  attention: {
    ariaLabel: string;
    blockOne: string[];
    marketVolume: string;
    polymarketAlt: string;
    kalshiAlt: string;
    outsideUs: string;
    withoutLocalOperator: string;
    xpLead: string;
    xpFollowUp: string;
    xpPivot: string;
  };
  marketToday: {
    eyebrow: string;
    stats: EnterpriseMarketStat[];
  };
  explainer: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  niches: ShowcaseNiche[];
  solution: {
    title: string;
    lead: string;
    timelineAriaLabel: string;
    points: EnterpriseTimelinePoint[];
    cta: string;
    note: string;
  };
  proofCards: ProofCard[];
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: EnterpriseFeature[];
  };
  preview: {
    title: string;
    subtitle: string;
  };
  faq: {
    title: string;
    items: EnterpriseFaqItem[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    contactCta: string;
    viewLiveDemoCta: string;
  };
};

const THE_BLOCK_HREF = "https://www.theblock.co/post/392755";
const PYMNTS_HREF =
  "https://www.pymnts.com/partnerships/2026/kalshi-begins-global-expansion-with-xp-deal-brazil/";
const SIMILARWEB_HREF = "https://www.similarweb.com/website/polymarket.com/";
const COINDESK_HREF =
  "https://www.coindesk.com/business/2026/03/07/kalshi-polymarket-seeking-usd20-billion-valuations-in-fundraising-talks-wsj";
const LICENSE_HREF = "https://github.com/kuestcom/prediction-market/blob/main/LICENSE";

function makeHeroTitles(rateTitle: string, reserveTitle: string, ceasefireTitle: string) {
  return ["", rateTitle, "", "", "", reserveTitle, "", "", "", ceasefireTitle, "", ""];
}

function sourceLink(href: string, outlet: string, title: string, label = outlet) {
  return `<a href="${href}" class="source-link" data-source-outlet="${outlet}" data-source-title="${title}">${label}</a>`;
}

export const LANDING_SOLUTION_FLOW_TITLES: Record<SiteLocale, string> = {
  en: "No code. No server. No technical headaches.",
  de: "Kein Code. Kein Server. Kein technischer Stress.",
  es: "Sin código. Sin servidor. Sin complicaciones técnicas.",
  pt: "Sem código. Sem servidor. Sem dor de cabeça técnica.",
  fr: "Sans code. Sans serveur. Sans casse-tête technique.",
  zh: "不用写代码。不用管服务器。也不用被技术问题拖住。",
};

const ENTERPRISE_CONTENT: Record<SiteLocale, EnterpriseContent> = {
  en: {
    meta: {
      title: "Kuest Enterprise",
      description:
        "White-label prediction market infrastructure for financial institutions, media platforms, and enterprise operators.",
      imageAlt: "Kuest Enterprise preview",
    },
    hero: {
      kicker: "White-Label Prediction Market Infrastructure",
      titleLine1: "A new financial instrument",
      titleLine2: "is forming.",
      titleAccent: "Be the platform.",
      subtitle:
        "Prediction markets already process billions in monthly volume — and 66% of that demand comes from outside the US, without a single local operator. Kuest lets financial institutions, brokerages, and media companies launch their own branded prediction market: audited infrastructure, shared liquidity, your fee on every trade.",
      contactCta: "Contact us",
      viewDemoCta: "View demo",
      proof: "$18B combined monthly volume - OpenZeppelin audited - White-label ready",
      heroMarketTitles: makeHeroTitles(
        "Will the Fed cut rates before July?",
        "Will Trump announce a U.S. Bitcoin reserve this year?",
        "Will a Russia-Ukraine ceasefire be announced before year-end?",
      ),
    },
    attention: {
      ariaLabel: "The opportunity in prediction markets",
      blockOne: [
        "Your clients are already trading on Polymarket.",
        "Elections. Interest rates. Bitcoin prices. Economic outcomes.",
        "They're doing it on a US-based platform. Outside your ecosystem. Paying fees to someone else.",
        "You have no visibility into it. No revenue from it. And it's growing fast.",
      ],
      marketVolume: "Polymarket and Kalshi now process over $18 billion in monthly trading volume.",
      polymarketAlt: "Polymarket",
      kalshiAlt: "Kalshi",
      outsideUs: "66% of their users are outside the US - in your markets.",
      withoutLocalOperator: "Without a single local institution capturing that demand.",
      xpLead: "XP International - Brazil's largest brokerage - just partnered with Kalshi to fix exactly this.",
      xpFollowUp:
        "They saw the volume flowing out of their ecosystem and decided to own the infrastructure.",
      xpPivot: "You don't need to wait for Kalshi to call you.",
    },
    marketToday: {
      eyebrow: "THE MARKET TODAY",
      stats: [
        {
          value: "$18.3B",
          label: "combined monthly volume, Kalshi + Polymarket",
          sourceHref: THE_BLOCK_HREF,
          sourceLabel: "Source: The Block, Q1 2026",
        },
        {
          value: "200x",
          label: "Kalshi annual volume growth, 2024-2025",
          sourceHref: PYMNTS_HREF,
          sourceLabel: "Source: PYMNTS, 2026",
        },
        {
          value: "66%",
          label: "of Polymarket traffic from outside the US",
          sourceHref: SIMILARWEB_HREF,
          sourceLabel: "Source: SimilarWeb, Feb 2026",
        },
        {
          value: "$20B",
          label: "target valuation in current fundraising rounds",
          sourceHref: COINDESK_HREF,
          sourceLabel: "Source: CoinDesk via WSJ",
        },
      ],
    },
    explainer: {
      kicker: "A NEW FINANCIAL INSTRUMENT - ALREADY LIVE AT SCALE",
      title: "Prediction Market",
      subtitle:
        "Think of it as a binary derivative on future events. People trade positions on outcomes — who wins an election, whether a rate is cut, if a company hits an earnings target — using real money, in a live order book. Because financial stakes force discipline, the prices generated consistently outperform polls, analyst forecasts, and expert panels. The data is used by hedge funds, central banks, and policy teams to anticipate outcomes before they happen. The trading volume it generates goes to whoever owns the platform.",
    },
    niches: [
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
    ],
    solution: {
      title: "From signed agreement to live platform — in days, not quarters.",
      lead:
        "Audited smart contracts, shared liquidity from day one, full white-label — your team signs off on the brand, we handle everything else.",
      timelineAriaLabel: "How Kuest works",
      points: [
        {
          title: "Define your market scope and fee model",
          copy:
            "Choose the event categories your clients care about - macroeconomics, interest rates, politics, commodities, crypto, sports. Create proprietary markets exclusive to your platform. Set your fee rate. We configure everything around your brand and regulatory perimeter.",
        },
        {
          title: "We deploy the full technical stack - zero engineering required",
          copy:
            "Smart contracts, CLOB engine, settlement rails, wallet infrastructure, liquidity - all running before your team finishes onboarding. Contracts are derived from Polymarket's architecture, audited by OpenZeppelin. No internal blockchain team needed. No infrastructure sprint.",
        },
        {
          title: "Your platform earns a fee on every trade, automatically",
          copy:
            "Every transaction your clients execute generates a direct fee to your institution - no intermediary, no revenue share, no settlement lag. The same infrastructure model used by platforms that collectively process over $18 billion in monthly volume.",
        },
      ],
      cta: "Contact us",
      note: "WHITE-LABEL - AUDITED CONTRACTS - LIQUIDITY INCLUDED",
    },
    proofCards: [
      {
        label: "Monthly volume",
        value: "$18.3B",
        copyHtml: `Kalshi + Polymarket combined monthly volume, according to ${sourceLink(THE_BLOCK_HREF, "The Block", "Prediction Market Volume")}.`,
      },
      {
        label: "Outside the US",
        value: "66%",
        copyHtml: `Polymarket traffic coming from outside the United States, according to ${sourceLink(SIMILARWEB_HREF, "SimilarWeb", "Polymarket traffic share")}.`,
      },
      {
        label: "Valuation signal",
        value: "$20B",
        copyHtml: `Current fundraising target valuation for both Kalshi and Polymarket, via ${sourceLink(COINDESK_HREF, "CoinDesk", "Prediction market valuations")}.`,
      },
    ],
    features: {
      eyebrow: "WHAT'S ALREADY OPERATIONAL",
      title: "The full trading stack. No engineering sprint required.",
      subtitle:
        "Everything your institution would need to build from scratch - already live, already audited, ready to deploy under your brand.",
      cards: [
        {
          icon: "activity",
          title: "CLOB engine + relayer + matching",
          copy:
            "Central limit order book, relayer infrastructure, and matching engine — the same architecture powering Polymarket, running on Polygon mainnet.",
        },
        {
          icon: "shield-check",
          title: "OpenZeppelin-audited contracts",
          copy:
            "Smart contracts derived from Polymarket's audited architecture, adapted for shared liquidity across multiple operator frontends. UMA-based resolution for verifiable settlement.",
        },
        {
          icon: "users",
          title: "Shared liquidity from day one",
          copy:
            "Mirror live Polymarket markets with existing order flow. Your platform launches with real depth — no cold start, no market maker recruitment required initially.",
        },
        {
          icon: "bot",
          title: "Bot SDKs for institutional traders",
          copy:
            "Python and Rust SDKs compatible with existing Polymarket bot strategies. Market makers already operating on Polymarket can port to your platform without rebuilding.",
        },
        {
          icon: "globe-2",
          title: "Full white-label frontend",
          copy:
            "Your domain, your brand, your language. Multi-language UI with built-in i18n. Custom event categories. Looks and feels like a native product of your institution — not a Kuest deployment.",
        },
        {
          icon: "server",
          title: "Fully managed infrastructure",
          copy:
            "Gas costs, settlement, scalability, monitoring - all handled on our side. No blockchain team needed internally. No cloud infrastructure to manage. You focus on distribution.",
        },
      ],
    },
    preview: {
      title: "This is the product your clients will interact with.",
      subtitle:
        "A fully functional demo running live markets mirrored from Polymarket. Your deployment would carry your domain, your brand, your chosen event categories - and your fee on every transaction your clients execute.",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "What exactly is a prediction market - and how is it different from a betting platform?",
          aHtml:
            "A prediction market is a live order book where participants buy and sell positions on the outcome of real-world events — using the same binary contract mechanics as financial derivatives. Unlike sports betting, where the house sets odds and takes the other side, a prediction market is peer-to-peer: prices are set by supply and demand in real time. The platform operator earns a fee on each trade, not on who wins. This distinction matters legally, commercially, and reputationally: operators are not the counterparty, and the model is structurally closer to an exchange than a bookmaker.",
        },
        {
          q: "Who are Kalshi and Polymarket, and why are they relevant here?",
          aHtml:
            "Kalshi is a US-regulated exchange (CFTC-licensed) focused on event contracts — \"Will the Fed cut rates?\", \"Will there be a recession?\" — valued at over $2 billion and growing 200x in annual trading volume. Polymarket is a decentralized prediction market running on Polygon, drawing over 32 million monthly visits globally, used by traders, journalists, and policymakers as a real-time probability layer. Together they generated $18.3 billion in combined trading volume in a single quarter (Q1 2026). Both are closed platforms: you can trade on them, but you cannot build branded products on top of them or capture their fee revenue. Kuest provides the same infrastructure in an open, white-label model.",
        },
        {
          q: "What's happening in the market right now that makes this timely?",
          aHtml:
            "Several signals are converging: Kalshi and Polymarket are in active fundraising rounds at $20 billion valuations each. B3, Brazil's main stock exchange, launched its first prediction market products in early 2026 under CVM supervision. Kalshi signed its first international institutional deal — with XP International, one of Brazil's largest brokerages with 4.7 million clients and R$1.8 trillion under management — specifically to expand outside the US. CME Group and Bloomberg now publish prediction market data as institutional reference. The regulatory direction in the US, Brazil, and EU is moving toward formal recognition of event contracts. The institutional infrastructure question is being decided right now, and most local markets still have no operator.",
        },
        {
          q: "What types of institutions are already moving into this space?",
          aHtml:
            "Beyond Kalshi and Polymarket themselves: B3 launched binary option contracts on the dollar, Ibovespa, and Bitcoin. Bloomberg integrates Kalshi market data into terminal products. Brokerages in Germany, India, and Israel — Polymarket's top non-US markets — have no local branded platform yet. Financial media companies with large audiences (Reuters, FT, regional equivalents) are evaluating prediction market embeds as interactive revenue products. Sports analytics and media companies are early movers in fan-facing prediction products. The pattern is consistent: the demand exists in every major market, but no local operator has built the infrastructure.",
        },
        {
          q: "Can we create markets exclusive to our platform and client base?",
          aHtml:
            "Yes. You can create proprietary markets on any question — rate decisions, earnings outcomes, macro indicators, political events, or themes exclusive to your institution's positioning. Mirrored markets from Polymarket are available from day one for immediate liquidity depth. Custom markets draw from your client base, with optional cross-market liquidity sharing across the Kuest operator network.",
        },
        {
          q: "What are the fee economics for the operator?",
          aHtml:
            "You set your own trading fee rate — typically 0.5% to 3% per trade. Every transaction on your platform routes that fee directly to your institution. Kuest retains a small protocol fee on top. No revenue share, no minimums, no lock-in period. You control the rate and can configure it by market category or event type. Enterprise agreements with custom SLAs are available.",
        },
        {
          q: "What does our team actually need to do to deploy?",
          aHtml:
            "Your team provides brand assets (logo, colors, domain), defines the initial event scope, and reviews the fee structure. Kuest handles contract deployment, infrastructure configuration, liquidity bootstrapping, and frontend deployment. No internal blockchain engineers required. No cloud infrastructure to manage. Ongoing operations — gas costs, settlement, scalability, monitoring — are fully managed on our side.",
        },
        {
          q: "What is the technical and compliance foundation?",
          aHtml: `Smart contracts are derived from Polymarket's CLOB architecture — the stack that has processed billions in verified volume — audited by OpenZeppelin, the institutional standard for on-chain infrastructure. Settlement uses UMA-based resolution rails for transparent, verifiable outcomes. The codebase is open source under the <a href="https://github.com/kuestcom/prediction-market/blob/main/LICENSE" target="_blank" rel="noopener">Kuest MIT+Commons license</a> for full auditability. Custom compliance configurations and enterprise infrastructure agreements are available — <a href="mailto:hello@kuest.com">contact us</a> to discuss your regulatory environment.`,
        },
      ],
    },
    finalCta: {
      title: "Your clients are already trading on Polymarket. The question is whether that happens on your platform.",
      subtitle: "The infrastructure is ready. First mover advantage in prediction markets closes fast.",
      contactCta: "Contact us",
      viewLiveDemoCta: "View live demo",
    },
  },
  de: {
    meta: {
      title: "Kuest Enterprise",
      description:
        "White-Label-Infrastruktur für Prognosemärkte für Finanzinstitute, Medienplattformen und institutionelle Betreiber.",
      imageAlt: "Kuest Enterprise Vorschau",
    },
    hero: {
      kicker: "White-Label-Infrastruktur für Prognosemärkte",
      titleLine1: "Ein neues Finanzinstrument",
      titleLine2: "entsteht gerade.",
      titleAccent: "Seien Sie die Plattform.",
      subtitle:
        "Prognosemärkte verarbeiten bereits Milliarden an monatlichem Volumen - und 66 % dieser Nachfrage kommen von außerhalb der USA, ohne einen einzigen lokalen Betreiber. Mit Kuest können Finanzinstitute, Broker und Medienunternehmen ihren eigenen gebrandeten Prognosemarkt starten: auditierte Infrastruktur, geteilte Liquidität und Ihre Gebühr auf jeden Trade.",
      contactCta: "Kontakt aufnehmen",
      viewDemoCta: "Demo ansehen",
      proof: "$18 Mrd. monatliches Volumen - von OpenZeppelin auditiert - White-Label-fähig",
      heroMarketTitles: makeHeroTitles(
        "Senkt die Fed die Zinsen vor Juli?",
        "Wird die nächste US-Regierung in diesem Jahr eine strategische BTC-Reserve schaffen?",
        "Wird bis Jahresende ein Waffenstillstand zwischen Russland und der Ukraine angekündigt?",
      ),
    },
    attention: {
      ariaLabel: "Die Chance im Prognosemarkt",
      blockOne: [
        "Ihre Kunden handeln bereits auf Polymarket.",
        "Wahlen. Zinsen. Bitcoin-Preise. Makroereignisse.",
        "Sie tun das auf einer US-Plattform. Außerhalb Ihres Ökosystems. Und zahlen Gebühren an jemand anderen.",
        "Sie haben keine Sicht darauf. Keine Erlöse daraus. Und das Wachstum beschleunigt sich.",
      ],
      marketVolume: "Polymarket und Kalshi verarbeiten inzwischen über 18 Milliarden Dollar monatliches Handelsvolumen.",
      polymarketAlt: "Polymarket",
      kalshiAlt: "Kalshi",
      outsideUs: "66 % ihrer Nutzer kommen von außerhalb der USA - aus Ihren Märkten.",
      withoutLocalOperator: "Ohne ein einziges lokales Institut, das diese Nachfrage abschöpft.",
      xpLead:
        "XP International - Brasiliens größte Brokerage - hat sich gerade mit Kalshi zusammengeschlossen, um genau das zu lösen.",
      xpFollowUp:
        "Sie haben gesehen, wie Volumen aus ihrem Ökosystem abfließt, und beschlossen, die Infrastruktur selbst zu besitzen.",
      xpPivot: "Sie müssen nicht warten, bis Kalshi Sie anruft.",
    },
    marketToday: {
      eyebrow: "DER MARKT HEUTE",
      stats: [
        {
          value: "$18.3B",
          label: "kombiniertes Monatsvolumen, Kalshi + Polymarket",
          sourceHref: THE_BLOCK_HREF,
          sourceLabel: "Quelle: The Block, Q1 2026",
        },
        {
          value: "200x",
          label: "jährliches Kalshi-Volumenwachstum, 2024-2025",
          sourceHref: PYMNTS_HREF,
          sourceLabel: "Quelle: PYMNTS, 2026",
        },
        {
          value: "66%",
          label: "des Polymarket-Traffics kommen von außerhalb der USA",
          sourceHref: SIMILARWEB_HREF,
          sourceLabel: "Quelle: SimilarWeb, Feb 2026",
        },
        {
          value: "$20B",
          label: "Zielbewertung in aktuellen Finanzierungsrunden",
          sourceHref: COINDESK_HREF,
          sourceLabel: "Quelle: CoinDesk via WSJ",
        },
      ],
    },
    explainer: {
      kicker: "EIN NEUES FINANZINSTRUMENT - BEREITS IN GROSSER SKALA LIVE",
      title: "Prediction Market",
      subtitle:
        "Man kann es sich wie ein binäres Derivat auf zukünftige Ereignisse vorstellen. Menschen handeln mit echtem Geld auf künftige Ergebnisse in einem Live-Orderbuch. Weil echtes Kapital im Spiel ist, übertreffen die entstehenden Preise Umfragen, Analystenprognosen und Expertenpanels oft deutlich. Das Handelsvolumen fließt an die Plattform, die den Markt besitzt.",
    },
    niches: [
      {
        tag: "Krypto & Assets",
        tagline: "Starten Sie einen gebrandeten Markt rund um Krypto und digitale Assets.",
        accent: "#f7931a",
        accentRgb: "247,147,26",
        icon: "bitcoin",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "Schließt Bitcoin vor Q4 über $150K?",
            vol: "$42k Vol.",
            cat: "Krypto",
            pct: 61,
          },
          {
            type: "single",
            img: "/assets/images/ethereum-flippening.png",
            title: "Überholt Ethereum 2026 die Marktkapitalisierung von Bitcoin?",
            vol: "$29k Vol.",
            cat: "Krypto",
            pct: 18,
          },
          {
            type: "multi",
            img: "/assets/images/uniswap-v4-mainnet.png",
            title: "Welche Assetklasse führt die Nettozuflüsse im nächsten Quartal an?",
            vol: "$31k Vol.",
            cat: "Assets",
            rows: [
              { label: "BTC", pct: 42 },
              { label: "ETH", pct: 51 },
              { label: "Andere", pct: 7 },
            ],
          },
        ],
      },
      {
        tag: "Wahlen & Politik",
        tagline: "Besetzen Sie politische und regulatorische Flows in Ihrem Markt.",
        accent: "#8b5cf6",
        accentRgb: "139,92,246",
        icon: "landmark",
        cards: [
          {
            type: "single",
            img: "/assets/images/brazil-election-2026.png",
            title: "Behält die Amtskoalition eine Regierungsmehrheit?",
            vol: "$38k Vol.",
            cat: "Politik",
            pct: 47,
          },
          {
            type: "single",
            img: "/assets/images/donald-trump-president.png",
            title: "Schafft die nächste US-Regierung eine strategische BTC-Reserve?",
            vol: "$24k Vol.",
            cat: "Politik",
            pct: 35,
          },
          {
            type: "multi",
            img: "/assets/images/uk-general-election.png",
            title: "Wer gewinnt die nächste britische Parlamentswahl?",
            vol: "$19k Vol.",
            cat: "UK",
            rows: [
              { label: "Labour", pct: 58 },
              { label: "Conservative", pct: 28 },
              { label: "Andere", pct: 14 },
            ],
          },
        ],
      },
      {
        tag: "Makro & Zinsen",
        tagline: "Bepreisen Sie Makroergebnisse direkt auf Ihrer eigenen Plattform.",
        accent: "#4f8ef7",
        accentRgb: "79,142,247",
        icon: "trending-up",
        cards: [
          {
            type: "multi",
            img: "/assets/images/fed-rate-move.png",
            title: "Nächste Fed-Entscheidung",
            vol: "$31k Vol.",
            cat: "Zinsen",
            rows: [
              { label: "Senkung", pct: 42 },
              { label: "Halten", pct: 51 },
              { label: "Anhebung", pct: 7 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/russia-x-ukraine.png",
            title: "Senkt ein Waffenstillstand die globalen Energiepreise vor Jahresende?",
            vol: "$22k Vol.",
            cat: "Makro",
            pct: 34,
          },
          {
            type: "single",
            img: "/assets/images/elon-500b-net-worth.png",
            title: "Fallen die Realzinsen vor Q1 unter 1 %?",
            vol: "$15k Vol.",
            cat: "Makro",
            pct: 38,
          },
        ],
      },
      {
        tag: "Rohstoffe",
        tagline: "Machen Sie Rohstoffvolatilität zu Kundenbindung und Gebührenumsatz.",
        accent: "#f0b429",
        accentRgb: "240,180,41",
        icon: "bar-chart-2",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "Erreicht Gold in diesem Quartal ein neues Allzeithoch?",
            vol: "$17k Vol.",
            cat: "Gold",
            pct: 56,
          },
          {
            type: "single",
            img: "/assets/images/fed-rate-move.png",
            title: "Schließt Brent vor Jahresende über $100?",
            vol: "$12k Vol.",
            cat: "Öl",
            pct: 29,
          },
          {
            type: "multi",
            img: "/assets/images/governance-vote-chain.png",
            title: "Welcher Rohstoff performt nächsten Monat am besten?",
            vol: "$14k Vol.",
            cat: "Makro",
            rows: [
              { label: "Gold", pct: 44 },
              { label: "Öl", pct: 33 },
              { label: "Kupfer", pct: 23 },
            ],
          },
        ],
      },
      {
        tag: "Sport",
        tagline: "Starten Sie Sportmärkte unter Ihrer eigenen regulierten Oberfläche.",
        accent: "#34d07f",
        accentRgb: "52,208,127",
        icon: "trophy",
        cards: [
          {
            type: "multi",
            img: "/assets/images/champions-league-top-scorer.png",
            title: "Torschützenkönig - Champions-League-Finale",
            vol: "$18k Vol.",
            cat: "Sport",
            rows: [
              { label: "Mbappe", pct: 34 },
              { label: "Vinicius", pct: 28 },
              { label: "Bellingham", pct: 19 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/warriors-playoffs.png",
            title: "Erreichen die Warriors die Playoffs?",
            vol: "$11k Vol.",
            cat: "NBA",
            pct: 55,
          },
          {
            type: "single",
            img: "/assets/images/daniel-negranu-wsop.png",
            title: "Erreicht Daniel Negreanu den WSOP-Finaltisch?",
            vol: "$8k Vol.",
            cat: "Poker",
            pct: 38,
          },
        ],
      },
      {
        tag: "Custom Markets",
        tagline: "Erstellen Sie exklusive Event-Kontrakte für Ihre eigene Zielgruppe.",
        accent: "#f43f5e",
        accentRgb: "244,63,94",
        icon: "sliders",
        cards: [
          {
            type: "single",
            img: "/assets/images/discord-50k-members.png",
            title: "Erreicht unsere private Client-Community in diesem Quartal 50K Mitglieder?",
            vol: "$9k Vol.",
            cat: "Community",
            pct: 44,
          },
          {
            type: "single",
            img: "/assets/images/marvel-opening-weekend.png",
            title: "Preist der lokale Leit-IPO über seiner Spanne?",
            vol: "$10k Vol.",
            cat: "Custom",
            pct: 41,
          },
          {
            type: "multi",
            img: "/assets/images/elon-usa-election.png",
            title: "Welches maßgeschneiderte Makroszenario tritt zuerst ein?",
            vol: "$13k Vol.",
            cat: "Szenario",
            rows: [
              { label: "Soft Landing", pct: 39 },
              { label: "Reflation", pct: 35 },
              { label: "Schock", pct: 26 },
            ],
          },
        ],
      },
    ],
    solution: {
      title: "Vom unterschriebenen Vertrag zur Live-Plattform - in Tagen, nicht in Quartalen.",
      lead:
        "Auditierte Smart Contracts, geteilte Liquidität vom ersten Tag an, vollständiges White-Label - Ihr Team gibt die Marke frei, wir kümmern uns um den Rest.",
      timelineAriaLabel: "Wie Kuest funktioniert",
      points: [
        {
          title: "Definieren Sie Marktscope und Gebührenmodell",
          copy:
            "Wählen Sie die Ereigniskategorien, die für Ihre Kunden relevant sind - Makro, Zinsen, Politik, Rohstoffe, Krypto, Sport. Erstellen Sie exklusive Märkte für Ihre Plattform. Legen Sie Ihre Gebühren fest. Wir konfigurieren alles rund um Marke und regulatorischen Rahmen.",
        },
        {
          title: "Wir stellen den kompletten Tech-Stack bereit - ohne internes Engineering",
          copy:
            "Smart Contracts, CLOB-Engine, Settlement Rails, Wallet-Infrastruktur und Liquidität laufen, bevor Ihr Team das Onboarding abschließt. Die Verträge leiten sich von Polymarkets Architektur ab und wurden von OpenZeppelin auditiert. Kein internes Blockchain-Team nötig. Kein Infrastruktur-Sprint.",
        },
        {
          title: "Ihre Plattform verdient automatisch an jedem Trade",
          copy:
            "Jede Transaktion Ihrer Kunden erzeugt direkt Gebühren für Ihr Institut - ohne Zwischenhändler, ohne Revenue Share, ohne Verzögerung. Dasselbe Infrastrukturmodell betreibt Plattformen mit zusammen über 18 Milliarden Dollar Monatsvolumen.",
        },
      ],
      cta: "Kontakt aufnehmen",
      note: "WHITE-LABEL - AUDITIERTE VERTRÄGE - LIQUIDITÄT INKLUSIVE",
    },
    proofCards: [
      {
        label: "Monatsvolumen",
        value: "$18.3B",
        copyHtml: `Kombiniertes Monatsvolumen von Kalshi + Polymarket laut ${sourceLink(THE_BLOCK_HREF, "The Block", "Prediction Market Volume")}.`,
      },
      {
        label: "Außerhalb der USA",
        value: "66%",
        copyHtml: `Anteil des Polymarket-Traffics von außerhalb der USA laut ${sourceLink(SIMILARWEB_HREF, "SimilarWeb", "Polymarket traffic share")}.`,
      },
      {
        label: "Bewertungssignal",
        value: "$20B",
        copyHtml: `Aktuelles Bewertungsziel in den Fundraising-Gesprächen von Kalshi und Polymarket via ${sourceLink(COINDESK_HREF, "CoinDesk", "Prediction market valuations")}.`,
      },
    ],
    features: {
      eyebrow: "BEREITS OPERATIV",
      title: "Der komplette Trading-Stack. Kein Engineering-Sprint erforderlich.",
      subtitle:
        "Alles, was Ihr Institut von Grund auf bauen müsste, ist bereits live, auditiert und bereit für den Einsatz unter Ihrer Marke.",
      cards: [
        {
          icon: "activity",
          title: "CLOB-Engine + Relayer + Matching",
          copy:
            "Zentrales Limit-Orderbuch, Relayer-Infrastruktur und Matching-Engine - dieselbe Architektur wie bei Polymarket auf Polygon Mainnet.",
        },
        {
          icon: "shield-check",
          title: "Von OpenZeppelin auditierte Verträge",
          copy:
            "Smart Contracts auf Basis der auditierten Polymarket-Architektur, angepasst für geteilte Liquidität über mehrere Operator-Frontends hinweg. UMA-basierte Resolution für verifizierbares Settlement.",
        },
        {
          icon: "users",
          title: "Geteilte Liquidität vom ersten Tag an",
          copy:
            "Spiegeln Sie aktive Polymarket-Märkte mit bestehendem Orderflow. Ihre Plattform startet mit echter Tiefe - ohne Cold Start und ohne Market-Maker-Rekrutierung zum Start.",
        },
        {
          icon: "bot",
          title: "Bot-SDKs für institutionelle Trader",
          copy:
            "Python- und Rust-SDKs kompatibel mit bestehenden Polymarket-Bot-Strategien. Market Maker können auf Ihre Plattform portieren, ohne neu zu bauen.",
        },
        {
          icon: "globe-2",
          title: "Vollständiges White-Label-Frontend",
          copy:
            "Ihre Domain, Ihre Marke, Ihre Sprache. Mehrsprachige UI mit integrierter i18n. Eigene Event-Kategorien. Wirkt wie ein natives Produkt Ihres Hauses - nicht wie eine Kuest-Instanz.",
        },
        {
          icon: "server",
          title: "Vollständig gemanagte Infrastruktur",
          copy:
            "Gas-Kosten, Settlement, Skalierung und Monitoring liegen komplett bei uns. Kein internes Blockchain-Team. Keine Cloud-Infrastruktur zu betreiben. Sie fokussieren sich auf Distribution.",
        },
      ],
    },
    preview: {
      title: "Das ist das Produkt, mit dem Ihre Kunden interagieren werden.",
      subtitle:
        "Eine voll funktionsfähige Demo mit gespiegelt laufenden Polymarket-Märkten. Ihr Deployment würde Ihre Domain, Ihre Marke, Ihre Event-Kategorien - und Ihre Gebühr auf jede Kunden-Transaktion tragen.",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "Was genau ist ein Prognosemarkt - und worin unterscheidet er sich von einer Wettplattform?",
          aHtml:
            "Ein Prognosemarkt ist ein Live-Orderbuch, in dem Teilnehmer Positionen auf den Ausgang realer Ereignisse kaufen und verkaufen - mit derselben binären Vertragslogik wie bei Derivaten. Anders als beim Sportwettenmodell setzt nicht das Haus die Quoten und nimmt die Gegenposition ein. Die Preise entstehen peer-to-peer in Echtzeit aus Angebot und Nachfrage. Der Betreiber verdient an jeder Transaktion, nicht am Gewinner.",
        },
        {
          q: "Wer sind Kalshi und Polymarket - und warum sind sie hier relevant?",
          aHtml:
            "Kalshi ist eine US-regulierte Börse für Event Contracts. Polymarket ist ein dezentraler Prognosemarkt auf Polygon. Gemeinsam haben sie gezeigt, dass Prediction Markets keine Nische sind, sondern ein neues Finanzprimitive. Beide Plattformen sind geschlossen; Kuest liefert dieselbe Infrastruktur im offenen White-Label-Modell.",
        },
        {
          q: "Was passiert gerade im Markt, das dieses Timing so relevant macht?",
          aHtml:
            "Kalshi und Polymarket befinden sich in aktiven Fundraising-Runden bei jeweils rund $20B Bewertung. B3 steigt in Brasilien in die Kategorie ein. Kalshi hat mit XP International den ersten internationalen institutionellen Deal unterschrieben. Die Frage nach institutioneller Infrastruktur wird genau jetzt entschieden - und die meisten lokalen Märkte haben noch keinen Betreiber.",
        },
        {
          q: "Welche Arten von Instituten bewegen sich bereits in diesen Bereich?",
          aHtml:
            "Broker, Börsen, Finanzmedien, Sports-Analytics-Unternehmen und institutionelle Trading Desks testen bereits Event Contracts. Die Nachfrage ist in jedem großen Markt vorhanden, aber nur sehr wenige lokale Betreiber haben die Infrastruktur aufgebaut.",
        },
        {
          q: "Können wir Märkte exklusiv für unsere Plattform und Kundschaft erstellen?",
          aHtml:
            "Ja. Sie können proprietäre Märkte zu Makro, Politik, Zinsen, Rohstoffen, Krypto oder jeder anderen Kategorie aufsetzen, die zu Ihrem Institut passt. Gespiegelte Polymarket-Märkte stehen vom ersten Tag an für sofortige Liquiditätstiefe zur Verfügung.",
        },
        {
          q: "Wie sehen die Gebührenökonomien für den Betreiber aus?",
          aHtml:
            "Sie setzen Ihre eigene Trading Fee fest - typischerweise zwischen 0,5 % und 3 % pro Trade. Jede Transaktion auf Ihrer Plattform leitet diese Gebühr direkt an Ihr Institut weiter. Kuest erhebt darauf eine kleine Protokollgebühr.",
        },
        {
          q: "Was muss unser Team tatsächlich tun, um live zu gehen?",
          aHtml:
            "Ihr Team stellt Marken-Assets bereit, definiert den anfänglichen Event-Scope und prüft das Gebührenmodell. Kuest übernimmt Deployment der Verträge, Infrastrukturkonfiguration, Liquiditäts-Bootstrapping und Frontend-Deployment.",
        },
        {
          q: "Wie sieht die technische und regulatorische Grundlage aus?",
          aHtml: `Die Smart Contracts basieren auf Polymarkets CLOB-Architektur und nutzen UMA-basierte Resolution Rails. Der Code ist unter der <a href="${LICENSE_HREF}" target="_blank" rel="noopener">Kuest MIT+Commons license</a> offen zugänglich. Individuelle Compliance-Konfigurationen und Enterprise-Infrastrukturverträge sind verfügbar - <a href="mailto:hello@kuest.com">kontaktieren Sie uns</a>, um über Ihr regulatorisches Umfeld zu sprechen.`,
        },
      ],
    },
    finalCta: {
      title: "Ihre Kunden handeln bereits auf Polymarket. Die Frage ist nur, ob das auf Ihrer Plattform passiert.",
      subtitle: "Die Infrastruktur steht. Der First-Mover-Vorteil im Prognosemarkt schließt sich schnell.",
      contactCta: "Kontakt aufnehmen",
      viewLiveDemoCta: "Live-Demo ansehen",
    },
  },
  es: {
    meta: {
      title: "Kuest Enterprise",
      description:
        "Infraestructura white-label de mercados de predicción para instituciones financieras, plataformas de medios y operadores enterprise.",
      imageAlt: "Vista previa de Kuest Enterprise",
    },
    hero: {
      kicker: "Infraestructura white-label para mercados de predicción",
      titleLine1: "Se está formando",
      titleLine2: "un nuevo instrumento financiero.",
      titleAccent: "Sé la plataforma.",
      subtitle:
        "Los mercados de predicción ya procesan miles de millones al mes, y el 66 % de esa demanda viene de fuera de EE. UU., sin un solo operador local. Kuest permite a instituciones financieras, brokers y compañías de medios lanzar su propio mercado de predicción con marca propia: infraestructura auditada, liquidez compartida y comisión en cada trade.",
      contactCta: "Hablar con nosotros",
      viewDemoCta: "Ver demo",
      proof: "$18B de volumen mensual combinado - auditado por OpenZeppelin - listo para white-label",
      heroMarketTitles: makeHeroTitles(
        "¿La Fed recortará tasas antes de julio?",
        "¿La próxima administración de EE. UU. creará una reserva estratégica de BTC este año?",
        "¿Se anunciará un alto el fuego entre Rusia y Ucrania antes de fin de año?",
      ),
    },
    attention: {
      ariaLabel: "La oportunidad en los mercados de predicción",
      blockOne: [
        "Tus clientes ya están operando en Polymarket.",
        "Elecciones. Tasas de interés. Precio de Bitcoin. Resultados macro.",
        "Lo hacen en una plataforma estadounidense. Fuera de tu ecosistema. Pagando comisiones a otra empresa.",
        "No tienes visibilidad. No capturas ingresos. Y está creciendo rápido.",
      ],
      marketVolume: "Polymarket y Kalshi ya procesan más de 18 mil millones de dólares al mes.",
      polymarketAlt: "Polymarket",
      kalshiAlt: "Kalshi",
      outsideUs: "El 66 % de sus usuarios está fuera de EE. UU. - en tus mercados.",
      withoutLocalOperator: "Y ni una sola institución local está capturando esa demanda.",
      xpLead:
        "XP International - la mayor corredora de Brasil - acaba de asociarse con Kalshi para resolver exactamente esto.",
      xpFollowUp:
        "Vieron salir el volumen de su ecosistema y decidieron quedarse con la infraestructura.",
      xpPivot: "No necesitas esperar a que Kalshi te llame.",
    },
    marketToday: {
      eyebrow: "EL MERCADO HOY",
      stats: [
        {
          value: "$18.3B",
          label: "volumen mensual combinado, Kalshi + Polymarket",
          sourceHref: THE_BLOCK_HREF,
          sourceLabel: "Fuente: The Block, Q1 2026",
        },
        {
          value: "200x",
          label: "crecimiento anual del volumen de Kalshi, 2024-2025",
          sourceHref: PYMNTS_HREF,
          sourceLabel: "Fuente: PYMNTS, 2026",
        },
        {
          value: "66%",
          label: "del tráfico de Polymarket viene de fuera de EE. UU.",
          sourceHref: SIMILARWEB_HREF,
          sourceLabel: "Fuente: SimilarWeb, Feb 2026",
        },
        {
          value: "$20B",
          label: "valoración objetivo en rondas actuales de fundraising",
          sourceHref: COINDESK_HREF,
          sourceLabel: "Fuente: CoinDesk vía WSJ",
        },
      ],
    },
    explainer: {
      kicker: "UN NUEVO INSTRUMENTO FINANCIERO - YA OPERANDO A ESCALA",
      title: "Prediction Market",
      subtitle:
        "Piensa en él como un derivado binario sobre eventos futuros. La gente negocia posiciones sobre resultados con dinero real, en un libro de órdenes en vivo. Como hay capital real en juego, los precios que emergen suelen superar encuestas, pronósticos de analistas y paneles de expertos. El volumen termina en la plataforma que posee el mercado.",
    },
    niches: [
      {
        tag: "Crypto y activos",
        tagline: "Lanza un mercado con tu marca alrededor de cripto y activos digitales.",
        accent: "#f7931a",
        accentRgb: "247,147,26",
        icon: "bitcoin",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "¿Bitcoin cerrará por encima de $150K antes de Q4?",
            vol: "$42k Vol.",
            cat: "Crypto",
            pct: 61,
          },
          {
            type: "single",
            img: "/assets/images/ethereum-flippening.png",
            title: "¿Ethereum superará la capitalización de Bitcoin en 2026?",
            vol: "$29k Vol.",
            cat: "Crypto",
            pct: 18,
          },
          {
            type: "multi",
            img: "/assets/images/uniswap-v4-mainnet.png",
            title: "¿Qué clase de activo liderará las entradas netas el próximo trimestre?",
            vol: "$31k Vol.",
            cat: "Activos",
            rows: [
              { label: "BTC", pct: 42 },
              { label: "ETH", pct: 51 },
              { label: "Otros", pct: 7 },
            ],
          },
        ],
      },
      {
        tag: "Elecciones y política",
        tagline: "Captura el flujo político y regulatorio en tu mercado.",
        accent: "#8b5cf6",
        accentRgb: "139,92,246",
        icon: "landmark",
        cards: [
          {
            type: "single",
            img: "/assets/images/brazil-election-2026.png",
            title: "¿La coalición oficialista mantendrá la mayoría?",
            vol: "$38k Vol.",
            cat: "Política",
            pct: 47,
          },
          {
            type: "single",
            img: "/assets/images/donald-trump-president.png",
            title: "¿La próxima administración de EE. UU. creará una reserva estratégica de BTC?",
            vol: "$24k Vol.",
            cat: "Política",
            pct: 35,
          },
          {
            type: "multi",
            img: "/assets/images/uk-general-election.png",
            title: "¿Quién gana la próxima elección general del Reino Unido?",
            vol: "$19k Vol.",
            cat: "UK",
            rows: [
              { label: "Labour", pct: 58 },
              { label: "Conservative", pct: 28 },
              { label: "Otros", pct: 14 },
            ],
          },
        ],
      },
      {
        tag: "Macro y tasas",
        tagline: "Pon precio a resultados macro directamente en tu propia plataforma.",
        accent: "#4f8ef7",
        accentRgb: "79,142,247",
        icon: "trending-up",
        cards: [
          {
            type: "multi",
            img: "/assets/images/fed-rate-move.png",
            title: "Próxima decisión de la Fed",
            vol: "$31k Vol.",
            cat: "Tasas",
            rows: [
              { label: "Baja", pct: 42 },
              { label: "Mantiene", pct: 51 },
              { label: "Sube", pct: 7 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/russia-x-ukraine.png",
            title: "¿Un alto el fuego reducirá los precios globales de la energía antes de fin de año?",
            vol: "$22k Vol.",
            cat: "Macro",
            pct: 34,
          },
          {
            type: "single",
            img: "/assets/images/elon-500b-net-worth.png",
            title: "¿Las tasas reales caerán por debajo del 1 % antes de Q1?",
            vol: "$15k Vol.",
            cat: "Macro",
            pct: 38,
          },
        ],
      },
      {
        tag: "Commodities",
        tagline: "Convierte la volatilidad de commodities en engagement y comisiones.",
        accent: "#f0b429",
        accentRgb: "240,180,41",
        icon: "bar-chart-2",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "¿El oro marcará un nuevo máximo histórico este trimestre?",
            vol: "$17k Vol.",
            cat: "Oro",
            pct: 56,
          },
          {
            type: "single",
            img: "/assets/images/fed-rate-move.png",
            title: "¿Brent cerrará por encima de $100 antes de fin de año?",
            vol: "$12k Vol.",
            cat: "Petróleo",
            pct: 29,
          },
          {
            type: "multi",
            img: "/assets/images/governance-vote-chain.png",
            title: "¿Qué commodity rendirá mejor el próximo mes?",
            vol: "$14k Vol.",
            cat: "Macro",
            rows: [
              { label: "Oro", pct: 44 },
              { label: "Petróleo", pct: 33 },
              { label: "Cobre", pct: 23 },
            ],
          },
        ],
      },
      {
        tag: "Deportes",
        tagline: "Lanza mercados deportivos bajo tu propia superficie regulada.",
        accent: "#34d07f",
        accentRgb: "52,208,127",
        icon: "trophy",
        cards: [
          {
            type: "multi",
            img: "/assets/images/champions-league-top-scorer.png",
            title: "Máximo goleador - final de Champions League",
            vol: "$18k Vol.",
            cat: "Deportes",
            rows: [
              { label: "Mbappe", pct: 34 },
              { label: "Vinicius", pct: 28 },
              { label: "Bellingham", pct: 19 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/warriors-playoffs.png",
            title: "¿Los Warriors entrarán en playoffs?",
            vol: "$11k Vol.",
            cat: "NBA",
            pct: 55,
          },
          {
            type: "single",
            img: "/assets/images/daniel-negranu-wsop.png",
            title: "¿Daniel Negreanu llegará a la mesa final de la WSOP?",
            vol: "$8k Vol.",
            cat: "Póker",
            pct: 38,
          },
        ],
      },
      {
        tag: "Mercados custom",
        tagline: "Crea contratos exclusivos adaptados a tu propia audiencia.",
        accent: "#f43f5e",
        accentRgb: "244,63,94",
        icon: "sliders",
        cards: [
          {
            type: "single",
            img: "/assets/images/discord-50k-members.png",
            title: "¿Nuestra comunidad privada alcanzará 50K miembros este trimestre?",
            vol: "$9k Vol.",
            cat: "Comunidad",
            pct: 44,
          },
          {
            type: "single",
            img: "/assets/images/marvel-opening-weekend.png",
            title: "¿La IPO local insignia saldrá por encima de su rango?",
            vol: "$10k Vol.",
            cat: "Custom",
            pct: 41,
          },
          {
            type: "multi",
            img: "/assets/images/elon-usa-election.png",
            title: "¿Qué escenario macro a medida ocurre primero?",
            vol: "$13k Vol.",
            cat: "Escenario",
            rows: [
              { label: "Soft landing", pct: 39 },
              { label: "Reflation", pct: 35 },
              { label: "Shock", pct: 26 },
            ],
          },
        ],
      },
    ],
    solution: {
      title: "Del acuerdo firmado a una plataforma en vivo - en días, no en trimestres.",
      lead:
        "Smart contracts auditados, liquidez compartida desde el día uno, white-label completo: tu equipo aprueba la marca y nosotros operamos el resto.",
      timelineAriaLabel: "Cómo funciona Kuest",
      points: [
        {
          title: "Define el alcance de tu mercado y tu modelo de fees",
          copy:
            "Elige las categorías que importan a tus clientes - macro, tasas, política, commodities, crypto, deportes. Crea mercados propios exclusivos para tu plataforma. Define tu fee. Nosotros configuramos todo alrededor de tu marca y tu perímetro regulatorio.",
        },
        {
          title: "Desplegamos todo el stack técnico - sin pedirte ingeniería interna",
          copy:
            "Smart contracts, motor CLOB, settlement rails, wallets e infraestructura de liquidez operando antes de que termine tu onboarding. Los contratos derivan de la arquitectura de Polymarket y están auditados por OpenZeppelin. No necesitas equipo blockchain interno. No necesitas sprint de infraestructura.",
        },
        {
          title: "Tu plataforma cobra una fee en cada trade, automáticamente",
          copy:
            "Cada transacción de tus clientes genera ingresos directos para tu institución - sin intermediarios, sin revenue share y sin demora en settlement. El mismo modelo de infraestructura ya impulsa plataformas que procesan más de 18 mil millones al mes.",
        },
      ],
      cta: "Hablar con nosotros",
      note: "WHITE-LABEL - CONTRATOS AUDITADOS - LIQUIDEZ INCLUIDA",
    },
    proofCards: [
      {
        label: "Volumen mensual",
        value: "$18.3B",
        copyHtml: `Volumen mensual combinado de Kalshi + Polymarket, según ${sourceLink(THE_BLOCK_HREF, "The Block", "Prediction Market Volume")}.`,
      },
      {
        label: "Fuera de EE. UU.",
        value: "66%",
        copyHtml: `Porcentaje del tráfico de Polymarket que viene de fuera de Estados Unidos, según ${sourceLink(SIMILARWEB_HREF, "SimilarWeb", "Polymarket traffic share")}.`,
      },
      {
        label: "Señal de valoración",
        value: "$20B",
        copyHtml: `Objetivo de valoración actual en el fundraising de Kalshi y Polymarket, vía ${sourceLink(COINDESK_HREF, "CoinDesk", "Prediction market valuations")}.`,
      },
    ],
    features: {
      eyebrow: "LO QUE YA ESTÁ OPERATIVO",
      title: "Todo el stack de trading. Sin sprint de ingeniería.",
      subtitle:
        "Todo lo que tu institución tendría que construir desde cero ya está en producción, auditado y listo para salir con tu marca.",
      cards: [
        {
          icon: "activity",
          title: "Motor CLOB + relayer + matching",
          copy:
            "Libro de órdenes central, infraestructura de relayer y matching engine: la misma arquitectura que impulsa Polymarket en Polygon mainnet.",
        },
        {
          icon: "shield-check",
          title: "Contratos auditados por OpenZeppelin",
          copy:
            "Smart contracts derivados de la arquitectura auditada de Polymarket, adaptados para liquidez compartida entre múltiples frontends. Resolución con UMA para settlement verificable.",
        },
        {
          icon: "users",
          title: "Liquidez compartida desde el día uno",
          copy:
            "Replica mercados activos de Polymarket con order flow existente. Tu plataforma arranca con profundidad real, sin cold start y sin reclutar market makers al inicio.",
        },
        {
          icon: "bot",
          title: "SDKs de bots para traders institucionales",
          copy:
            "SDKs en Python y Rust compatibles con estrategias existentes de Polymarket. Los market makers pueden migrar a tu plataforma sin reconstruir todo.",
        },
        {
          icon: "globe-2",
          title: "Frontend white-label completo",
          copy:
            "Tu dominio, tu marca, tu idioma. UI multilenguaje con i18n incorporado. Categorías personalizadas. Se siente como un producto nativo de tu institución, no como un despliegue de Kuest.",
        },
        {
          icon: "server",
          title: "Infraestructura totalmente gestionada",
          copy:
            "Gas, settlement, escalabilidad y monitoring corren de nuestro lado. No necesitas equipo blockchain interno ni infraestructura cloud propia. Tú te enfocas en la distribución.",
        },
      ],
    },
    preview: {
      title: "Este es el producto con el que interactuarán tus clientes.",
      subtitle:
        "Una demo funcional con mercados en vivo reflejados de Polymarket. Tu despliegue llevaría tu dominio, tu marca, tus categorías elegidas y tu fee en cada transacción ejecutada por tus clientes.",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "¿Qué es exactamente un mercado de predicción y en qué se diferencia de una plataforma de apuestas?",
          aHtml:
            "Un mercado de predicción es un libro de órdenes en vivo donde los participantes compran y venden posiciones sobre el resultado de eventos reales, usando la misma mecánica binaria que un derivado financiero. A diferencia de las apuestas deportivas, aquí la casa no fija cuotas ni toma la otra punta. El precio se forma peer-to-peer en tiempo real por oferta y demanda. El operador gana una comisión por trade, no por quién gana.",
        },
        {
          q: "¿Quiénes son Kalshi y Polymarket y por qué importan aquí?",
          aHtml:
            "Kalshi es una bolsa regulada en EE. UU. enfocada en event contracts. Polymarket es un mercado de predicción descentralizado sobre Polygon. Entre ambos demostraron que esto no es un nicho, sino una nueva primitiva financiera. Son plataformas cerradas; Kuest ofrece la misma infraestructura en un modelo abierto y white-label.",
        },
        {
          q: "¿Qué está pasando hoy en el mercado que hace que este momento sea tan relevante?",
          aHtml:
            "Kalshi y Polymarket están levantando capital con valoraciones cercanas a $20B cada una. B3 está entrando en la categoría en Brasil. Kalshi cerró su primer acuerdo institucional internacional con XP International. La decisión sobre quién proveerá la infraestructura institucional se está tomando ahora, y la mayoría de los mercados locales aún no tienen operador.",
        },
        {
          q: "¿Qué tipo de instituciones ya se están moviendo en este espacio?",
          aHtml:
            "Brokers, bolsas, grupos de medios financieros, compañías de sports analytics y desks institucionales ya están probando event contracts. La demanda existe en todos los mercados importantes, pero casi nadie ha construido la infraestructura local.",
        },
        {
          q: "¿Podemos crear mercados exclusivos para nuestra plataforma y nuestra base de clientes?",
          aHtml:
            "Sí. Puedes crear mercados propios sobre macro, política, tasas, commodities, crypto o cualquier categoría alineada con tu institución. Los mercados reflejados de Polymarket están disponibles desde el día uno para tener profundidad inmediata.",
        },
        {
          q: "¿Cómo funciona la economía de fees para el operador?",
          aHtml:
            "Tú defines tu propia fee de trading - normalmente entre 0,5 % y 3 % por trade. Cada transacción en tu plataforma envía esa fee directamente a tu institución. Kuest retiene una pequeña fee de protocolo por encima.",
        },
        {
          q: "¿Qué necesita hacer realmente nuestro equipo para salir al aire?",
          aHtml:
            "Tu equipo aporta los assets de marca, define el scope inicial de eventos y revisa la estructura de fees. Kuest se encarga del deployment de contratos, configuración de infraestructura, bootstrap de liquidez y despliegue del frontend.",
        },
        {
          q: "¿Cuál es la base técnica y de compliance?",
          aHtml: `Los smart contracts derivan de la arquitectura CLOB de Polymarket y usan resolution rails con UMA. El código está disponible bajo la <a href="${LICENSE_HREF}" target="_blank" rel="noopener">Kuest MIT+Commons license</a>. También ofrecemos configuraciones de compliance e infraestructura enterprise adaptadas a tu entorno regulatorio - <a href="mailto:hello@kuest.com">contáctanos</a> para verlo.`,
        },
      ],
    },
    finalCta: {
      title: "Tus clientes ya están operando en Polymarket. La pregunta es si eso ocurre en tu propia plataforma.",
      subtitle: "La infraestructura ya existe. La ventaja del first mover en prediction markets se cierra rápido.",
      contactCta: "Hablar con nosotros",
      viewLiveDemoCta: "Ver demo en vivo",
    },
  },
  pt: {
    meta: {
      title: "Kuest Enterprise",
      description:
        "Infraestrutura white-label de mercados de previsão para instituições financeiras, plataformas de mídia e operadores enterprise.",
      imageAlt: "Prévia do Kuest Enterprise",
    },
    hero: {
      kicker: "Infraestrutura white-label para mercados de previsão",
      titleLine1: "Um novo instrumento financeiro",
      titleLine2: "está se formando.",
      titleAccent: "Seja a plataforma.",
      subtitle:
        "Mercados de previsão já processam bilhões por mês - e 66% dessa demanda vem de fora dos EUA, sem um único operador local. A Kuest permite que instituições financeiras, corretoras e empresas de mídia lancem seu próprio mercado com marca própria: infraestrutura auditada, liquidez compartilhada e sua taxa em cada trade.",
      contactCta: "Falar com a gente",
      viewDemoCta: "Ver demo",
      proof: "$18B de volume mensal combinado - auditado pela OpenZeppelin - pronto para white-label",
      heroMarketTitles: makeHeroTitles(
        "O Fed corta os juros antes de julho?",
        "O próximo governo dos EUA cria uma reserva estratégica de BTC este ano?",
        "Um cessar-fogo entre Rússia e Ucrânia será anunciado antes do fim do ano?",
      ),
    },
    attention: {
      ariaLabel: "A oportunidade em mercados de previsão",
      blockOne: [
        "Seus clientes já estão operando na Polymarket.",
        "Eleições. Juros. Preço do Bitcoin. Resultados macro.",
        "Eles fazem isso em uma plataforma americana. Fora do seu ecossistema. Pagando taxas para outra empresa.",
        "Você não tem visibilidade. Não tem receita. E isso está crescendo rápido.",
      ],
      marketVolume: "Polymarket e Kalshi já processam mais de 18 bilhões de dólares por mês.",
      polymarketAlt: "Polymarket",
      kalshiAlt: "Kalshi",
      outsideUs: "66% dos usuários estão fora dos EUA - nos seus mercados.",
      withoutLocalOperator: "E nenhuma instituição local está capturando essa demanda.",
      xpLead:
        "A XP International - maior corretora do Brasil - acabou de fechar com a Kalshi para resolver exatamente isso.",
      xpFollowUp:
        "Eles viram o volume saindo do ecossistema deles e decidiram controlar a infraestrutura.",
      xpPivot: "Você não precisa esperar a Kalshi te ligar.",
    },
    marketToday: {
      eyebrow: "O MERCADO HOJE",
      stats: [
        {
          value: "$18.3B",
          label: "volume mensal combinado, Kalshi + Polymarket",
          sourceHref: THE_BLOCK_HREF,
          sourceLabel: "Fonte: The Block, Q1 2026",
        },
        {
          value: "200x",
          label: "crescimento anual do volume da Kalshi, 2024-2025",
          sourceHref: PYMNTS_HREF,
          sourceLabel: "Fonte: PYMNTS, 2026",
        },
        {
          value: "66%",
          label: "do tráfego da Polymarket vem de fora dos EUA",
          sourceHref: SIMILARWEB_HREF,
          sourceLabel: "Fonte: SimilarWeb, Fev 2026",
        },
        {
          value: "$20B",
          label: "valuation alvo nas rodadas atuais",
          sourceHref: COINDESK_HREF,
          sourceLabel: "Fonte: CoinDesk via WSJ",
        },
      ],
    },
    explainer: {
      kicker: "UM NOVO INSTRUMENTO FINANCEIRO - JÁ OPERANDO EM ESCALA",
      title: "Prediction Market",
      subtitle:
        "Pense nisso como um derivativo binário sobre eventos futuros. As pessoas negociam posições sobre resultados com dinheiro real, em um livro de ofertas ao vivo. Como há capital real em jogo, os preços gerados costumam superar pesquisas, projeções de analistas e painéis de especialistas. O volume vai para quem controla a plataforma.",
    },
    niches: [
      {
        tag: "Cripto e ativos",
        tagline: "Lance um mercado com sua marca em torno de cripto e ativos digitais.",
        accent: "#f7931a",
        accentRgb: "247,147,26",
        icon: "bitcoin",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "O Bitcoin fecha acima de $150K antes do Q4?",
            vol: "$42k Vol.",
            cat: "Cripto",
            pct: 61,
          },
          {
            type: "single",
            img: "/assets/images/ethereum-flippening.png",
            title: "O Ethereum ultrapassa o market cap do Bitcoin em 2026?",
            vol: "$29k Vol.",
            cat: "Cripto",
            pct: 18,
          },
          {
            type: "multi",
            img: "/assets/images/uniswap-v4-mainnet.png",
            title: "Qual classe de ativo lidera os fluxos líquidos no próximo trimestre?",
            vol: "$31k Vol.",
            cat: "Ativos",
            rows: [
              { label: "BTC", pct: 42 },
              { label: "ETH", pct: 51 },
              { label: "Outros", pct: 7 },
            ],
          },
        ],
      },
      {
        tag: "Eleições e política",
        tagline: "Capture o fluxo político e regulatório no seu mercado.",
        accent: "#8b5cf6",
        accentRgb: "139,92,246",
        icon: "landmark",
        cards: [
          {
            type: "single",
            img: "/assets/images/brazil-election-2026.png",
            title: "A coalizão incumbente mantém a maioria de governo?",
            vol: "$38k Vol.",
            cat: "Política",
            pct: 47,
          },
          {
            type: "single",
            img: "/assets/images/donald-trump-president.png",
            title: "O próximo governo dos EUA cria uma reserva estratégica de BTC?",
            vol: "$24k Vol.",
            cat: "Política",
            pct: 35,
          },
          {
            type: "multi",
            img: "/assets/images/uk-general-election.png",
            title: "Quem vence a próxima eleição geral do Reino Unido?",
            vol: "$19k Vol.",
            cat: "UK",
            rows: [
              { label: "Labour", pct: 58 },
              { label: "Conservative", pct: 28 },
              { label: "Outros", pct: 14 },
            ],
          },
        ],
      },
      {
        tag: "Macro e juros",
        tagline: "Precifique resultados macro diretamente na sua própria plataforma.",
        accent: "#4f8ef7",
        accentRgb: "79,142,247",
        icon: "trending-up",
        cards: [
          {
            type: "multi",
            img: "/assets/images/fed-rate-move.png",
            title: "Próxima decisão do Fed",
            vol: "$31k Vol.",
            cat: "Juros",
            rows: [
              { label: "Corte", pct: 42 },
              { label: "Mantém", pct: 51 },
              { label: "Alta", pct: 7 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/russia-x-ukraine.png",
            title: "Um cessar-fogo reduz os preços globais de energia antes do fim do ano?",
            vol: "$22k Vol.",
            cat: "Macro",
            pct: 34,
          },
          {
            type: "single",
            img: "/assets/images/elon-500b-net-worth.png",
            title: "Os juros reais caem abaixo de 1% antes do Q1?",
            vol: "$15k Vol.",
            cat: "Macro",
            pct: 38,
          },
        ],
      },
      {
        tag: "Commodities",
        tagline: "Transforme a volatilidade de commodities em engajamento e receita de taxas.",
        accent: "#f0b429",
        accentRgb: "240,180,41",
        icon: "bar-chart-2",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "O ouro bate uma nova máxima histórica neste trimestre?",
            vol: "$17k Vol.",
            cat: "Ouro",
            pct: 56,
          },
          {
            type: "single",
            img: "/assets/images/fed-rate-move.png",
            title: "O Brent fecha acima de $100 antes do fim do ano?",
            vol: "$12k Vol.",
            cat: "Petróleo",
            pct: 29,
          },
          {
            type: "multi",
            img: "/assets/images/governance-vote-chain.png",
            title: "Qual commodity performa melhor no próximo mês?",
            vol: "$14k Vol.",
            cat: "Macro",
            rows: [
              { label: "Ouro", pct: 44 },
              { label: "Petróleo", pct: 33 },
              { label: "Cobre", pct: 23 },
            ],
          },
        ],
      },
      {
        tag: "Esportes",
        tagline: "Lance mercados esportivos sob sua própria superfície regulada.",
        accent: "#34d07f",
        accentRgb: "52,208,127",
        icon: "trophy",
        cards: [
          {
            type: "multi",
            img: "/assets/images/champions-league-top-scorer.png",
            title: "Artilheiro - final da Champions League",
            vol: "$18k Vol.",
            cat: "Esportes",
            rows: [
              { label: "Mbappe", pct: 34 },
              { label: "Vinicius", pct: 28 },
              { label: "Bellingham", pct: 19 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/warriors-playoffs.png",
            title: "Os Warriors chegam aos playoffs?",
            vol: "$11k Vol.",
            cat: "NBA",
            pct: 55,
          },
          {
            type: "single",
            img: "/assets/images/daniel-negranu-wsop.png",
            title: "Daniel Negreanu chega à mesa final da WSOP?",
            vol: "$8k Vol.",
            cat: "Poker",
            pct: 38,
          },
        ],
      },
      {
        tag: "Mercados customizados",
        tagline: "Crie contratos exclusivos adaptados à sua própria audiência.",
        accent: "#f43f5e",
        accentRgb: "244,63,94",
        icon: "sliders",
        cards: [
          {
            type: "single",
            img: "/assets/images/discord-50k-members.png",
            title: "Nossa comunidade privada bate 50 mil membros neste trimestre?",
            vol: "$9k Vol.",
            cat: "Comunidade",
            pct: 44,
          },
          {
            type: "single",
            img: "/assets/images/marvel-opening-weekend.png",
            title: "O IPO local principal sai acima da faixa indicativa?",
            vol: "$10k Vol.",
            cat: "Custom",
            pct: 41,
          },
          {
            type: "multi",
            img: "/assets/images/elon-usa-election.png",
            title: "Qual cenário macro sob medida acontece primeiro?",
            vol: "$13k Vol.",
            cat: "Cenário",
            rows: [
              { label: "Soft landing", pct: 39 },
              { label: "Reflation", pct: 35 },
              { label: "Choque", pct: 26 },
            ],
          },
        ],
      },
    ],
    solution: {
      title: "Do contrato assinado à plataforma no ar - em dias, não em trimestres.",
      lead:
        "Smart contracts auditados, liquidez compartilhada desde o primeiro dia, white-label completo - seu time aprova a marca e a gente cuida do resto.",
      timelineAriaLabel: "Como a Kuest funciona",
      points: [
        {
          title: "Defina o escopo do mercado e o modelo de taxas",
          copy:
            "Escolha as categorias que importam para os seus clientes - macro, juros, política, commodities, cripto, esportes. Crie mercados proprietários exclusivos da sua plataforma. Defina sua taxa. Nós configuramos tudo ao redor da sua marca e do seu perímetro regulatório.",
        },
        {
          title: "Nós colocamos de pé o stack técnico completo - sem exigir engenharia interna",
          copy:
            "Smart contracts, motor CLOB, settlement rails, infraestrutura de wallet e liquidez operando antes do fim do onboarding. Os contratos derivam da arquitetura da Polymarket e foram auditados pela OpenZeppelin. Sem time blockchain interno. Sem sprint de infraestrutura.",
        },
        {
          title: "Sua plataforma ganha em cada trade, automaticamente",
          copy:
            "Cada transação executada pelos seus clientes gera receita direta para a sua instituição - sem intermediário, sem revenue share e sem atraso de liquidação. O mesmo modelo de infraestrutura já opera plataformas que processam mais de 18 bilhões por mês.",
        },
      ],
      cta: "Falar com a gente",
      note: "WHITE-LABEL - CONTRATOS AUDITADOS - LIQUIDEZ INCLUÍDA",
    },
    proofCards: [
      {
        label: "Volume mensal",
        value: "$18.3B",
        copyHtml: `Volume mensal combinado de Kalshi + Polymarket, segundo ${sourceLink(THE_BLOCK_HREF, "The Block", "Prediction Market Volume")}.`,
      },
      {
        label: "Fora dos EUA",
        value: "66%",
        copyHtml: `Parcela do tráfego da Polymarket vinda de fora dos Estados Unidos, segundo ${sourceLink(SIMILARWEB_HREF, "SimilarWeb", "Polymarket traffic share")}.`,
      },
      {
        label: "Sinal de valuation",
        value: "$20B",
        copyHtml: `Valuation alvo atual nas conversas de fundraising de Kalshi e Polymarket, via ${sourceLink(COINDESK_HREF, "CoinDesk", "Prediction market valuations")}.`,
      },
    ],
    features: {
      eyebrow: "O QUE JÁ ESTÁ OPERACIONAL",
      title: "O stack completo de trading. Sem sprint de engenharia.",
      subtitle:
        "Tudo o que a sua instituição precisaria construir do zero já está rodando, auditado e pronto para entrar no ar com a sua marca.",
      cards: [
        {
          icon: "activity",
          title: "Motor CLOB + relayer + matching",
          copy:
            "Livro central de ordens, infraestrutura de relayer e matching engine - a mesma arquitetura da Polymarket rodando em Polygon mainnet.",
        },
        {
          icon: "shield-check",
          title: "Contratos auditados pela OpenZeppelin",
          copy:
            "Smart contracts derivados da arquitetura auditada da Polymarket, adaptados para liquidez compartilhada entre vários frontends. Resolução com UMA para settlement verificável.",
        },
        {
          icon: "users",
          title: "Liquidez compartilhada desde o dia um",
          copy:
            "Espelhe mercados ativos da Polymarket com order flow existente. Sua plataforma entra no ar com profundidade real - sem cold start e sem precisar recrutar market makers no começo.",
        },
        {
          icon: "bot",
          title: "SDKs de bots para traders institucionais",
          copy:
            "SDKs em Python e Rust compatíveis com estratégias já usadas na Polymarket. Market makers podem portar para a sua plataforma sem reconstruir tudo.",
        },
        {
          icon: "globe-2",
          title: "Frontend white-label completo",
          copy:
            "Seu domínio, sua marca, seu idioma. UI multilíngue com i18n embutido. Categorias personalizadas. Parece um produto nativo da sua instituição - não um deploy da Kuest.",
        },
        {
          icon: "server",
          title: "Infraestrutura totalmente gerenciada",
          copy:
            "Gas, liquidação, escala e monitoramento ficam com a gente. Sem time blockchain interno. Sem cloud própria para operar. Você foca em distribuição.",
        },
      ],
    },
    preview: {
      title: "Esse é o produto com o qual seus clientes vão interagir.",
      subtitle:
        "Um demo funcional com mercados ao vivo espelhados da Polymarket. O seu deployment teria seu domínio, sua marca, suas categorias escolhidas - e a sua taxa em cada transação executada pelos seus clientes.",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "O que exatamente é um mercado de previsão - e qual a diferença para uma plataforma de apostas?",
          aHtml:
            "Um mercado de previsão é um livro de ofertas ao vivo em que participantes compram e vendem posições sobre o resultado de eventos reais - usando a mesma mecânica binária de um derivativo financeiro. Diferente de uma casa de apostas, a plataforma não define odds nem toma a outra ponta. O preço é definido peer-to-peer em tempo real pela oferta e demanda. O operador ganha taxa por trade, não por quem vence.",
        },
        {
          q: "Quem são Kalshi e Polymarket - e por que isso importa aqui?",
          aHtml:
            "A Kalshi é uma bolsa regulada nos EUA focada em event contracts. A Polymarket é um mercado de previsão descentralizado sobre Polygon. Juntas, elas provaram que prediction markets não são um nicho, e sim uma nova primitiva financeira. Ambas são plataformas fechadas; a Kuest entrega a mesma infraestrutura em um modelo aberto e white-label.",
        },
        {
          q: "O que está acontecendo agora no mercado que torna esse timing tão relevante?",
          aHtml:
            "Kalshi e Polymarket estão em rodadas ativas com valuations próximos de $20B cada. A B3 está entrando na categoria no Brasil. A Kalshi assinou seu primeiro acordo institucional internacional com a XP International. A decisão sobre quem vai prover a infraestrutura institucional está sendo tomada agora, e a maioria dos mercados locais ainda não tem operador.",
        },
        {
          q: "Que tipos de instituições já estão se movendo nesse espaço?",
          aHtml:
            "Corretoras, bolsas, grupos de mídia financeira, empresas de sports analytics e desks institucionais já estão testando event contracts. A demanda existe em todos os grandes mercados, mas muito poucos operadores locais construíram a infraestrutura.",
        },
        {
          q: "Podemos criar mercados exclusivos para a nossa plataforma e base de clientes?",
          aHtml:
            "Sim. Você pode criar mercados proprietários sobre macro, política, juros, commodities, cripto ou qualquer categoria alinhada com a sua instituição. Mercados espelhados da Polymarket ficam disponíveis desde o dia um para garantir profundidade imediata.",
        },
        {
          q: "Como funciona a economia de taxas para o operador?",
          aHtml:
            "Você define a sua taxa de trading - normalmente entre 0,5% e 3% por trade. Cada transação na sua plataforma direciona essa taxa diretamente para a sua instituição. A Kuest retém uma pequena taxa de protocolo por cima.",
        },
        {
          q: "O que o nosso time realmente precisa fazer para colocar isso no ar?",
          aHtml:
            "Seu time fornece os assets de marca, define o escopo inicial de eventos e revisa a estrutura de taxas. A Kuest cuida do deployment de contratos, da configuração de infraestrutura, do bootstrap de liquidez e do frontend.",
        },
        {
          q: "Qual é a base técnica e de compliance?",
          aHtml: `Os smart contracts derivam da arquitetura CLOB da Polymarket e usam trilhos de resolução com UMA. O código está disponível sob a <a href="${LICENSE_HREF}" target="_blank" rel="noopener">Kuest MIT+Commons license</a>. Também oferecemos configurações de compliance e contratos de infraestrutura enterprise adaptados ao seu ambiente regulatório - <a href="mailto:hello@kuest.com">fale com a gente</a> para conversar.`,
        },
      ],
    },
    finalCta: {
      title: "Seus clientes já estão operando na Polymarket. A pergunta é se isso acontece na sua plataforma.",
      subtitle: "A infraestrutura está pronta. A vantagem do first mover em prediction markets fecha rápido.",
      contactCta: "Falar com a gente",
      viewLiveDemoCta: "Ver demo ao vivo",
    },
  },
  fr: {
    meta: {
      title: "Kuest Enterprise",
      description:
        "Infrastructure white-label de marchés prédictifs pour institutions financières, plateformes média et opérateurs enterprise.",
      imageAlt: "Aperçu Kuest Enterprise",
    },
    hero: {
      kicker: "Infrastructure white-label pour marchés prédictifs",
      titleLine1: "Un nouvel instrument financier",
      titleLine2: "est en train d'émerger.",
      titleAccent: "Soyez la plateforme.",
      subtitle:
        "Les marchés prédictifs traitent déjà des milliards par mois - et 66 % de cette demande vient de l'extérieur des États-Unis, sans opérateur local. Kuest permet aux institutions financières, courtiers et entreprises média de lancer leur propre marché sous marque blanche : infrastructure auditée, liquidité mutualisée et frais sur chaque trade.",
      contactCta: "Nous contacter",
      viewDemoCta: "Voir la démo",
      proof: "$18B de volume mensuel combiné - audité par OpenZeppelin - prêt en white-label",
      heroMarketTitles: makeHeroTitles(
        "La Fed va-t-elle baisser ses taux avant juillet ?",
        "La prochaine administration américaine créera-t-elle une réserve stratégique de BTC cette année ?",
        "Un cessez-le-feu Russie-Ukraine sera-t-il annoncé avant la fin de l'année ?",
      ),
    },
    attention: {
      ariaLabel: "L'opportunité des marchés prédictifs",
      blockOne: [
        "Vos clients tradent déjà sur Polymarket.",
        "Élections. Taux. Bitcoin. Scénarios macro.",
        "Ils le font sur une plateforme américaine. Hors de votre écosystème. En payant des frais à quelqu'un d'autre.",
        "Vous n'avez aucune visibilité. Aucun revenu dessus. Et la dynamique s'accélère.",
      ],
      marketVolume: "Polymarket et Kalshi traitent désormais plus de 18 milliards de dollars par mois.",
      polymarketAlt: "Polymarket",
      kalshiAlt: "Kalshi",
      outsideUs: "66 % de leurs utilisateurs sont hors des États-Unis - sur vos marchés.",
      withoutLocalOperator: "Sans qu'aucune institution locale ne capte cette demande.",
      xpLead:
        "XP International - le plus grand courtier du Brésil - vient justement de s'associer à Kalshi pour résoudre ce problème.",
      xpFollowUp:
        "Ils ont vu le volume sortir de leur écosystème et ont décidé de posséder l'infrastructure.",
      xpPivot: "Vous n'avez pas besoin d'attendre l'appel de Kalshi.",
    },
    marketToday: {
      eyebrow: "LE MARCHÉ AUJOURD'HUI",
      stats: [
        {
          value: "$18.3B",
          label: "volume mensuel combiné, Kalshi + Polymarket",
          sourceHref: THE_BLOCK_HREF,
          sourceLabel: "Source : The Block, T1 2026",
        },
        {
          value: "200x",
          label: "croissance annuelle du volume de Kalshi, 2024-2025",
          sourceHref: PYMNTS_HREF,
          sourceLabel: "Source : PYMNTS, 2026",
        },
        {
          value: "66%",
          label: "du trafic Polymarket vient de l'extérieur des États-Unis",
          sourceHref: SIMILARWEB_HREF,
          sourceLabel: "Source : SimilarWeb, fév. 2026",
        },
        {
          value: "$20B",
          label: "valorisation visée dans les levées en cours",
          sourceHref: COINDESK_HREF,
          sourceLabel: "Source : CoinDesk via WSJ",
        },
      ],
    },
    explainer: {
      kicker: "UN NOUVEL INSTRUMENT FINANCIER - DÉJÀ OPÉRATIONNEL À GRANDE ÉCHELLE",
      title: "Prediction Market",
      subtitle:
        "Voyez cela comme un dérivé binaire sur des événements futurs. Les participants prennent des positions avec de l'argent réel dans un carnet d'ordres en direct. Parce que le capital est réel, les prix qui émergent battent souvent sondages, analystes et panels d'experts. Le volume généré revient à la plateforme qui possède le marché.",
    },
    niches: [
      {
        tag: "Crypto & actifs",
        tagline: "Déployez un marché brandé autour de la crypto et des actifs digitaux.",
        accent: "#f7931a",
        accentRgb: "247,147,26",
        icon: "bitcoin",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "Bitcoin clôturera-t-il au-dessus de $150K avant le T4 ?",
            vol: "$42k Vol.",
            cat: "Crypto",
            pct: 61,
          },
          {
            type: "single",
            img: "/assets/images/ethereum-flippening.png",
            title: "Ethereum dépassera-t-il la capitalisation de Bitcoin en 2026 ?",
            vol: "$29k Vol.",
            cat: "Crypto",
            pct: 18,
          },
          {
            type: "multi",
            img: "/assets/images/uniswap-v4-mainnet.png",
            title: "Quelle classe d'actifs mènera les flux nets au prochain trimestre ?",
            vol: "$31k Vol.",
            cat: "Actifs",
            rows: [
              { label: "BTC", pct: 42 },
              { label: "ETH", pct: 51 },
              { label: "Autres", pct: 7 },
            ],
          },
        ],
      },
      {
        tag: "Élections & politique",
        tagline: "Captez les flux politiques et réglementaires sur votre marché.",
        accent: "#8b5cf6",
        accentRgb: "139,92,246",
        icon: "landmark",
        cards: [
          {
            type: "single",
            img: "/assets/images/brazil-election-2026.png",
            title: "La coalition au pouvoir conservera-t-elle sa majorité ?",
            vol: "$38k Vol.",
            cat: "Politique",
            pct: 47,
          },
          {
            type: "single",
            img: "/assets/images/donald-trump-president.png",
            title: "La prochaine administration américaine créera-t-elle une réserve stratégique de BTC ?",
            vol: "$24k Vol.",
            cat: "Politique",
            pct: 35,
          },
          {
            type: "multi",
            img: "/assets/images/uk-general-election.png",
            title: "Qui gagne les prochaines législatives britanniques ?",
            vol: "$19k Vol.",
            cat: "UK",
            rows: [
              { label: "Labour", pct: 58 },
              { label: "Conservative", pct: 28 },
              { label: "Autres", pct: 14 },
            ],
          },
        ],
      },
      {
        tag: "Macro & taux",
        tagline: "Tarifez les scénarios macro directement sur votre propre plateforme.",
        accent: "#4f8ef7",
        accentRgb: "79,142,247",
        icon: "trending-up",
        cards: [
          {
            type: "multi",
            img: "/assets/images/fed-rate-move.png",
            title: "Prochaine décision de la Fed",
            vol: "$31k Vol.",
            cat: "Taux",
            rows: [
              { label: "Baisse", pct: 42 },
              { label: "Maintien", pct: 51 },
              { label: "Hausse", pct: 7 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/russia-x-ukraine.png",
            title: "Un cessez-le-feu fera-t-il baisser les prix mondiaux de l'énergie avant la fin de l'année ?",
            vol: "$22k Vol.",
            cat: "Macro",
            pct: 34,
          },
          {
            type: "single",
            img: "/assets/images/elon-500b-net-worth.png",
            title: "Les taux réels tomberont-ils sous 1 % avant le T1 ?",
            vol: "$15k Vol.",
            cat: "Macro",
            pct: 38,
          },
        ],
      },
      {
        tag: "Commodities",
        tagline: "Transformez la volatilité des matières premières en engagement et en frais.",
        accent: "#f0b429",
        accentRgb: "240,180,41",
        icon: "bar-chart-2",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "L'or atteindra-t-il un nouveau sommet historique ce trimestre ?",
            vol: "$17k Vol.",
            cat: "Or",
            pct: 56,
          },
          {
            type: "single",
            img: "/assets/images/fed-rate-move.png",
            title: "Le Brent clôturera-t-il au-dessus de $100 avant la fin de l'année ?",
            vol: "$12k Vol.",
            cat: "Pétrole",
            pct: 29,
          },
          {
            type: "multi",
            img: "/assets/images/governance-vote-chain.png",
            title: "Quelle matière première surperforme le mois prochain ?",
            vol: "$14k Vol.",
            cat: "Macro",
            rows: [
              { label: "Or", pct: 44 },
              { label: "Pétrole", pct: 33 },
              { label: "Cuivre", pct: 23 },
            ],
          },
        ],
      },
      {
        tag: "Sport",
        tagline: "Lancez des marchés sportifs sous votre propre surface régulée.",
        accent: "#34d07f",
        accentRgb: "52,208,127",
        icon: "trophy",
        cards: [
          {
            type: "multi",
            img: "/assets/images/champions-league-top-scorer.png",
            title: "Meilleur buteur - finale de Ligue des Champions",
            vol: "$18k Vol.",
            cat: "Sport",
            rows: [
              { label: "Mbappe", pct: 34 },
              { label: "Vinicius", pct: 28 },
              { label: "Bellingham", pct: 19 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/warriors-playoffs.png",
            title: "Les Warriors iront-ils en playoffs ?",
            vol: "$11k Vol.",
            cat: "NBA",
            pct: 55,
          },
          {
            type: "single",
            img: "/assets/images/daniel-negranu-wsop.png",
            title: "Daniel Negreanu atteindra-t-il la table finale des WSOP ?",
            vol: "$8k Vol.",
            cat: "Poker",
            pct: 38,
          },
        ],
      },
      {
        tag: "Marchés custom",
        tagline: "Créez des contrats exclusifs adaptés à votre propre audience.",
        accent: "#f43f5e",
        accentRgb: "244,63,94",
        icon: "sliders",
        cards: [
          {
            type: "single",
            img: "/assets/images/discord-50k-members.png",
            title: "Notre communauté privée atteindra-t-elle 50K membres ce trimestre ?",
            vol: "$9k Vol.",
            cat: "Communauté",
            pct: 44,
          },
          {
            type: "single",
            img: "/assets/images/marvel-opening-weekend.png",
            title: "L'IPO locale phare pricera-t-elle au-dessus de sa fourchette ?",
            vol: "$10k Vol.",
            cat: "Custom",
            pct: 41,
          },
          {
            type: "multi",
            img: "/assets/images/elon-usa-election.png",
            title: "Quel scénario macro sur mesure se réalise en premier ?",
            vol: "$13k Vol.",
            cat: "Scénario",
            rows: [
              { label: "Soft landing", pct: 39 },
              { label: "Reflation", pct: 35 },
              { label: "Choc", pct: 26 },
            ],
          },
        ],
      },
    ],
    solution: {
      title: "De l'accord signé à la plateforme live - en jours, pas en trimestres.",
      lead:
        "Smart contracts audités, liquidité mutualisée dès le premier jour, white-label complet - votre équipe valide la marque, nous gérons tout le reste.",
      timelineAriaLabel: "Comment fonctionne Kuest",
      points: [
        {
          title: "Définissez votre périmètre de marché et votre modèle de frais",
          copy:
            "Choisissez les catégories qui comptent pour vos clients - macro, taux, politique, matières premières, crypto, sport. Créez des marchés propriétaires exclusifs à votre plateforme. Définissez vos frais. Nous configurons tout autour de votre marque et de votre périmètre réglementaire.",
        },
        {
          title: "Nous déployons toute la stack technique - sans équipe d'ingénierie interne",
          copy:
            "Smart contracts, moteur CLOB, rails de settlement, infrastructure wallet et liquidité fonctionnent avant la fin de votre onboarding. Les contrats dérivent de l'architecture de Polymarket et ont été audités par OpenZeppelin. Aucun team blockchain interne nécessaire. Aucun sprint infra.",
        },
        {
          title: "Votre plateforme gagne sur chaque trade, automatiquement",
          copy:
            "Chaque transaction de vos clients génère des frais directs pour votre institution - sans intermédiaire, sans revenue share, sans délai. Le même modèle d'infrastructure opère déjà des plateformes qui traitent plus de 18 milliards par mois.",
        },
      ],
      cta: "Nous contacter",
      note: "WHITE-LABEL - CONTRATS AUDITÉS - LIQUIDITÉ INCLUSE",
    },
    proofCards: [
      {
        label: "Volume mensuel",
        value: "$18.3B",
        copyHtml: `Volume mensuel combiné de Kalshi + Polymarket, selon ${sourceLink(THE_BLOCK_HREF, "The Block", "Prediction Market Volume")}.`,
      },
      {
        label: "Hors États-Unis",
        value: "66%",
        copyHtml: `Part du trafic Polymarket venant de l'extérieur des États-Unis, selon ${sourceLink(SIMILARWEB_HREF, "SimilarWeb", "Polymarket traffic share")}.`,
      },
      {
        label: "Signal de valorisation",
        value: "$20B",
        copyHtml: `Valorisation visée actuellement pour Kalshi et Polymarket, via ${sourceLink(COINDESK_HREF, "CoinDesk", "Prediction market valuations")}.`,
      },
    ],
    features: {
      eyebrow: "CE QUI EST DÉJÀ OPÉRATIONNEL",
      title: "Toute la stack de trading. Aucun sprint d'ingénierie requis.",
      subtitle:
        "Tout ce que votre institution devrait construire de zéro est déjà en production, audité et prêt à être déployé sous votre marque.",
      cards: [
        {
          icon: "activity",
          title: "Moteur CLOB + relayer + matching",
          copy:
            "Carnet d'ordres central, infrastructure de relayer et moteur de matching - la même architecture que Polymarket sur Polygon mainnet.",
        },
        {
          icon: "shield-check",
          title: "Contrats audités par OpenZeppelin",
          copy:
            "Smart contracts dérivés de l'architecture auditée de Polymarket, adaptés à la liquidité partagée entre plusieurs frontends opérateurs. Résolution UMA pour un settlement vérifiable.",
        },
        {
          icon: "users",
          title: "Liquidité partagée dès le premier jour",
          copy:
            "Miroitez les marchés actifs de Polymarket avec l'order flow existant. Votre plateforme démarre avec une vraie profondeur - sans cold start ni recrutement initial de market makers.",
        },
        {
          icon: "bot",
          title: "SDKs de bots pour traders institutionnels",
          copy:
            "SDKs Python et Rust compatibles avec les stratégies déjà utilisées sur Polymarket. Les market makers peuvent porter leurs bots sans tout reconstruire.",
        },
        {
          icon: "globe-2",
          title: "Frontend white-label complet",
          copy:
            "Votre domaine, votre marque, votre langue. UI multilingue avec i18n intégré. Catégories d'événements personnalisées. Le produit ressemble à une extension native de votre institution, pas à un déploiement Kuest.",
        },
        {
          icon: "server",
          title: "Infrastructure entièrement gérée",
          copy:
            "Gas, settlement, scalabilité et monitoring sont gérés de notre côté. Pas besoin d'équipe blockchain interne ni d'infrastructure cloud à exploiter. Vous vous concentrez sur la distribution.",
        },
      ],
    },
    preview: {
      title: "Voici le produit avec lequel vos clients vont interagir.",
      subtitle:
        "Une démo pleinement fonctionnelle avec des marchés Polymarket miroirs en direct. Votre déploiement porterait votre domaine, votre marque, vos catégories choisies - et vos frais sur chaque transaction exécutée par vos clients.",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "Qu'est-ce qu'un marché prédictif exactement - et quelle différence avec une plateforme de paris ?",
          aHtml:
            "Un marché prédictif est un carnet d'ordres en direct où les participants achètent et vendent des positions sur l'issue d'événements réels - avec la même mécanique binaire qu'un dérivé financier. À la différence des paris sportifs, la plateforme ne fixe pas les cotes et ne prend pas l'autre côté. Les prix se forment peer-to-peer en temps réel via l'offre et la demande. L'opérateur gagne une commission sur chaque trade, pas sur le gagnant.",
        },
        {
          q: "Qui sont Kalshi et Polymarket - et pourquoi sont-ils pertinents ici ?",
          aHtml:
            "Kalshi est une bourse régulée aux États-Unis, centrée sur les event contracts. Polymarket est un marché prédictif décentralisé sur Polygon. Ensemble, ils ont montré qu'il ne s'agit pas d'une niche, mais d'une nouvelle primitive financière. Ces plateformes sont fermées ; Kuest apporte la même infrastructure dans un modèle ouvert et white-label.",
        },
        {
          q: "Que se passe-t-il aujourd'hui sur le marché pour que ce timing soit si important ?",
          aHtml:
            "Kalshi et Polymarket sont en levées de fonds actives autour de $20B de valorisation chacune. B3 entre sur le segment au Brésil. Kalshi a signé son premier deal institutionnel international avec XP International. La question de l'infrastructure institutionnelle se joue maintenant, et la plupart des marchés locaux n'ont toujours pas d'opérateur.",
        },
        {
          q: "Quels types d'institutions se positionnent déjà sur ce secteur ?",
          aHtml:
            "Courtiers, bourses, groupes média financiers, sociétés d'analyse sportive et desks institutionnels testent déjà les event contracts. La demande existe sur tous les grands marchés, mais très peu d'opérateurs locaux ont construit l'infrastructure.",
        },
        {
          q: "Pouvons-nous créer des marchés exclusifs pour notre plateforme et notre base clients ?",
          aHtml:
            "Oui. Vous pouvez créer des marchés propriétaires sur la macro, la politique, les taux, les matières premières, la crypto ou toute catégorie alignée avec votre institution. Les marchés miroirs de Polymarket sont disponibles dès le premier jour pour une profondeur immédiate.",
        },
        {
          q: "Quelle est l'économie de frais pour l'opérateur ?",
          aHtml:
            "Vous définissez votre propre taux de commission - généralement entre 0,5 % et 3 % par trade. Chaque transaction sur votre plateforme reverse directement cette commission à votre institution. Kuest prélève une petite commission de protocole par-dessus.",
        },
        {
          q: "Que doit concrètement faire notre équipe pour se déployer ?",
          aHtml:
            "Votre équipe fournit les assets de marque, définit le périmètre initial des événements et valide la structure de frais. Kuest prend en charge le déploiement des contrats, la configuration d'infrastructure, l'amorçage de liquidité et le déploiement frontend.",
        },
        {
          q: "Quelle est la base technique et compliance ?",
          aHtml: `Les smart contracts dérivent de l'architecture CLOB de Polymarket et utilisent des rails de résolution UMA. Le code est disponible sous la <a href="${LICENSE_HREF}" target="_blank" rel="noopener">Kuest MIT+Commons license</a>. Des configurations de compliance et contrats d'infrastructure enterprise adaptés sont disponibles - <a href="mailto:hello@kuest.com">contactez-nous</a> pour discuter de votre environnement réglementaire.`,
        },
      ],
    },
    finalCta: {
      title: "Vos clients tradent déjà sur Polymarket. La vraie question est de savoir si cela se passe sur votre propre plateforme.",
      subtitle: "L'infrastructure est prête. L'avantage du first mover sur les marchés prédictifs se referme vite.",
      contactCta: "Nous contacter",
      viewLiveDemoCta: "Voir la démo live",
    },
  },
  zh: {
    meta: {
      title: "Kuest Enterprise",
      description: "面向金融机构、媒体平台和企业级运营方的 white-label 预测市场基础设施。",
      imageAlt: "Kuest Enterprise 预览图",
    },
    hero: {
      kicker: "预测市场 white-label 基础设施",
      titleLine1: "一种新的金融工具",
      titleLine2: "正在形成。",
      titleAccent: "成为那家平台。",
      subtitle:
        "预测市场已经在每月处理数十亿美元成交量，其中 66% 的需求来自美国之外，却没有一家本地运营方承接。Kuest 让金融机构、券商和媒体公司能够上线自己的品牌预测市场：审计过的基础设施、共享流动性，以及每笔交易上的你的手续费。",
      contactCta: "联系我们",
      viewDemoCta: "查看演示",
      proof: "$18B 月成交量 - OpenZeppelin 审计 - 可直接 white-label",
      heroMarketTitles: makeHeroTitles(
        "美联储会在 7 月前降息吗？",
        "下一届美国政府今年会建立战略 BTC 储备吗？",
        "俄乌停火会在年底前宣布吗？",
      ),
    },
    attention: {
      ariaLabel: "预测市场里的机会",
      blockOne: [
        "你的客户已经在 Polymarket 上交易了。",
        "选举。利率。比特币价格。宏观结果。",
        "他们在一家美国平台上做这件事。发生在你的体系之外。手续费也付给了别人。",
        "你没有可见性。没有收入。增长却越来越快。",
      ],
      marketVolume: "Polymarket 和 Kalshi 现在每月合计处理超过 180 亿美元交易量。",
      polymarketAlt: "Polymarket",
      kalshiAlt: "Kalshi",
      outsideUs: "他们 66% 的用户都来自美国之外 - 来自你的市场。",
      withoutLocalOperator: "但还没有任何一家本地机构真正接住这部分需求。",
      xpLead: "巴西最大的券商 XP International 刚刚与 Kalshi 合作，解决的正是这个问题。",
      xpFollowUp: "他们看到交易量正在流出自己的生态，于是决定把基础设施掌握在自己手里。",
      xpPivot: "你不需要等 Kalshi 来联系你。",
    },
    marketToday: {
      eyebrow: "当前市场",
      stats: [
        {
          value: "$18.3B",
          label: "Kalshi + Polymarket 合计月成交量",
          sourceHref: THE_BLOCK_HREF,
          sourceLabel: "来源：The Block，2026 年 Q1",
        },
        {
          value: "200x",
          label: "Kalshi 年交易量增长，2024-2025",
          sourceHref: PYMNTS_HREF,
          sourceLabel: "来源：PYMNTS，2026",
        },
        {
          value: "66%",
          label: "Polymarket 流量来自美国之外",
          sourceHref: SIMILARWEB_HREF,
          sourceLabel: "来源：SimilarWeb，2026 年 2 月",
        },
        {
          value: "$20B",
          label: "当前融资轮的目标估值",
          sourceHref: COINDESK_HREF,
          sourceLabel: "来源：CoinDesk / WSJ",
        },
      ],
    },
    explainer: {
      kicker: "一种新的金融工具 - 已经在大规模真实运行",
      title: "Prediction Market",
      subtitle:
        "你可以把它看成一种针对未来事件的二元衍生品。用户在实时订单簿里用真钱交易结果。正因为真金白银在承担风险，价格往往比民调、分析师预测和专家判断更早更准。最终，成交量和费用都会流向拥有这套平台的人。",
    },
    niches: [
      {
        tag: "加密与资产",
        tagline: "围绕加密资产和数字资产部署你自己的品牌市场。",
        accent: "#f7931a",
        accentRgb: "247,147,26",
        icon: "bitcoin",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "比特币会在 Q4 前收于 $150K 以上吗？",
            vol: "$42k Vol.",
            cat: "Crypto",
            pct: 61,
          },
          {
            type: "single",
            img: "/assets/images/ethereum-flippening.png",
            title: "2026 年以太坊会反超比特币市值吗？",
            vol: "$29k Vol.",
            cat: "Crypto",
            pct: 18,
          },
          {
            type: "multi",
            img: "/assets/images/uniswap-v4-mainnet.png",
            title: "下一季度哪类资产会吸引最多净流入？",
            vol: "$31k Vol.",
            cat: "Assets",
            rows: [
              { label: "BTC", pct: 42 },
              { label: "ETH", pct: 51 },
              { label: "其他", pct: 7 },
            ],
          },
        ],
      },
      {
        tag: "选举与政策",
        tagline: "把政治与政策流量留在你自己的平台里。",
        accent: "#8b5cf6",
        accentRgb: "139,92,246",
        icon: "landmark",
        cards: [
          {
            type: "single",
            img: "/assets/images/brazil-election-2026.png",
            title: "现任执政联盟会继续保持多数席位吗？",
            vol: "$38k Vol.",
            cat: "Politics",
            pct: 47,
          },
          {
            type: "single",
            img: "/assets/images/donald-trump-president.png",
            title: "下一届美国政府会建立战略 BTC 储备吗？",
            vol: "$24k Vol.",
            cat: "Policy",
            pct: 35,
          },
          {
            type: "multi",
            img: "/assets/images/uk-general-election.png",
            title: "下一次英国大选谁会赢？",
            vol: "$19k Vol.",
            cat: "UK",
            rows: [
              { label: "Labour", pct: 58 },
              { label: "Conservative", pct: 28 },
              { label: "其他", pct: 14 },
            ],
          },
        ],
      },
      {
        tag: "宏观与利率",
        tagline: "直接在你自己的平台上为宏观结果定价。",
        accent: "#4f8ef7",
        accentRgb: "79,142,247",
        icon: "trending-up",
        cards: [
          {
            type: "multi",
            img: "/assets/images/fed-rate-move.png",
            title: "下一次美联储决议",
            vol: "$31k Vol.",
            cat: "Rates",
            rows: [
              { label: "降息", pct: 42 },
              { label: "维持", pct: 51 },
              { label: "加息", pct: 7 },
            ],
          },
          {
            type: "single",
            img: "/assets/images/russia-x-ukraine.png",
            title: "停火会在年底前压低全球能源价格吗？",
            vol: "$22k Vol.",
            cat: "Macro",
            pct: 34,
          },
          {
            type: "single",
            img: "/assets/images/elon-500b-net-worth.png",
            title: "实际利率会在 Q1 前跌破 1% 吗？",
            vol: "$15k Vol.",
            cat: "Macro",
            pct: 38,
          },
        ],
      },
      {
        tag: "大宗商品",
        tagline: "把商品波动转化为用户参与和手续费收入。",
        accent: "#f0b429",
        accentRgb: "240,180,41",
        icon: "bar-chart-2",
        cards: [
          {
            type: "single",
            img: "/assets/images/bitcoin-150k.png",
            title: "黄金会在本季度创下新高吗？",
            vol: "$17k Vol.",
            cat: "Gold",
            pct: 56,
          },
          {
            type: "single",
            img: "/assets/images/fed-rate-move.png",
            title: "Brent 会在年底前收于 $100 上方吗？",
            vol: "$12k Vol.",
            cat: "Oil",
            pct: 29,
          },
          {
            type: "multi",
            img: "/assets/images/governance-vote-chain.png",
            title: "下个月哪种大宗商品表现最好？",
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
        tag: "体育",
        tagline: "在你自己的合规表层之下上线体育市场。",
        accent: "#34d07f",
        accentRgb: "52,208,127",
        icon: "trophy",
        cards: [
          {
            type: "multi",
            img: "/assets/images/champions-league-top-scorer.png",
            title: "欧冠决赛最佳射手",
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
            title: "勇士会进季后赛吗？",
            vol: "$11k Vol.",
            cat: "NBA",
            pct: 55,
          },
          {
            type: "single",
            img: "/assets/images/daniel-negranu-wsop.png",
            title: "Daniel Negreanu 会打进 WSOP 决赛桌吗？",
            vol: "$8k Vol.",
            cat: "Poker",
            pct: 38,
          },
        ],
      },
      {
        tag: "自定义市场",
        tagline: "为你自己的受众创建专属事件合约。",
        accent: "#f43f5e",
        accentRgb: "244,63,94",
        icon: "sliders",
        cards: [
          {
            type: "single",
            img: "/assets/images/discord-50k-members.png",
            title: "我们的私域客户社区会在本季度达到 5 万成员吗？",
            vol: "$9k Vol.",
            cat: "Community",
            pct: 44,
          },
          {
            type: "single",
            img: "/assets/images/marvel-opening-weekend.png",
            title: "本地旗舰 IPO 会高于发行区间定价吗？",
            vol: "$10k Vol.",
            cat: "Custom",
            pct: 41,
          },
          {
            type: "multi",
            img: "/assets/images/elon-usa-election.png",
            title: "哪种定制宏观情景会最先发生？",
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
    ],
    solution: {
      title: "从签约到平台上线 - 以天计，而不是以季度计。",
      lead:
        "审计过的智能合约、首日共享流动性、完整 white-label - 你的团队只需要确认品牌，我们负责把其余部分全部跑起来。",
      timelineAriaLabel: "Kuest 如何工作",
      points: [
        {
          title: "定义你的市场范围和费率模型",
          copy:
            "选择你的客户真正关心的事件类别 - 宏观、利率、政治、大宗商品、加密、体育。创建只属于你平台的专属市场。定义你的费率。我们会围绕你的品牌和监管边界完成配置。",
        },
        {
          title: "我们部署完整技术栈 - 不要求你内部有工程团队",
          copy:
            "智能合约、CLOB 引擎、结算轨道、钱包基础设施和流动性都会在你的团队完成 onboarding 之前跑起来。合约源自 Polymarket 的架构，并由 OpenZeppelin 审计。你不需要内部 blockchain 团队，也不需要基础设施冲刺。",
        },
        {
          title: "你的平台会自动从每笔交易中收取费用",
          copy:
            "每一笔客户交易都会直接给你的机构带来收入 - 没有中间商，没有 revenue share，没有结算延迟。这个基础设施模型已经支撑着每月处理超过 180 亿美元的平台。",
        },
      ],
      cta: "联系我们",
      note: "WHITE-LABEL - 审计合约 - 流动性已包含",
    },
    proofCards: [
      {
        label: "月成交量",
        value: "$18.3B",
        copyHtml: `Kalshi + Polymarket 的月成交量合计，来源 ${sourceLink(THE_BLOCK_HREF, "The Block", "Prediction Market Volume")}。`,
      },
      {
        label: "美国之外",
        value: "66%",
        copyHtml: `Polymarket 来自美国之外的流量占比，来源 ${sourceLink(SIMILARWEB_HREF, "SimilarWeb", "Polymarket traffic share")}。`,
      },
      {
        label: "估值信号",
        value: "$20B",
        copyHtml: `Kalshi 与 Polymarket 当前融资谈判中的目标估值，来源 ${sourceLink(COINDESK_HREF, "CoinDesk", "Prediction market valuations")}。`,
      },
    ],
    features: {
      eyebrow: "已经在运行的部分",
      title: "完整交易栈。无需工程冲刺。",
      subtitle: "你的机构原本需要从零开始建设的一切，现在都已经在线、经过审计，并可直接挂上你的品牌。",
      cards: [
        {
          icon: "activity",
          title: "CLOB 引擎 + relayer + matching",
          copy: "中心化限价订单簿、relayer 基础设施和撮合引擎 - 与 Polymarket 相同的架构，运行在 Polygon 主网。",
        },
        {
          icon: "shield-check",
          title: "经 OpenZeppelin 审计的合约",
          copy: "基于 Polymarket 审计架构衍生的智能合约，适配多前端共享流动性。通过 UMA 完成可验证结算。",
        },
        {
          icon: "users",
          title: "首日即有共享流动性",
          copy: "镜像 Polymarket 的活跃市场与现有 order flow。你的平台一上线就有真实深度，无需冷启动，也无需一开始就去招募 market maker。",
        },
        {
          icon: "bot",
          title: "面向机构交易员的 Bot SDK",
          copy: "提供与现有 Polymarket 机器人策略兼容的 Python / Rust SDK。市场做市方无需重写系统就能迁移到你的平台。",
        },
        {
          icon: "globe-2",
          title: "完整 white-label 前端",
          copy: "你的域名、你的品牌、你的语言。自带多语言 i18n。可定制事件分类。看起来就是你机构的原生产品，而不是一个 Kuest 部署。",
        },
        {
          icon: "server",
          title: "完全托管的基础设施",
          copy: "Gas、结算、扩展性和监控全部由我们处理。你不需要内部 blockchain 团队，也不需要自建云基础设施。你只需要负责分发。",
        },
      ],
    },
    preview: {
      title: "这就是你的客户最终会使用的产品。",
      subtitle:
        "这是一个运行中的完整演示，镜像了 Polymarket 的实时市场。你的部署会使用你的域名、你的品牌、你选择的事件类别，以及你在每笔客户交易上收取的费用。",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "预测市场到底是什么？它和博彩平台有什么区别？",
          aHtml:
            "预测市场是一个实时订单簿，参与者围绕真实事件结果买卖头寸 - 本质上使用的是与金融二元衍生品相同的机制。与体育博彩不同，平台并不设赔率、也不站在对手盘。价格由供需实时形成。平台方赚的是每笔交易手续费，而不是输赢差。",
        },
        {
          q: "Kalshi 和 Polymarket 是谁？为什么它们与这里相关？",
          aHtml:
            "Kalshi 是一家美国监管下的 event contracts 交易所。Polymarket 是运行在 Polygon 上的去中心化预测市场。它们共同证明了预测市场不是一个小众玩法，而是一种新的金融基础设施。它们都是封闭平台；Kuest 则以开放的 white-label 模式提供同等级基础设施。",
        },
        {
          q: "现在市场上到底发生了什么，让这个时间点如此关键？",
          aHtml:
            "Kalshi 和 Polymarket 都在进行估值约 $20B 的融资。巴西 B3 正在进入这一品类。Kalshi 已与 XP International 签下首个国际机构合作。机构级基础设施由谁来承接，正是在此刻被决定，而多数本地市场仍没有运营方。",
        },
        {
          q: "哪些类型的机构已经开始进入这个方向？",
          aHtml:
            "券商、交易所、金融媒体、体育数据公司以及机构交易团队都在测试 event contracts。需求在主要市场普遍存在，但本地基础设施几乎还是空白。",
        },
        {
          q: "我们能创建只属于自己平台和客户群的市场吗？",
          aHtml:
            "可以。你可以围绕宏观、政治、利率、大宗商品、加密或任何与你机构定位相关的主题创建专属市场。来自 Polymarket 的镜像市场则可从第一天起提供即时深度。",
        },
        {
          q: "运营方的收费经济模型是什么样的？",
          aHtml:
            "你可以自行设定交易费率 - 通常在每笔交易 0.5% 到 3% 之间。平台上的每笔交易都会把这部分费用直接汇给你的机构。Kuest 只在此之上收取一小部分协议费。",
        },
        {
          q: "我们的团队实际需要做什么才能上线？",
          aHtml:
            "你的团队提供品牌素材，定义最初的事件范围，并确认收费结构。Kuest 负责合约部署、基础设施配置、流动性冷启动以及前端上线。",
        },
        {
          q: "技术与合规基础是什么？",
          aHtml: `智能合约源自 Polymarket 的 CLOB 架构，并使用 UMA 作为结果解析轨道。代码以 <a href="${LICENSE_HREF}" target="_blank" rel="noopener">Kuest MIT+Commons license</a> 开源。我们也提供针对不同监管环境的 enterprise 基础设施与 compliance 配置 - <a href="mailto:hello@kuest.com">联系我们</a> 细聊。`,
        },
      ],
    },
    finalCta: {
      title: "你的客户已经在 Polymarket 上交易。真正的问题是，这件事是否会发生在你的平台上。",
      subtitle: "基础设施已经准备好。预测市场里的先发优势窗口关得很快。",
      contactCta: "联系我们",
      viewLiveDemoCta: "查看在线演示",
    },
  },
};

export function getLandingSolutionFlowTitle(locale: SiteLocale) {
  return LANDING_SOLUTION_FLOW_TITLES[locale];
}

export function getEnterpriseContent(locale: SiteLocale): EnterpriseContent {
  return ENTERPRISE_CONTENT[locale];
}
