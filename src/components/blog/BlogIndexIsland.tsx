import type { ComponentProps } from 'react'
import type { SupportedLocale } from '@/i18n/locales'
import { I18nProvider } from '@/i18n'
import BlogIndexPaginated from './BlogIndexPaginated'

export default function BlogIndexIsland({
  locale,
  ...props
}: ComponentProps<typeof BlogIndexPaginated> & { locale: SupportedLocale }) {
  return (
    <I18nProvider locale={locale}>
      <BlogIndexPaginated {...props} />
    </I18nProvider>
  )
}
