import type { MDXComponents } from 'mdx/types'
import type { ImageProps } from 'next/image'
import Image from 'next/image'
import Callout from '@/components/blog/blocks/Callout'
import Comparison from '@/components/blog/blocks/Comparison'
import KuestCTA from '@/components/blog/blocks/KuestCTA'
import MarketEmbed from '@/components/blog/blocks/MarketEmbed'
import Stat from '@/components/blog/blocks/Stat'
import TwoColumn from '@/components/blog/blocks/TwoColumn'
import { Link } from '@/i18n/navigation'

export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...rest }) => {
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
      // Internal link — route through the locale-aware Link so a /de
      // post linking to /blog/foo navigates to /de/blog/foo, not to the
      // default-locale page.
      return (
        <Link href={href as never} {...rest}>
          {children}
        </Link>
      )
    }
    return <a href={href} {...rest}>{children}</a>
  },
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

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components }
}

export type { ImageProps }
