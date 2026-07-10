import { ArrowLeftIcon } from 'lucide-react'
import { getExtracted } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function BlogNotFound() {
  const t = await getExtracted()
  return (
    <main className="page blog-page">
      <div className="blog-section blog-not-found">
        <div className="slbl">404</div>
        <h1 className="blog-not-found-title">{t('We couldn’t find that post')}</h1>
        <p className="blog-not-found-sub">
          {t('It may have moved, or it isn’t translated into this language yet.')}
        </p>
        <Link href="/blog" className="blog-not-found-back">
          <ArrowLeftIcon size={14} strokeWidth={2.25} />
          {t('Back to blog')}
        </Link>
      </div>
    </main>
  )
}
