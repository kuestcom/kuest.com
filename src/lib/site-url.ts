export function normalizeSiteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  try {
    const url = new URL(trimmed)
    if (url.pathname === '/' && !url.search && !url.hash) {
      return url.origin
    }
  }
  catch {
    return trimmed.replace(/\/+$/, '')
  }

  return trimmed.replace(/\/+$/, '')
}
