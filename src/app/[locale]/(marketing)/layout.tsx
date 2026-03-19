import type { ReactNode } from 'react'
import '@/app/landing-marketing.css'

interface Props {
    children: ReactNode
}

export default function RootLayout({ children }: Props) {
    return children
}
