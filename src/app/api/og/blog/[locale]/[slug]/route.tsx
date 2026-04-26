import type { SupportedLocale } from '@/i18n/locales'
import { ImageResponse } from 'next/og'
import { SUPPORTED_LOCALES } from '@/i18n/locales'
import { getPost, listPostStaticParams } from '@/lib/blog/content'

export const dynamic = 'force-static'
export const dynamicParams = false

const WIDTH = 1200
const HEIGHT = 630
const ACCENT = '#CDFF00'
const BG = '#0e1117'
const FG = '#e8eaf0'
const MUTED = '#6b7585'

export async function generateStaticParams() {
  return listPostStaticParams()
}

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export async function GET(_request: Request, ctx: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale: rawLocale, slug } = await ctx.params
  const locale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : 'en'
  const post = getPost(slug, locale) ?? getPost(slug, 'en')

  const title = post?.frontmatter.title ?? 'Kuest'
  const tag = post?.frontmatter.tags[0] ?? 'Insight'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          color: FG,
          padding: 72,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: ACCENT,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: ACCENT,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>Kuest</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '8px 18px',
              borderRadius: 999,
              border: `1px solid ${MUTED}`,
              fontSize: 18,
              letterSpacing: 3,
              color: MUTED,
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.6,
              maxWidth: 1056,
              display: 'flex',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, color: MUTED }}>
            <span>kuest.com/blog</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
