import type { ReactNode } from 'react'
import type { SupportedLocale } from './locales'
import { createContext, createElement, Fragment, useContext } from 'react'
import ar from './messages/ar.json'
import de from './messages/de.json'
import en from './messages/en.json'
import es from './messages/es.json'
import fr from './messages/fr.json'
import it from './messages/it.json'
import ja from './messages/ja.json'
import pl from './messages/pl.json'
import pt from './messages/pt.json'
import ru from './messages/ru.json'
import zh from './messages/zh.json'

type Values = Record<string, string | number>
type RichValues = Record<string, string | number | ((chunks: ReactNode) => ReactNode)>
export interface Translator {
  (message: string, values?: Values): string
  rich: (message: string, values: RichValues) => ReactNode
}

const messages = { ar, de, en, es, fr, it, ja, pl, pt, ru, zh } as const
const englishKeyByMessage = new Map(Object.entries(en).map(([key, message]) => [message, key]))

function interpolate(message: string, values?: Values) {
  if (!values) {
    return message
  }
  return message.replace(/\{([^}]+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  )
}

export function createTranslator(locale: SupportedLocale): Translator {
  const localeMessages = messages[locale] as Record<string, string>
  const translate = (message: string, values?: Values) => {
    const key = englishKeyByMessage.get(message)
    return interpolate((key && localeMessages[key]) || message, values)
  }
  translate.rich = (message: string, values: RichValues): ReactNode => {
    const key = englishKeyByMessage.get(message)
    const translated = (key && localeMessages[key]) || message
    const nodes: ReactNode[] = []
    const tagPattern = /<([A-Za-z][\w-]*)>(.*?)<\/\1>/g
    let cursor = 0
    let match: RegExpExecArray | null

    while ((match = tagPattern.exec(translated))) {
      if (match.index > cursor) {
        nodes.push(interpolate(translated.slice(cursor, match.index), values as Values))
      }
      const renderer = values[match[1]]
      const chunks = interpolate(match[2], values as Values)
      nodes.push(typeof renderer === 'function' ? renderer(chunks) : chunks)
      cursor = match.index + match[0].length
    }
    if (cursor < translated.length) {
      nodes.push(interpolate(translated.slice(cursor), values as Values))
    }
    return nodes.length === 1 ? nodes[0] : createElement(Fragment, null, ...nodes)
  }
  return translate
}

interface I18nValue {
  locale: SupportedLocale
  t: Translator
}

const I18nContext = createContext<I18nValue>({
  locale: 'en',
  t: createTranslator('en'),
})

export function I18nProvider({
  locale,
  children,
}: {
  locale: SupportedLocale
  children: ReactNode
}) {
  return (
    <I18nContext.Provider value={{ locale, t: createTranslator(locale) }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useExtracted() {
  return useContext(I18nContext).t
}

export function useLocale() {
  return useContext(I18nContext).locale
}

export function useI18n() {
  return useContext(I18nContext)
}
