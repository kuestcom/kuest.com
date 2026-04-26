import type { MetadataRoute } from 'next'
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export interface SitemapHint {
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  priority: number
}

export type DiscoveredRoute = SitemapHint & {
  href: string
  lastModified: Date | undefined
}

const APP_LOCALE_DIR = join(process.cwd(), 'src', 'app', '[locale]')
const PAGE_FILE = /^page\.(?:tsx|ts|jsx|js)$/
const ROUTE_GROUP = /^\(.+\)$/
const DYNAMIC_SEGMENT = /^\[.+\]$/

const DEFAULT_HINT: SitemapHint = {
  changeFrequency: 'monthly',
  priority: 0.5,
}

const ROUTE_HINTS: ReadonlyMap<string, SitemapHint> = new Map([
  ['/', { changeFrequency: 'monthly', priority: 1 }],
  ['/enterprise', { changeFrequency: 'monthly', priority: 0.8 }],
  ['/protocol', { changeFrequency: 'monthly', priority: 0.8 }],
  ['/blog', { changeFrequency: 'weekly', priority: 0.9 }],
  ['/launch', { changeFrequency: 'monthly', priority: 0.7 }],
])

function readLastCommitDate(filePath: string): Date | undefined {
  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', filePath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    if (output) {
      return new Date(output)
    }
  }
  catch {
    // git unavailable or file is untracked — fall through to mtime
  }
  try {
    return statSync(filePath).mtime
  }
  catch {
    return undefined
  }
}

export function discoverStaticRoutes(): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = []

  function walk(dir: string, segments: string[]) {
    const entries = readdirSync(dir, { withFileTypes: true })

    const pageEntry = entries.find(entry => entry.isFile() && PAGE_FILE.test(entry.name))
    if (pageEntry) {
      const href = segments.length === 0 ? '/' : `/${segments.join('/')}`
      routes.push({
        href,
        ...(ROUTE_HINTS.get(href) ?? DEFAULT_HINT),
        lastModified: readLastCommitDate(join(dir, pageEntry.name)),
      })
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }
      if (DYNAMIC_SEGMENT.test(entry.name)) {
        continue
      }
      const nextSegments = ROUTE_GROUP.test(entry.name)
        ? segments
        : [...segments, entry.name]
      walk(join(dir, entry.name), nextSegments)
    }
  }

  walk(APP_LOCALE_DIR, [])
  return routes.toSorted((a, b) => a.href.localeCompare(b.href))
}
