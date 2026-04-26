const EXTERNAL_PROTOCOL = /^https?:\/\//i

function hasSafeProtocol(value: string): boolean {
  const lowerValue = value.toLowerCase()
  return (
    lowerValue.startsWith('mailto:')
    || lowerValue.startsWith('tel:')
    || EXTERNAL_PROTOCOL.test(value)
  )
}

export function toSafeHref(href: string): string | null {
  const value = href.trim()
  if (!value) {
    return null
  }
  if (value.startsWith('/')) {
    return value.startsWith('//') ? null : value
  }
  if (value.startsWith('#')) {
    return value
  }
  if (hasSafeProtocol(value)) {
    return value
  }
  return null
}

export function toSafeExternalHref(href: string): string | null {
  const safeHref = toSafeHref(href)
  if (!safeHref || !EXTERNAL_PROTOCOL.test(safeHref)) {
    return null
  }
  return safeHref
}
