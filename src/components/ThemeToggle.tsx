'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

type ThemeMode = 'light' | 'dark'

function updateThemeColor(mode: ThemeMode) {
  const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (!themeMeta) {
    return
  }

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
  const fallback = mode === 'dark' ? '#CDFF00' : '#0e1117'
  themeMeta.setAttribute('content', accent || fallback)
}

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
  const mode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light'

  const label = mode === 'dark' ? labelToLight : labelToDark

  function handleClick() {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    setTheme(nextMode)
    window.requestAnimationFrame(() => updateThemeColor(nextMode))
  }

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
      onClick={handleClick}
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
