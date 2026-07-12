import type { CSSProperties, ImgHTMLAttributes } from 'react'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string | { src: string }
  fill?: boolean
  priority?: boolean
  unoptimized?: boolean
}

const LOCAL_RASTER_IMAGE = /^\/assets\/images\/.+\.(?:jpe?g|png|webp)$/i
const REMOTE_RASTER_IMAGE = /^https?:\/\/.+\.(?:jpe?g|png|webp)(?:\?.*)?$/i
const GITHUB_AVATAR_IMAGE = /^https:\/\/avatars\.githubusercontent\.com\//i
const IMAGE_DELIVERY_ORIGIN = 'https://wsrv.nl/'
const PRODUCTION_SITE_HOST = 'kuest.com'

function getDeliveredImageSrc(src: string, width?: number, height?: number) {
  if (
    !import.meta.env.PROD ||
    (!LOCAL_RASTER_IMAGE.test(src) &&
      !REMOTE_RASTER_IMAGE.test(src) &&
      !GITHUB_AVATAR_IMAGE.test(src))
  ) {
    return src
  }

  const params = new URLSearchParams()
  params.set('url', LOCAL_RASTER_IMAGE.test(src) ? `${PRODUCTION_SITE_HOST}${src}` : src)
  if (width) params.set('w', String(width))
  if (height) params.set('h', String(height))
  if (width && height) params.set('fit', 'cover')
  params.set('output', 'webp')
  params.set('q', '80')
  params.set('we', '1')
  params.set('default', '1')

  return `${IMAGE_DELIVERY_ORIGIN}?${params.toString()}`
}

export default function Image({
  src,
  fill,
  priority,
  unoptimized,
  style,
  width,
  height,
  ...props
}: ImageProps) {
  const source = typeof src === 'string' ? src : src.src
  const fillStyle: CSSProperties | undefined = fill
    ? {
        position: 'absolute',
        width: '100%',
        height: '100%',
        inset: 0,
        objectFit: 'cover',
        ...style,
      }
    : style

  return (
    <img
      src={
        unoptimized
          ? source
          : getDeliveredImageSrc(source, Number(width) || undefined, Number(height) || undefined)
      }
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={fillStyle}
      loading={priority ? 'eager' : props.loading}
      fetchPriority={priority ? 'high' : props.fetchPriority}
      {...props}
    />
  )
}
