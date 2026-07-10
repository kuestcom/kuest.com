import type { ReactNode } from 'react'

export default function TwoColumn({
  left,
  right,
}: {
  left: ReactNode
  right: ReactNode
}) {
  return (
    <div className="blog-two-col">
      <div className="blog-two-col-cell">{left}</div>
      <div className="blog-two-col-cell">{right}</div>
    </div>
  )
}
