import type { CSSProperties, ImgHTMLAttributes } from 'react'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string | { src: string }
  fill?: boolean
  priority?: boolean
  unoptimized?: boolean
}

export default function Image({
  src,
  fill,
  priority,
  unoptimized: _unoptimized,
  style,
  width,
  height,
  ...props
}: ImageProps) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: 'absolute', width: '100%', height: '100%', inset: 0, objectFit: 'cover', ...style }
    : style

  return (
    <img
      src={typeof src === 'string' ? src : src.src}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={fillStyle}
      loading={priority ? 'eager' : props.loading}
      fetchPriority={priority ? 'high' : props.fetchPriority}
      {...props}
    />
  )
}
