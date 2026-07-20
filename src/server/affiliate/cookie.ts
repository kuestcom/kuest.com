const DUB_COOKIE = 'dub_id'

export function readDubClickId(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  for (const part of cookie.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=')
    if (rawName !== DUB_COOKIE) continue
    try {
      const value = decodeURIComponent(rawValue.join('=')).trim()
      return /^[A-Za-z0-9_-]{1,256}$/.test(value) ? value : null
    } catch {
      return null
    }
  }
  return null
}
