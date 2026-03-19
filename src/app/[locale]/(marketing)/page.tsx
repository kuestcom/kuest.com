import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  buildEmbedPreviewBootstrapScript,
  buildThemeBootstrapScript,
  getDemoEmbedSrc,
  getDemoHref,
  getDemoLabel,
  getLandingHeroAccent,
  serializeJsonForHtmlScript
} from "@/lib/marketing-content";
import LanguageControl from "@/components/LanguageControl";
import KuestMark from "@/components/KuestMark";
import DockMenuControl from "@/components/DockMenuControl";
import ThemeToggle from "@/components/ThemeToggle";
import {BotIcon, ChevronRightIcon, Globe2Icon, Share2Icon, ShieldCheckIcon, TrophyIcon, FlameIcon} from "lucide-react";
import HeroMarketStage from "@/components/HeroMarketStage";
import Image from "next/image";
import NicheShowcase from "@/components/NicheShowcase";
import RotatingProofCards from "@/components/RotatingProofCards";
import SitePreview from "@/components/SitePreview";
import SiteFooter from "@/components/SiteFooter";
import SourceModal from "@/components/SourceModal";
import MarketingPageRuntime from "@/components/MarketingPageRuntime";
import TimelineSpine from "@/components/TimelineSpine";
import {SUPPORTED_LOCALES, SupportedLocale} from "@/i18n/locales";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {getExtracted} from "next-intl/server";
import {getPathname, Link} from "@/i18n/navigation";
import Script from "next/script";

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getExtracted();
  const siteOrigin = process.env.SITE_URL!;
  const canonical = new URL(getPathname({ href: '/', locale}), siteOrigin);
  const ogImage = new URL("/assets/images/your-predictoin-market-500mi-vol.png", siteOrigin);

  return {
    title: t('Kuest — Create Your Own White-Label Prediction Market'),
    description: t('Create your own white-label prediction market in 15 minutes. Launch under your brand, set your fees, use your domain, and start with shared liquidity from day one.'),
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
      languages: Object.fromEntries(SUPPORTED_LOCALES.map((entry) => [entry, entry === 'en' ? '/' : `/${entry}`])),
    },
    openGraph: {
      type: "website",
      siteName: "Kuest",
      title: t('Kuest — Create Your Own White-Label Prediction Market'),
      description: t('Create your own prediction market in 15 minutes with shared liquidity, custom branding, and your own trading fees.'),
      url: canonical,
      images: [{ url: ogImage, alt: "Kuest prediction market preview" }],
    },
    twitter: {
      card: "summary",
      title: t('Kuest — Create Your Own White-Label Prediction Market'),
      description: t('Create your own prediction market in 15 minutes with shared liquidity, custom branding, and your own trading fees.'),
      images: [ogImage],
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: "#CDFF00",
  }
}

export default async function LandingPage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getExtracted()
  const launchHref = getPathname({ href: "/launch", locale});
  const previewHref = getDemoHref(locale);
  const previewSrc = getDemoEmbedSrc(locale);
  const previewLabel = getDemoLabel(locale);

  const nichesTranslated = [
    {
      "tag": t("Crypto & Finance"),
      "tagline": t("Your own Polymarket for your community."),
      "cards": [
        {
          "title": t("Will Bitcoin trade above $150K before Q3?"),
          "cat": t("Crypto")
        },
        {
          "title": t("Will Ethereum flip Bitcoin's market cap in 2025?"),
          "cat": t("Crypto")
        },
        {
          "title": t("Next Fed rate move"),
          "cat": t("Finance"),
          "rows": [
            t("Cut"),
            t("Hold"),
            t("Hike")
          ]
        }
      ]
    },
    {
      "tag": t("Sports"),
      "tagline": t("Bet on any game. Keep the fees."),
      "cards": [
        {
          "title": t("Top scorer — Champions League final"),
          "cat": t("Sports"),
          "rows": [
            "Mbappé",
            "Vinicius",
            "Bellingham"
          ]
        },
        {
          "title": t("Will the Warriors make the 2025 playoffs?"),
          "cat": "NBA"
        },
        {
          "title": t("Will Daniel Negreanu make the final table of the 2026 WSOP Main Event?"),
          "cat": "Poker"
        }
      ]
    },
    {
      "tag": t("Politics"),
      "tagline": t("Your audience predicts. You get paid."),
      "cards": [
        {
          "title": t("Will Elon Musk win the 2028 U.S. election?"),
          "cat": t("Politics")
        },
        {
          "title": t("Will Russia and Ukraine reach a ceasefire by December 31, 2026?"),
          "cat": t("Geopolitics")
        },
        {
          "title": t("Who wins the UK general election?"),
          "cat": "UK",
          "rows": [
            t("Labour"),
            t("Conservatives"),
            t("Other")
          ]
        }
      ]
    },
    {
      "tag": t("Entertainment"),
      "tagline": t("If they argue about it, they'll trade it."),
      "cards": [
        {
          "title": t("Will the new Marvel film open above $200M?"),
          "cat": t("Film")
        },
        {
          "title": t("Who wins Big Brother Brasil 2025?"),
          "cat": t("Reality TV"),
          "rows": [
            "Beatriz",
            "Davi",
            "Others"
          ]
        },
        {
          "title": t("Will Taylor Swift announce a new album in 2025?"),
          "cat": t("Music")
        }
      ]
    },
    {
      "tag": t("Communities"),
      "tagline": t("Turn your Discord into a prediction market."),
      "cards": [
        {
          "title": t("Will Uniswap v4 launch on mainnet before Q2?"),
          "cat": "DeFi"
        },
        {
          "title": t("Which chain will host the next governance vote?"),
          "cat": "DAO",
          "rows": [
            "Ethereum",
            "Arbitrum",
            "Polygon"
          ]
        },
        {
          "title": t("Will our Discord hit 50K members this month?"),
          "cat": t("Community")
        }
      ]
    },
    {
      "tag": t("Memes & Others"),
      "tagline": t("Imagination is your only limit. If the internet argues about it, it's a market."),
      "cards": [
        {
          "title": t("Will MrBeast surpass T-Series as the #1 YouTube channel by July 2025?"),
          "cat": t("Internet")
        },
        {
          "title": t("Will Elon Musk be worth over $500B before end of 2025?"),
          "cat": t("Billionaires")
        },
        {
          "title": t("Will any U.S. singer with 10M+ followers be arrested by December 2026?"),
          "cat": t("Wildcard")
        }
      ]
    }
  ]

  const niches = LANDING_NICHE_STATIC.map((staticNiche, nicheIndex) => {
    const translated = nichesTranslated[nicheIndex];

    return {
      tag: translated?.tag,
      accent: staticNiche.accent,
      accentRgb: staticNiche.accentRgb,
      tagline: translated?.tagline,
      icon: staticNiche.icon,
      cards: staticNiche.cards.map((staticCard, cardIndex) => {
        const translatedCard = translated?.cards[cardIndex];
        const base = {
          type: staticCard.type,
          img: staticCard.img,
          title: translatedCard?.title  ?? "",
          vol: `${staticCard.volValue} ${t('Vol.')}`,
          cat: translatedCard?.cat ?? "",
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


  const solutionTitleLines = t('A billion-dollar market. Concentrated in two companies. Until now.\nPolymarket and Kalshi dominate — but they are closed. You trade on them. Not with them.')
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  const solutionSubtitleLines = t('Kuest was built to change that.\nIn just a few clicks, you launch your own prediction market site: with your brand, your categories, and your custom markets. We handle the smart contracts, infrastructure, liquidity, and integrations. You focus on your audience — and collect fees from every trade that happens on your site.')
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  const solutionFlowHeading = t('No code. No server. No technical headaches.');
  const socialProofStats = [
    {
      "value": "100+",
      "label": t("markets launched on testnet")
    },
    {
      "value": "0.5–3%",
      "label": t("fee per trade, direct to your wallet")
    },
    {
      "value": "15 min",
      "label": t("average time to go live")
    },
    {
      "value": "Free",
      "label": t("to launch, usage-based at scale")
    }
  ]
  const solutionPoints = [
    {
      "title": t("Pick your niche and write your questions"),
      "copy": t("Sports, crypto, politics, memes — anything your audience already argues about. You set the questions, the fee rate, and your brand.")
    },
    {
      "title": t("Go live — we handle the infrastructure"),
      "copy": t("Settlement, wallets, liquidity, blockchain — all running before you finish setup. Your market is live in under 15 minutes with no code.")
    },
    {
      "title": t("Every trade pays you directly"),
      "copy": t("Your audience bets. The fee goes straight to your wallet. No intermediary, no revenue share, no waiting.")
    }
  ]

  const featureCards = [
    {
      "title": t("Your domain. Your brand. Any language."),
      "copy": t("Custom domain, logo, colors, and UI language. Available in English, Portuguese, Spanish, German, French, and Chinese out of the box.")
    },
    {
      "title": t("Shared liquidity from day one."),
      "copy": t("Mirror active Polymarket markets with built-in order flow. Your site feels live the moment it launches — no cold start, no empty order books.")
    },
    {
      "title": t("Leaderboard + PnL built in."),
      "copy": t("Trader rankings, profit and loss tracking, and activity feeds are live by default. Your community has a reason to keep coming back.")
    },
    {
      "title": t("On-chain affiliate system."),
      "copy": t("Let others promote your market and earn a share of fees — settled trustlessly on-chain. No manual payouts, no spreadsheets.")
    },
    {
      "title": t("Bot SDKs for automated trading."),
      "copy": t("Python and Rust SDKs let market makers and power users run bots directly on your platform — increasing volume and depth automatically.")
    },
    {
      "title": t("OpenZeppelin-audited contracts."),
      "copy": t("Smart contracts derived from Polymarket's architecture. UMA-based resolution for transparent, verifiable market settlement. You don't need to know any of this — it just works.")
    }
  ]

  const faqItems  = [
    {
      q: t('How long does it take, and do I need technical skills?'),
      a: t.rich(
          'Most markets go live in under 15 minutes. You launch from <link>/launch</link> with a guided setup — no code, no contract deployment, no DevOps. If you can set up a Shopify store, you can launch a Kuest market.',
          {
            link: (chunks) => <Link href="/launch">{chunks}</Link>,
          }
      ),
    },
    {
      q: t('Can I show Polymarket markets on my site?'),
      a: t(
          'Yes. You can mirror active markets from Polymarket — either all categories or only the ones relevant to your niche (crypto, sports, politics, etc.). These mirrored markets come with shared liquidity from day one, so your site feels live from the moment it\'s published.'
      ),
    },
    {
      q: t('Can I create my own markets? Who provides the liquidity?'),
      a: t(
          'Yes. You can create custom markets around any question you choose. Mirrored Polymarket markets have shared liquidity built in. Markets you create yourself depend on your audience trading — so your own content and community drive the volume there. You can also opt into cross-market liquidity sharing for creator markets.'
      ),
    },
    {
      q: t('How do I make money, and can I set my own fees?'),
      a: t(
          'You set a trading fee rate on your market — typically between 0.5% and 3%. Every time someone trades, that fee goes directly to your wallet. No revenue share, no intermediary, no waiting. You control the rate and can change it at any time.'
      ),
    },
    {
      q: t('Can I use my own domain and branding?'),
      a: t(
          'Yes. You can launch with your own domain, logo, colors, and category structure so the market feels entirely native to your brand — not a Kuest white-label.'
      ),
    },
    {
      q: t('How are markets resolved?'),
      a: t(
          'Kuest uses UMA-based resolution rails for transparent, verifiable settlement. The smart contracts are derived from Polymarket\'s — audited by OpenZeppelin — and adapted to support shared liquidity across markets. You don\'t need to understand any of this to use it, but it means the financial infrastructure under your market is the same stack that\'s processed billions in volume.'
      ),
    },
    {
      q: t('Is there a cost to launch?'),
      a: t(
          'The launch flow is free to start. Production infrastructure pricing is usage-based — you pay when you scale, not before.'
      ),
    },
    {
      q: t('Can I self-host Kuest?'),
      a: t.rich(
          'The codebase is open source under the <license>Kuest MIT+Commons license</license>. Forks for branding, frontend changes, and custom UX are welcome. Production deployments, however, must use Kuest infrastructure. Running an independent trading stack requires a separate <contact>commercial agreement</contact>.',
          {
            license: (chunks) => (
                <a
                    href="https://github.com/kuestcom/prediction-market/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener"
                >
                  {chunks}
                </a>
            ),
            contact: (chunks) => (
                <a href="mailto:hello@kuest.com">{chunks}</a>
            ),
          }
      ),
    },
  ]

  return (
      <>
        <Script
            id="landing-theme-bootstrap"
            dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }}
        />
        <Script
            id="landing-embed-preview"
            dangerouslySetInnerHTML={{ __html: buildEmbedPreviewBootstrapScript() }}
        />
        <Script
            id="landing-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonForHtmlScript({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Kuest",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                url: new URL(process.env.SITE_URL!).toString(),
                description: t('Create your own white-label prediction market in 15 minutes. Launch under your brand, set your fees, use your domain, and start with shared liquidity from day one.'),
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

        <TimelineSpine count={10} />

        <nav id="heroNav" className="hero-nav">
          <div className="nav-r">
            <LanguageControl
                locale={locale}
                path="/"
                controlId="siteLanguageControl"
                buttonId="siteLanguageButton"
                menuId="siteLanguageMenu"
                flagId="siteLanguageCurrentFlag"
                labelId="siteLanguageCurrentLabel"
                ariaLabel={t('Change site language')}
            />
          </div>
        </nav>

        <nav id="dockNav" className="dock-nav" aria-hidden="true">
          <a href="#page-top" className="nav-logo">
            <KuestMark />
            Kuest
          </a>
          <div className="nav-r">
            <DockMenuControl
                homeHref="/"
                enterpriseHref="/enterprise"
                protocolHref="/protocol"
                active="home"
                openLabel={t('Open site navigation')}
                menuAriaLabel={t('Site navigation')}
                homeLabel={t('Home')}
                enterpriseLabel={t('Enterprise')}
                protocolLabel={t('The Protocol')}
            />
            <LanguageControl
                locale={locale}
                path="/"
                controlId="dockSiteLanguageControl"
                buttonId="dockSiteLanguageButton"
                menuId="dockSiteLanguageMenu"
                flagId="dockSiteLanguageCurrentFlag"
                labelId="dockSiteLanguageCurrentLabel"
                ariaLabel={t('Change site language')}
            />
            <ThemeToggle
                id="dockThemeToggle"
                className="dock-theme-toggle"
                labelToDark={t('Switch to dark mode')}
                labelToLight={t('Switch to light mode')}
            />
            <a href={launchHref} className="nb nb-solid nav-cta">
              <span className="cta-label">{t('Start your prediction market')}</span>
              <ChevronRightIcon />
            </a>
          </div>
        </nav>

        <main id="page-top" className="page">
          <section className="panel-wrap panel-static hero-stack-panel" id="p0">
            <div className="panel-sticky">
              <div className="panel-inner hero-stack">
                <div className="r hero-copy">
                  <div className="hero-copy-main">
                    <div className="hero-brand-row">
                      <div className="hero-brand" aria-hidden="true">
                        <KuestMark />
                        <span>Kuest</span>
                      </div>
                      <div className="hero-brand-controls">
                        <LanguageControl
                            locale={locale}
                            path="/"
                            controlId="heroBrandLanguageControl"
                            buttonId="heroBrandLanguageButton"
                            menuId="heroBrandLanguageMenu"
                            flagId="heroBrandLanguageCurrentFlag"
                            labelId="heroBrandLanguageCurrentLabel"
                            ariaLabel={t('Change site language')}
                        />
                        <ThemeToggle
                            id="heroBrandThemeToggle"
                            className="dock-theme-toggle hero-brand-theme-toggle"
                            labelToDark={t('Switch to dark mode')}
                            labelToLight={t('Switch to light mode')}
                        />
                      </div>
                    </div>
                    <div className="hero-kicker mb-5! gap-3! opacity-100! animate-none!">
                      {t('The Shopify for Prediction Markets')}
                    </div>
                    <h1 className="hero-title font-sans text-[clamp(46px,6.2vw,88px)] font-bold leading-[0.94] tracking-[-0.05em] text-white">
                      <span className="hero-title-line">{t('Your own Polymarket')}</span>
                      <span className="hero-title-line">
                      {renderLandingHeroLine2(locale, t('Live in 15 minutes. Free'))}
                    </span>
                    </h1>
                  </div>
                  <div className="hero-copy-side">
                    <p className="hero-copy-sub text-[clamp(17px,1.75vw,20px)] leading-[1.55] text-muted">
                      {t('Your audience already predicts things every day. Launch your own market for any niche — crypto, sports, politics, anything — and earn a fee on every trade.')}
                    </p>
                    <div className="hero-copy-actions flex flex-wrap gap-3">
                      <a href={launchHref} className="btn-cta btn-cta-primary">
                        <span className="cta-label">{t('Start your prediction market')}</span>
                        <ChevronRightIcon />
                      </a>
                    </div>
                    <div className="hero-copy-proof font-mono text-[11px] uppercase tracking-[.16em] text-faint">
                      {t('Free launch • No code • Live in minutes')}
                    </div>
                  </div>
                </div>
                <HeroMarketStage
                    titles={[
                      t("Will Bitcoin trade above $150K before Q3?"),
                      t("Will the Fed cut rates before July?"),
                      t("Will Uniswap v4 launch on mainnet before Q2?"),
                      t("Will Ethereum outperform Bitcoin this quarter?"),
                      t("Will Elon Musk's net worth exceed $500B this year?"),
                      t("Will Trump announce a U.S. Bitcoin reserve this year?"),
                      t("Will the community reach 50K members before Q4?"),
                      t("Will Brazil elect a market-friendly president in 2026?"),
                      t("Will Donald Trump win the next U.S. election?"),
                      t("Will a Russia-Ukraine ceasefire be announced before year-end?"),
                      t("Will Labour win the next UK general election?"),
                      t("Will the next Marvel film open above $200M?")
                    ]}
                    yesLabel={t('Yes')}
                    noLabel={t('No')}
                />
              </div>
            </div>
          </section>

          <section className="panel-wrap attention-scroll-panel" id="p1-scroll">
            <div className="panel-sticky">
              <div className="panel-inner attention-scroll-shell">
                <div className="attention-scroll-copy" aria-label={t('Attention shifts create windows of opportunity')}>
                  <div className="attention-scroll-block">
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('For years, money followed attention.')}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('Affiliates. Dropshipping. Online courses. Betting.')}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('Each wave opened a window — and closed right after.')}
                    </p>
                    <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                      {t('Did you get in early, or arrive when it was already saturated?')}
                    </p>
                  </div>
                  <div className="attention-scroll-block attention-scroll-block-map">
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('Today, two platforms control a market worth billions.')}
                    </p>
                    <div className="attention-scroll-brand-row" data-attention-step="brands" aria-hidden="true">
                      <div className="attention-scroll-brand">
                        <Image
                            src="/assets/images/polymarket-logo.svg"
                            alt="Polymarket"
                            width={132}
                            height={28}
                            className="attention-scroll-brand-logo"
                        />
                      </div>
                      <div className="attention-scroll-brand">
                        <Image
                            src="/assets/images/kalshi-logo.svg"
                            alt="Kalshi"
                            width={124}
                            height={28}
                            className="attention-scroll-brand-logo"
                        />
                      </div>
                    </div>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('49% of visits still come from just 5 countries.')}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('The rest of the world has barely discovered this.')}
                    </p>
                  </div>
                  <div className="attention-scroll-block">
                    <p
                        className="attention-scroll-line attention-scroll-line-lead"
                        data-attention-step="line"
                    >
                      {t('You can choose:')}
                    </p>
                    <p className="attention-scroll-line" data-attention-step="line">
                      {t('be one more trader trying to call the next prediction —')}
                    </p>
                    <p className="attention-scroll-line attention-scroll-line-pivot" data-attention-step="line">
                      {t('or build the house where everyone else plays.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static panel-compact" id="p-social">
            <div className="panel-sticky">
              <div className="panel-inner max-w-295">
                <div className="r market-numbers market-numbers-4">
                  {socialProofStats.map((stat) => (
                      <article key={`${stat.value}-${stat.label}`} className="mn">
                        <div className="mn-num">{stat.value}</div>
                        <div className="mn-label">{stat.label}</div>
                      </article>
                  ))}
                </div>
                <div className="r flex items-center justify-center gap-3 border-t border-white/6 pt-5! mt-6!">
                  <div className="flex">
                    {EARLY_ACCESS_AVATAR_SRCS.map((src, index) => (
                        <Image
                            key={src}
                            src={src}
                            alt=""
                            width={28}
                            height={28}
                            className="size-7 object-cover rounded-full border-2 border-[#0e1117]"
                            style={{ marginLeft: index === 0 ? 0 : -8 }}
                        />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[.12em] text-faint">
                  {t('Joined by 100+ operators in early access')}
                </span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p2">
            <div className="panel-sticky">
              <div className="panel-inner prediction-explainer">
                <div className="prediction-explainer-copy r">
                  <div className="hero-kicker prediction-explainer-kicker">{t('YOUR AUDIENCE ALREADY DOES THIS — FOR FREE')}</div>
                  <h2 className="prediction-explainer-title">{t('Prediction Market')}</h2>
                  <p className="prediction-explainer-sub">{t('Your followers already predict things every day. Who wins the next election. Whether Bitcoin hits $100k. Who gets eliminated this week. They argue about it in your comments, your DMs, your community — and none of that energy earns you a cent. A prediction market turns that conviction into real trades, with real money. Every trade pays a fee. That fee goes to you.')}</p>
                </div>
                <NicheShowcase niches={niches} yesLabel={t('Yes')} noLabel={t('No')} />
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p3">
            <div className="panel-sticky">
              <div className="panel-inner max-w-295 grid-cols-1 gap-10">
                <div className="solution-split r">
                  <div className="solution-head">
                    <h2 className="sh">{solutionTitleLines[0]}</h2>
                  </div>
                  <div className="solution-body">
                    <div className="solution-copy-lead">
                      <div className="bt">
                        {renderSolutionCopyContent(solutionTitleLines.slice(1), solutionSubtitleLines)}
                      </div>
                    </div>
                    <div className="solution-proof-pane">
                      <RotatingProofCards />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p3-flow">
            <div className="panel-sticky">
              <div className="panel-inner max-w-295 grid-cols-1 gap-10">
                <div className="solution-flow-stage r">
                  <div className="solution-flow-head">
                    <h2 className="sh">{solutionFlowHeading}</h2>
                  </div>
                  <div className="solution-timeline" aria-label={t('How Kuest works')}>
                    <div className="solution-timeline-rail" aria-hidden="true">
                      <span className="solution-timeline-head" />
                    </div>
                    {solutionPoints.map((point, index) => (
                        <article
                            key={point.title}
                            className={`solution-timeline-step ${
                                index % 2 === 0
                                    ? "solution-timeline-step-top solution-timeline-step-right"
                                    : "solution-timeline-step-bottom solution-timeline-step-left"
                            }`}
                        >
                          {index % 2 === 0 ? <div className="solution-timeline-side" aria-hidden="true" /> : null}
                          <div className="solution-timeline-node" aria-hidden="true">
                            <span>{index + 1}</span>
                          </div>
                          <div className="solution-timeline-copy">
                            <h3 className="solution-timeline-title">{point.title}</h3>
                            <p className="solution-timeline-text">{point.copy}</p>
                          </div>
                          {index % 2 === 1 ? <div className="solution-timeline-side" aria-hidden="true" /> : null}
                        </article>
                    ))}
                    <div className="solution-timeline-cta">
                      <div className="solution-cta-block solution-cta-block-inline">
                        <a href={launchHref} className="btn-cta btn-cta-primary" id="solutionCtaBtn">
                          <span className="cta-label">{t('Start earning from my audience')}</span>
                          <ChevronRightIcon />
                        </a>
                        <div className="solution-cta-note" id="solutionCtaNote">
                          {t('FREE · NO CODE · LIVE IN 15 MINUTES')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p-features">
            <div className="panel-sticky">
              <div className="panel-inner max-w-295 grid-cols-1 gap-10">
                <div className="r text-center">
                  <div className="slbl justify-center">{t('Everything already built')}</div>
                  <h2 className="sh">{t('The full stack. Ready to go live.')}</h2>
                  <p className="bt section-copy-center">{t('From the trading engine to your leaderboard, every feature you’d expect from a trading platform is already running. You just add your brand.')}</p>
                </div>
                <div className="r mini-cards-grid mini-cards-grid-feature">
                  {featureCards.map((card, index) => {
                    const Icon = FEATURE_ICONS[index];

                    return (
                        <div key={card.title} className="mini-card mini-card-feature">
                          <div>
                            <div className="mini-card-head">
                              <span className="mini-card-icon">{Icon ? <Icon /> : null}</span>
                              <div className="mini-card-title">{card.title}</div>
                            </div>
                            <div className="mini-card-copy">{card.copy}</div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p3-demo">
            <div className="panel-sticky">
              <div className="panel-inner preview-section site-demo-section grid-cols-1 gap-10">
                <div className="site-demo-copy">
                  <div className="site-demo-copy-inner">
                    <h2 className="sh">{t('This is what your site will look like.')}</h2>
                    <p className="bt">{t('This is a functional demo with mirrored Polymarket markets. Explore it, trade on it, and imagine it with your brand, your audience, and your questions.')}</p>
                  </div>
                </div>
                <div className="r rd hero-preview-wide hero-preview-break">
                  <SitePreview
                      href={previewHref}
                      label={previewLabel}
                      iframeSrc={previewSrc}
                      liveLabel={t('Live Demo')}
                      switchToDesktopLabel={t('Switch to desktop preview')}
                      switchToMobileLabel={t('Switch to mobile preview')}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static panel-compact" id="p-mid-cta">
            <div className="panel-sticky">
              <div className="cta-content r py-10">
                <h2 className="cta-h">{t('Ready to turn your audience into a revenue stream?')}</h2>
                <div className="cta-btns">
                  <a href={launchHref} className="btn-cta btn-cta-primary">
                    <span className="cta-label">{t('Launch my market — it\'s free')}</span>
                    <ChevronRightIcon />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static" id="p8">
            <div className="panel-sticky">
              <div className="panel-inner max-w-295 grid-cols-1 items-start">
                <div className="r faq-layout">
                  <div className="faq-head">
                    <h2 className="sh">FAQ</h2>
                  </div>
                  <div className="faq-list">
                    {faqItems.map((item) => (
                        <details key={item.q} className="faq-item">
                          <summary className="faq-q">{item.q}</summary>
                          <div className="faq-divider" aria-hidden="true" />
                          <div className="faq-panel">
                            <div className="faq-panel-inner">
                              <div className="faq-a">{item.a}</div>
                            </div>
                          </div>
                        </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-wrap panel-static panel-compact marketing-final-section" id="p9">
            <div className="panel-sticky">
              <div className="marketing-final-panel justify-center">
                <div className="cta-content r py-36!">
                  <h2 className="cta-h">{t('Your market, your audience, your rules.')}</h2>
                  <p className="cta-sub">{t('Start free. No credit card required.')}</p>
                  <div className="cta-btns">
                    <a href={launchHref} className="btn-cta btn-cta-primary">
                      <span className="cta-label">{t('Create my prediction market')}</span>
                      <ChevronRightIcon />
                    </a>
                  </div>
                </div>
                <div className="marketing-footer-wrap">
                  <SiteFooter
                      note={t('Built on Polymarket-derived contracts, audited by OpenZeppelin')}
                      docsLabel={t('Docs')}
                      contactLabel={t('Contact')}
                      xLabel="X"
                      discordLabel="Discord"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <SourceModal
            outlet={t('Source')}
            title={t('Source title')}
            loading={t('Loading source...')}
            note={t('If this publisher blocks embeds, use the external link below.')}
            externalLabel={t('Open source in new tab')}
            backLabel={t('Back to page')}
            dynamicNote={'Embedded preview for {{domain}}. If the publisher blocks embeds, use the external link below.'}
        />

        <MarketingPageRuntime nextSectionId="p1-scroll" finalSectionId="p9" />
      </>
  );
}

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
    icon: "flame" as const,
    cards: [
      { type: "single", img: "/assets/images/mrbeast-vs-tseries.png", pct: 67, volValue: "$21k" },
      { type: "single", img: "/assets/images/elon-500b-net-worth.png", pct: 38, volValue: "$15k" },
      { type: "single", img: "/assets/images/pop-star-arrest.png", pct: 12, volValue: "$9k" },
    ],
  },
] as const;

const FEATURE_ICONS = [Globe2Icon, FlameIcon, TrophyIcon, Share2Icon, BotIcon, ShieldCheckIcon] as const;
const EARLY_ACCESS_AVATAR_SRCS = [
  "https://avatars.githubusercontent.com/u/1?v=4",
  "https://avatars.githubusercontent.com/u/2?v=4",
  "https://avatars.githubusercontent.com/u/3?v=4",
  "https://avatars.githubusercontent.com/u/4?v=4",
  "https://avatars.githubusercontent.com/u/5?v=4",
] as const;

function renderLandingHeroLine2(locale: SupportedLocale, value: string) {
  const accentText = getLandingHeroAccent(locale);
  const matchIndex = value.lastIndexOf(accentText);

  if (matchIndex === -1) {
    return value;
  }

  let beforeText = value.slice(0, matchIndex);

  if (/\s$/.test(beforeText)) {
    beforeText = `${beforeText.slice(0, -1)}\u00a0`;
  }

  return (
      <>
        {beforeText}
        <span className="hero-title-accent">{value.slice(matchIndex, matchIndex + accentText.length)}</span>
        {value.slice(matchIndex + accentText.length)}
      </>
  );
}

function renderSolutionCopyContent(titleRest: string[], subtitleLines: string[]) {
  const [calloutLine, ...proseLines] = subtitleLines;

  return (
      <>
        {titleRest.map((line, index) => (
            <span key={`intro-${index}`} className="solution-copy-line">
          {line}
        </span>
        ))}
        {calloutLine ? (
            <span className="solution-copy-callout">
          <span className="solution-copy-callout-mark">
            <KuestMark />
          </span>
          <span>{calloutLine}</span>
        </span>
        ) : null}
        {proseLines.map((line, index) => {
          if (index !== 0) {
            return (
                <span key={`prose-${index}`} className="solution-copy-line">
              {line}
            </span>
            );
          }

          const sentenceBreakMatch = line.match(/^(.+?[.!?]["']?)\s+(.+)$/);

          if (!sentenceBreakMatch) {
            return (
                <span key={`prose-${index}`} className="solution-copy-line">
              {line}
            </span>
            );
          }

          const [, firstSentence, remainingCopy] = sentenceBreakMatch;

          return (
              <span key={`prose-${index}`} className="solution-copy-block">
            <span className="solution-copy-line">{firstSentence.trim()}</span>
            <span className="solution-copy-line">{remainingCopy.trim()}</span>
          </span>
          );
        })}
      </>
  );
}

