import type { ReactNode } from 'react'
import './globals.css?v=1'

interface Props {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return children
}
