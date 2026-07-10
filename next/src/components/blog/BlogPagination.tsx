'use client'

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

type PageToken = number | 'gap-left' | 'gap-right'

/**
 * Compact list of page tokens centred on the current page.
 *   - When total ≤ 7, return [1..total].
 *   - Otherwise: first, optional left gap, neighbours of current,
 *     optional right gap, last.
 *
 * The gaps are derived from `start`/`end` so that any skipped page
 * always renders an ellipsis — including the boundary case where a
 * single page (e.g. page 2) is hidden between `1` and the neighbour
 * window.
 */
function buildPageList(current: number, total: number): PageToken[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const tokens: PageToken[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) {
    tokens.push('gap-left')
  }
  for (let p = start; p <= end; p++) {
    tokens.push(p)
  }
  if (end < total - 1) {
    tokens.push('gap-right')
  }
  tokens.push(total)
  return tokens
}

export default function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
  prevLabel,
  nextLabel,
  paginationLabel,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (_page: number) => void
  prevLabel: string
  nextLabel: string
  paginationLabel: string
}) {
  if (totalPages <= 1) {
    return null
  }

  const tokens = buildPageList(currentPage, totalPages)
  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <nav className="blog-pagination" aria-label={paginationLabel}>
      <button
        type="button"
        className="blog-pagination-arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={prevDisabled}
        aria-label={prevLabel}
      >
        <ArrowLeftIcon size={14} strokeWidth={2.25} />
      </button>

      {tokens.map((token) => {
        if (token === 'gap-left' || token === 'gap-right') {
          return (
            <span key={token} className="blog-pagination-gap" aria-hidden="true">
              …
            </span>
          )
        }
        if (token === currentPage) {
          return (
            <span key={token} className="blog-pagination-page is-current" aria-current="page">
              {token}
            </span>
          )
        }
        return (
          <button
            key={token}
            type="button"
            className="blog-pagination-page"
            onClick={() => onPageChange(token)}
          >
            {token}
          </button>
        )
      })}

      <button
        type="button"
        className="blog-pagination-arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={nextDisabled}
        aria-label={nextLabel}
      >
        <ArrowRightIcon size={14} strokeWidth={2.25} />
      </button>
    </nav>
  )
}
