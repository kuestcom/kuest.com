'use client'

import type { BlogPostSummary } from '@/lib/blog/content'
import { useCallback, useMemo, useRef, useState } from 'react'
import BlogIndexCard from './BlogIndexCard'
import BlogPagination from './BlogPagination'

interface BlogCardData {
  post: BlogPostSummary
  coverSrc: string
  dateLabel: string
  readingTimeLabel: string
}

export default function BlogIndexPaginated({
  cards,
  perPage,
  readArticleLabel,
  prevLabel,
  nextLabel,
  paginationLabel,
}: {
  cards: BlogCardData[]
  perPage: number
  readArticleLabel: string
  prevLabel: string
  nextLabel: string
  paginationLabel: string
}) {
  const [page, setPage] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.max(1, Math.ceil(cards.length / perPage))

  const { featured, rest } = useMemo(() => {
    const start = (page - 1) * perPage
    const visible = cards.slice(start, start + perPage)
    return {
      featured: page === 1 ? visible[0] : null,
      rest: page === 1 ? visible.slice(1) : visible,
    }
  }, [cards, page, perPage])

  const handlePageChange = useCallback((next: number) => {
    const clamped = Math.max(1, Math.min(next, totalPages))
    setPage(clamped)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [totalPages])

  return (
    <div ref={gridRef} className="blog-card-grid">
      {featured
        ? (
            <BlogIndexCard
              variant="featured"
              post={featured.post}
              coverSrc={featured.coverSrc}
              dateLabel={featured.dateLabel}
              readingTimeLabel={featured.readingTimeLabel}
              readMoreLabel={readArticleLabel}
            />
          )
        : null}

      {rest.length > 0
        ? (
            <div className="blog-card-row">
              {rest.map(c => (
                <BlogIndexCard
                  key={c.post.slug}
                  post={c.post}
                  coverSrc={c.coverSrc}
                  dateLabel={c.dateLabel}
                  readingTimeLabel={c.readingTimeLabel}
                />
              ))}
            </div>
          )
        : null}

      <BlogPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        paginationLabel={paginationLabel}
      />
    </div>
  )
}
