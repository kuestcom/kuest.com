'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle({
  id,
  className,
  labelToDark,
  labelToLight,
}: {
  id: string
  className: string
  labelToDark: string
  labelToLight: string
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const mode: 'light' | 'dark' = isMounted && resolvedTheme === 'dark' ? 'dark' : 'light'

  const label = mode === 'dark' ? labelToLight : labelToDark

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) {
      return
    }

    // Keep browser UI theme color in sync with the current site theme.
    const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!themeMeta) {
      return
    }

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
    const fallback = mode === 'dark' ? '#CDFF00' : '#0e1117'
    themeMeta.setAttribute('content', accent || fallback)
  }, [isMounted, mode])

  return (
    <button
      type="button"
      id={id}
      className={className}
      data-theme-toggle
      data-label-to-dark={labelToDark}
      data-label-to-light={labelToLight}
      aria-label={label}
      aria-pressed={mode === 'dark'}
      title={label}
      onClick={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
    >
      <span className="dock-theme-toggle-inner" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-icon-light">
          <Sun />
        </span>
        <span className="theme-toggle-icon theme-toggle-icon-dark">
          <Moon />
        </span>
      </span>
    </button>
  )
}
