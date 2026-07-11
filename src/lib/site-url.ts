import { PUBLIC_RUNTIME_DEFAULTS } from "@/lib/runtime-config";

const HAS_PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;
const LOCAL_HOST_PATTERN = /^(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i;

export function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const withProtocol = HAS_PROTOCOL_PATTERN.test(trimmed)
      ? trimmed
      : `${LOCAL_HOST_PATTERN.test(trimmed) ? "http" : "https"}://${trimmed}`;
    const url = new URL(withProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return trimmed.replace(/\/+$/, "");
    }

    const normalizedPath = url.pathname.replace(/\/+$/, "");
    return `${url.protocol}//${url.host}${normalizedPath}${url.search}${url.hash}`;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

export function resolveSiteUrl(value = PUBLIC_RUNTIME_DEFAULTS.SITE_URL) {
  return normalizeSiteUrl(value);
}
