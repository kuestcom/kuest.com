import type { MDXComponents } from 'mdx/types'
import type { ImageProps } from 'next/image'
import type { ComponentPropsWithoutRef } from 'react'
import type { SupportedLocale } from '@/i18n/locales'
import Image from 'next/image'
import Callout from '@/components/blog/blocks/Callout'
import Comparison from '@/components/blog/blocks/Comparison'
import KuestCTA from '@/components/blog/blocks/KuestCTA'
import MarketEmbed from '@/components/blog/blocks/MarketEmbed'
import Stat from '@/components/blog/blocks/Stat'
import TwoColumn from '@/components/blog/blocks/TwoColumn'
import { Link } from '@/i18n/navigation'

function MdxAnchor({
  href,
  children,
  locale,
  ...rest
}: ComponentPropsWithoutRef<'a'> & { locale?: SupportedLocale }) {
  if (typeof href !== 'string') {
    return <a {...rest}>{children}</a>
  }
  const isExternal
    = /^https?:\/\//.test(href)
      || href.startsWith('mailto:')
      || href.startsWith('tel:')
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  if (href.startsWith('/')) {
    // Static assets, API routes, and any URL with a file extension
    // (sitemap.xml, favicon.ico, /assets/foo.png, etc.) must NOT be
    // routed through the locale-aware Link — that would prefix the
    // locale and break the resource. Only locale-bound page paths
    // get the Link treatment so /de posts linking to /blog/foo
    // resolve to /de/blog/foo.
    const isStaticOrApi
      = href.startsWith('//')
        || href.startsWith('/api/')
        || href.startsWith('/_next/')
        || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)
    if (isStaticOrApi) {
      return <a href={href} {...rest}>{children}</a>
    }
    return (
      <Link href={href as never} locale={locale} {...rest}>
        {children}
      </Link>
    )
  }
  return <a href={href} {...rest}>{children}</a>
}

export const mdxComponents: MDXComponents = {
  a: MdxAnchor,
  img: ({ src, alt, width, height }) => {
    const resolvedSrc = typeof src === 'string' ? src : ''
    if (!resolvedSrc) {
      return null
    }
    const w = typeof width === 'number' ? width : 1600
    const h = typeof height === 'number' ? height : 900
    return (
      <figure>
        <Image
          src={resolvedSrc}
          alt={alt ?? ''}
          width={w}
          height={h}
          sizes="(max-width: 768px) 100vw, 800px"
        />
        {alt ? <figcaption>{alt}</figcaption> : null}
      </figure>
    )
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
}

export function createLocalizedMdxComponents(locale: SupportedLocale, components?: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    a: props => <MdxAnchor {...props} locale={locale} />,
    KuestCTA: props => <KuestCTA {...props} locale={locale} />,
    ...components,
  }
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components }
}

export type { ImageProps }
