"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { normalizeSiteLocale, type SiteLocale } from "@/i18n/site-config";

const LANDING_STORAGE_KEY = "i18nextLng";
const LAUNCH_STORAGE_KEY = "launchpadLocale";

export function persistLocalePreference(locale: SiteLocale) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LANDING_STORAGE_KEY, locale);
    window.localStorage.setItem(LAUNCH_STORAGE_KEY, locale);
  } catch {
    // localStorage can be unavailable in private mode or restricted contexts
  }
  document.documentElement.lang = locale;
}

export function LocaleSync() {
  const locale = normalizeSiteLocale(useLocale());

  useEffect(() => {
    persistLocalePreference(locale);
  }, [locale]);

  return null;
}
