import type { MDXComponents } from 'mdx/types'
import type { Route } from 'next'
import type { ReactElement, ReactNode } from 'react'
import type { SupportedLocale } from '@/i18n/locales'
import { cloneElement, isValidElement } from 'react'
import { getPathname } from '@/i18n/navigation'

type MdxContentComponent = (_props: { components?: MDXComponents }) => ReactNode

function isInternalPageHref(href: string): boolean {
  return href.startsWith('/')
    && !href.startsWith('//')
    && !href.startsWith('/api/')
    && !href.startsWith('/_next/')
    && !/\.[a-z0-9]+(?:[?#]|$)/i.test(href)
}

function localizeHref(href: string, locale: SupportedLocale): string {
  if (!isInternalPageHref(href)) {
    return href
  }
  return getPathname({ href: href as Route, locale })
}

function localizeRawAnchors(node: ReactNode, locale: SupportedLocale): ReactNode {
  if (Array.isArray(node)) {
    return node.map(child => localizeRawAnchors(child, locale))
  }

  if (!isValidElement(node)) {
    return node
  }

  const element = node as ReactElement<{ href?: unknown, children?: ReactNode }>
  const children = element.props.children
  const nextChildren = children === undefined
    ? children
    : localizeRawAnchors(children, locale)

  if (element.type === 'a' && typeof element.props.href === 'string') {
    return cloneElement(element, {
      href: localizeHref(element.props.href, locale),
    }, nextChildren)
  }

  if (children !== nextChildren) {
    return cloneElement(element, undefined, nextChildren)
  }

  return element
}

export default function LocalizedMdxContent({
  Content,
  components,
  locale,
}: {
  Content: MdxContentComponent
  components: MDXComponents
  locale: SupportedLocale
}) {
  return localizeRawAnchors(Content({ components }), locale)
}
