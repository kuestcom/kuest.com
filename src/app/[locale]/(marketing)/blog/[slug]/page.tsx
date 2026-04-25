import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getExtracted, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import BlogPostFooter from '@/components/blog/BlogPostFooter'
import BlogPostHero from '@/components/blog/BlogPostHero'
import MarketingDockNav from '@/components/MarketingDockNav'
import MarketingPageRuntime from '@/components/MarketingPageRuntime'
import SiteFooter from '@/components/SiteFooter'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getPost, listPosts, listPostStaticParams } from '@/lib/blog/content'
import { getPostCoverSrc } from '@/lib/blog/cover'
import { CONTACT_HREF } from '@/lib/constants'
import { resolveSiteUrl } from '@/lib/site-url'

export const dynamicParams = false

export async function generateStaticParams() {
  return listPostStaticParams()
}

export async function generateMetadata({ params }: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const post = getPost(slug, locale)
  if (!post) {
    return { title: 'Not found', robots: { index: false, follow: false } }
  }

  const siteOrigin = resolveSiteUrl(process.env)
  const canonical = new URL(getPathname({ href: `/blog/${slug}`, locale }), siteOrigin)
  const ogImage = new URL(getPostCoverSrc(post), siteOrigin)

  const languages = Object.fromEntries(
    post.availableLocales.map(l => [
      l,
      new URL(getPathname({ href: `/blog/${slug}`, locale: l }), siteOrigin).toString(),
    ]),
  )

  return {
    metadataBase: new URL(siteOrigin),
    title: `${post.frontmatter.title} | Kuest`,
    description: post.frontmatter.description,
    authors: [{ name: post.frontmatter.author.name, url: post.frontmatter.author.url }],
    alternates: {
      canonical,
      languages: { ...languages, 'x-default': languages.en ?? canonical.toString() },
    },
    openGraph: {
      type: 'article',
      siteName: 'Kuest',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url: canonical,
      publishedTime: post.frontmatter.publishedAt.toISOString(),
      modifiedTime: post.frontmatter.updatedAt?.toISOString(),
      authors: [post.frontmatter.author.name],
      tags: post.frontmatter.tags,
      images: [{ url: ogImage, alt: post.frontmatter.title }],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const post = getPost(slug, locale)
  if (!post) {
    notFound()
  }

  const t = await getExtracted()
  const siteOrigin = resolveSiteUrl(process.env)
  const coverSrc = getPostCoverSrc(post)
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })

  const { default: PostContent } = await import(`@content/blog/${locale}/${slug}.mdx`)

  const related = listPosts(locale).filter(p => p.slug !== post.slug).slice(0, 2)
  const relatedDateLabels = Object.fromEntries(
    related.map(p => [p.slug, dateFormatter.format(p.frontmatter.publishedAt)]),
  )

  const postUrl = new URL(getPathname({ href: `/blog/${slug}`, locale }), siteOrigin).toString()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.frontmatter.title,
    'description': post.frontmatter.description,
    'image': new URL(coverSrc, siteOrigin).toString(),
    'datePublished': post.frontmatter.publishedAt.toISOString(),
    'dateModified': (post.frontmatter.updatedAt ?? post.frontmatter.publishedAt).toISOString(),
    'inLanguage': locale,
    'author': {
      '@type': 'Person',
      'name': post.frontmatter.author.name,
      ...(post.frontmatter.author.url ? { url: post.frontmatter.author.url } : {}),
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Kuest',
      'url': siteOrigin,
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    'keywords': post.frontmatter.tags.join(', '),
    'isAccessibleForFree': true,
  }
  const safeJsonLd = JSON
    .stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return (
    <>
      <Script
        id={`blog-jsonld-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />

      <MarketingDockNav
        locale={locale}
        active="blog"
        languagePath={`/blog/${slug}`}
        availableLocales={post.availableLocales}
        languageFallbackPath="/blog"
        ctaHref={CONTACT_HREF}
        ctaLabel={t('Contact us')}
      />

      <main id="page-top" className="page blog-page blog-post-page">
        <BlogPostHero
          post={post}
          coverSrc={coverSrc}
          dateLabel={dateFormatter.format(post.frontmatter.publishedAt)}
          readingTimeLabel={t('{minutes} min read', { minutes: String(post.readingTime) })}
          backLabel={t('Back to blog')}
        />

        <article className="blog-prose blog-post-article">
          <PostContent />
        </article>

        <BlogPostFooter
          related={related}
          backLabel={t('Back to blog')}
          relatedLabel={t('More from the blog')}
          relatedDateLabels={relatedDateLabels}
        />
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
