import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getExtracted, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import BlogIndexPaginated from '@/components/blog/BlogIndexPaginated'
import MarketingDockNav from '@/components/MarketingDockNav'
import MarketingPageRuntime from '@/components/MarketingPageRuntime'
import SiteFooter from '@/components/SiteFooter'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { BLOG_POSTS_PER_PAGE, listPosts } from '@/lib/blog/content'
import { getPostCoverSrc } from '@/lib/blog/cover'
import { CONTACT_HREF } from '@/lib/constants'
import { resolveSiteUrl } from '@/lib/site-url'

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const t = await getExtracted()
  const siteOrigin = resolveSiteUrl(process.env)
  const canonical = new URL(getPathname({ href: '/blog', locale }), siteOrigin)
  const ogImage = new URL('/assets/images/your-predictoin-market-500mi-vol.png', siteOrigin)

  return {
    metadataBase: new URL(siteOrigin),
    title: t('Kuest Blog'),
    description: t('Insights, protocol updates, and operator playbooks from the Kuest team.'),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map(entry => [entry, new URL(getPathname({ href: '/blog', locale: entry }), siteOrigin).toString()]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: 'Kuest',
      title: t('Kuest Blog'),
      description: t('Insights, protocol updates, and operator playbooks from the Kuest team.'),
      url: canonical,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary',
      title: t('Kuest Blog'),
      description: t('Insights, protocol updates, and operator playbooks from the Kuest team.'),
      images: [ogImage],
    },
  }
}

export default async function BlogIndexPage({ params }: PageProps<'/[locale]/blog'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const t = await getExtracted()

  const posts = listPosts(locale)
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  const cards = posts.map(post => ({
    post,
    coverSrc: getPostCoverSrc(post),
    dateLabel: dateFormatter.format(post.frontmatter.publishedAt),
    readingTimeLabel: t('{minutes} min read', { minutes: String(post.readingTime) }),
  }))

  return (
    <>
      <MarketingDockNav
        locale={locale}
        active="blog"
        languagePath="/blog"
        ctaHref={CONTACT_HREF}
        ctaLabel={t('Contact us')}
      />

      <main id="page-top" className="page blog-page">
        <header className="blog-section blog-index-hero">
          <div className="slbl">{t('Blog')}</div>
          <h1 className="blog-index-title">{t('Insights from the protocol')}</h1>
          <p className="blog-index-sub">
            {t('Field notes on prediction markets, protocol launches, and what we learn building white-label infrastructure for institutions.')}
          </p>
        </header>

        <section className="blog-section">
          {cards.length === 0
            ? (
                <div className="blog-empty">
                  <div className="slbl">{t('Coming soon')}</div>
                  <p>{t('No posts in this language yet. Check back soon, or read our latest in English.')}</p>
                </div>
              )
            : (
                <BlogIndexPaginated
                  cards={cards}
                  perPage={BLOG_POSTS_PER_PAGE}
                  readArticleLabel={t('Read article')}
                  prevLabel={t('Previous')}
                  nextLabel={t('Next')}
                  paginationLabel={t('Pagination')}
                />
              )}
        </section>
      </main>

      <div id="blog-final">
        <SiteFooter
          note={t('Built on Polymarket-derived contracts, audited by OpenZeppelin')}
          docsLabel={t('Docs')}
          contactLabel={t('Contact')}
          xLabel="X"
          discordLabel="Discord"
        />
      </div>

      <MarketingPageRuntime nextSectionId="page-top" finalSectionId="blog-final" />
    </>
  )
}
