import readingTime from 'reading-time'

export function computeReadingTime(source: string): number {
  return Math.max(1, Math.round(readingTime(source).minutes))
}
