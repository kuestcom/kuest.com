"use client";

import { useMessages, useLocale } from "next-intl";
import { persistLocalePreference } from "@/i18n/locale-sync";
import { normalizeSiteLocale, type SiteLocale } from "@/i18n/site-config";
import type { LaunchMessages, SiteMessages } from "@/i18n/site";

export type LaunchLocale = SiteLocale;

export interface LaunchLocaleOption {
  code: LaunchLocale;
  label: string;
  flagSrc: string;
}

export const launchLocaleOptions: LaunchLocaleOption[] = [
  { code: "en", label: "English", flagSrc: "/assets/flags/en.svg" },
  { code: "de", label: "Deutsch", flagSrc: "/assets/flags/de.svg" },
  { code: "es", label: "Español", flagSrc: "/assets/flags/es.svg" },
  { code: "pt", label: "Português", flagSrc: "/assets/flags/pt.svg" },
  { code: "fr", label: "Français", flagSrc: "/assets/flags/fr.svg" },
  { code: "zh", label: "中文", flagSrc: "/assets/flags/zh.svg" },
];

interface LaunchI18nValue {
  locale: LaunchLocale;
  setLocale: (locale: LaunchLocale) => void;
  messages: LaunchMessages;
  formatMessage: (template: string, values?: Record<string, string | number>) => string;
}

function formatMessage(template: string, values?: Record<string, string | number>) {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}

function getLaunchMessages(messages: SiteMessages): LaunchMessages {
  if (!messages.launch) {
    throw new Error("Launch messages are missing from the next-intl catalog.");
  }

  return messages.launch;
}

export function useLaunchI18n() {
  const locale = normalizeSiteLocale(useLocale());
  const messages = getLaunchMessages(useMessages() as SiteMessages);

  return {
    locale,
    setLocale: persistLocalePreference,
    messages,
    formatMessage,
  } satisfies LaunchI18nValue;
}
