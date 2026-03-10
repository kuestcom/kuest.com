"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import de from "@/i18n/launch/locales/de.json";
import en from "@/i18n/launch/locales/en.json";
import es from "@/i18n/launch/locales/es.json";
import fr from "@/i18n/launch/locales/fr.json";
import pt from "@/i18n/launch/locales/pt.json";
import zh from "@/i18n/launch/locales/zh.json";

export type LaunchLocale = "en" | "de" | "es" | "pt" | "fr" | "zh";

export interface LaunchLocaleOption {
  code: LaunchLocale;
  label: string;
}

export const launchLocaleOptions: LaunchLocaleOption[] = [
  { code: "en", label: "🇺🇸 English" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Spanish" },
  { code: "pt", label: "🇧🇷 Português" },
  { code: "fr", label: "🇫🇷 French" },
  { code: "zh", label: "🇨🇳 中文" },
];

const DEFAULT_LOCALE: LaunchLocale = "en";
const LOCAL_STORAGE_KEY = "launchpadLocale";
const LANDING_STORAGE_KEY = "i18nextLng";

const dictionaries = {
  en,
  de,
  es,
  pt,
  fr,
  zh,
} satisfies Record<LaunchLocale, typeof en>;

type LaunchMessages = typeof en;

interface LaunchI18nContextValue {
  locale: LaunchLocale;
  setLocale: (locale: LaunchLocale) => void;
  messages: LaunchMessages;
  formatMessage: (template: string, values?: Record<string, string | number>) => string;
}

const LaunchI18nContext = createContext<LaunchI18nContextValue | null>(null);

function normalizeLocale(input?: string | null): LaunchLocale {
  if (!input) {
    return DEFAULT_LOCALE;
  }

  const normalized = input.toLowerCase().split("-")[0];
  if (normalized === "de" || normalized === "es" || normalized === "pt" || normalized === "fr" || normalized === "zh") {
    return normalized;
  }
  return "en";
}

function resolveInitialLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const params = new URLSearchParams(window.location.search);
  const queryLocale = params.get("lang");
  if (queryLocale) {
    return normalizeLocale(queryLocale);
  }

  const explicitLocale = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (explicitLocale) {
    return normalizeLocale(explicitLocale);
  }

  const landingLocale = window.localStorage.getItem(LANDING_STORAGE_KEY);
  if (landingLocale) {
    return normalizeLocale(landingLocale);
  }

  return normalizeLocale(window.navigator.language);
}

function formatMessage(template: string, values?: Record<string, string | number>) {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}

export function LaunchI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LaunchLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(resolveInitialLocale());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, locale);
    window.localStorage.setItem(LANDING_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LaunchI18nContextValue>(() => {
    return {
      locale,
      setLocale,
      messages: dictionaries[locale] ?? dictionaries.en,
      formatMessage,
    };
  }, [locale]);

  return <LaunchI18nContext.Provider value={value}>{children}</LaunchI18nContext.Provider>;
}

export function useLaunchI18n() {
  const context = useContext(LaunchI18nContext);
  if (!context) {
    throw new Error("useLaunchI18n must be used within LaunchI18nProvider.");
  }
  return context;
}
