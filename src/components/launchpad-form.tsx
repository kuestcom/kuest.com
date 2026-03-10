"use client";

import { useWalletInfo } from "@reown/appkit/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CircleIcon,
  InfoIcon,
  Loader2Icon,
  RocketIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useDisconnect, useSignTypedData, useSwitchChain } from "wagmi";
import { useAppKit } from "@/hooks/use-app-kit";
import {
  ensureRequiredNetworkViaProvider,
  generateKuestKeysViaWallet,
  mintKuestKeysFromSignature,
  readInjectedProvider,
  REQUIRED_CHAIN_ID,
  REQUIRED_CHAIN_LABEL,
} from "@/lib/kuest-keygen";
import { createSupabaseClient } from "@/lib/supabase";
import type {
  LaunchLogEntry,
  LaunchResponseBody,
  OAuthStatusResponse,
  VercelDomainResponse,
} from "@/lib/launch-types";

interface FormState {
  vercelAccessToken: string;
  brandName: string;
  projectSlugOverride: string;
  gitRepo: string;
  gitBranch: string;
  vercelTeamId: string;
  supabaseRegion: string;
  supabaseResourceId: string;
  keyNonce: string;
  contactEmail: string;
  env: {
    KUEST_ADDRESS: string;
    KUEST_API_KEY: string;
    KUEST_API_SECRET: string;
    KUEST_PASSPHRASE: string;
    ADMIN_WALLETS: string;
    REOWN_APPKIT_PROJECT_ID: string;
    BETTER_AUTH_SECRET: string;
    CRON_SECRET: string;
    SITE_URL: string;
  };
  extraEnvText: string;
}

interface SupabaseResourceOption {
  id: string;
  name: string;
}

interface SupabaseResourcesResponse {
  resources?: SupabaseResourceOption[];
  resolvedTeamId?: string;
  error?: string;
}

interface VercelDomainApiResponse {
  domain?: VercelDomainResponse;
  error?: string;
}

type TimelineStatus = "idle" | "running" | "done" | "error";

interface TimelineEntry {
  id: string;
  label: string;
  status: TimelineStatus;
}

interface ActionPromptProps {
  open: boolean;
  title: string;
  description: string;
  showConnectedWalletIcon?: boolean;
  allowClose?: boolean;
  onClose?: () => void;
}

interface ActionPromptWalletIconProps {
  className?: string;
  rounded?: boolean;
  fit?: "cover" | "contain";
}

type VercelAuthMethod = "oauth" | "token";

const SUPABASE_CREATE_NEW_OPTION = "__create_new__";
const FORM_SESSION_STORAGE_KEY = "launchpad_form_state_v4";
const LEGACY_FORM_SESSION_STORAGE_KEY = "launchpad_form_state_v3";
const DEFAULT_VERCEL_AUTH_METHOD: VercelAuthMethod =
  process.env.NEXT_PUBLIC_VERCEL_AUTH_MODE?.trim().toLowerCase() === "token" ? "token" : "oauth";
const ALLOW_VERCEL_TOKEN_FALLBACK =
  process.env.NEXT_PUBLIC_VERCEL_ALLOW_TOKEN_FALLBACK !== "false";
const FOOTER_BRAND_NAME = "Kuest";

const BASE_TIMELINE: Array<{ id: string; label: string }> = [
  { id: "validation", label: "Validate launch settings" },
  { id: "vercel", label: "Prepare or reuse Vercel project" },
  { id: "database", label: "Attach Supabase database" },
  { id: "deploy", label: "Trigger deployment" },
];

const DEFAULT_FORM: FormState = {
  vercelAccessToken: "",
  brandName: "",
  projectSlugOverride: "",
  gitRepo: process.env.NEXT_PUBLIC_DEFAULT_GIT_REPO ?? "kuestcom/prediction-market",
  gitBranch: "main",
  vercelTeamId: process.env.NEXT_PUBLIC_DEFAULT_VERCEL_TEAM_ID ?? "",
  supabaseRegion: process.env.NEXT_PUBLIC_DEFAULT_SUPABASE_REGION ?? "us-east-1",
  supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
  keyNonce: "0",
  contactEmail: "",
  env: {
    KUEST_ADDRESS: "",
    KUEST_API_KEY: "",
    KUEST_API_SECRET: "",
    KUEST_PASSPHRASE: "",
    ADMIN_WALLETS: "",
    REOWN_APPKIT_PROJECT_ID: "",
    BETTER_AUTH_SECRET: "",
    CRON_SECRET: "",
    SITE_URL: "",
  },
  extraEnvText: "",
};

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return (slug || "kuest-market").slice(0, 96);
}

function randomString(length: number) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_!@#%*";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

function parseExtraEnv(extraEnvText: string) {
  const env: Record<string, string> = {};
  const lines = extraEnvText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));

  for (const line of lines) {
    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) {
      env[key] = value;
    }
  }

  return env;
}

function toPersistableFormState(form: FormState) {
  return {
    brandName: form.brandName,
    projectSlugOverride: form.projectSlugOverride,
    gitRepo: form.gitRepo,
    gitBranch: form.gitBranch,
    vercelTeamId: form.vercelTeamId,
    supabaseRegion: form.supabaseRegion,
    supabaseResourceId: form.supabaseResourceId,
    keyNonce: form.keyNonce,
    env: {
      REOWN_APPKIT_PROJECT_ID: form.env.REOWN_APPKIT_PROJECT_ID,
      SITE_URL: form.env.SITE_URL,
    },
  };
}

function shortAddress(address?: string) {
  if (!address) {
    return "";
  }
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function maskToken(value: string) {
  const token = value.trim();
  if (!token) {
    return "";
  }
  if (token.length <= 10) {
    return "••••••••";
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

function mapTimeline(status: TimelineStatus, index: number, runningIndex: number) {
  if (status === "error") {
    return status;
  }
  if (status === "done") {
    return status;
  }
  if (index < runningIndex) {
    return "done";
  }
  if (index === runningIndex) {
    return "running";
  }
  return "idle";
}

function LogList({ logs }: { logs: LaunchLogEntry[] }) {
  return (
    <ul className="space-y-2">
      {logs.map((entry, index) => (
        <li
          key={`${entry.at}-${entry.step}-${index}`}
          className="rounded-lg border border-border/70 p-3"
        >
          <div className="text-xs text-muted-foreground">{new Date(entry.at).toLocaleString()}</div>
          <div className="text-sm font-semibold text-foreground">
            [{entry.step}] {" "}
            <span
              className={
                entry.level === "error"
                  ? "text-destructive"
                  : entry.level === "warning"
                    ? "text-primary/90"
                    : "text-primary"
              }
            >
              {entry.level.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{entry.message}</div>
        </li>
      ))}
    </ul>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="launch-info-tip">
      <button
        type="button"
        className="launch-info-tip-button"
        aria-label="More info"
      >
        <InfoIcon className="size-3.5" />
      </button>
      <span className="launch-info-tip-bubble">{text}</span>
    </span>
  );
}

function ActionPrompt({
  open,
  title,
  description,
  showConnectedWalletIcon = false,
  allowClose = false,
  onClose,
}: ActionPromptProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/85 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-2xl border border-border/70 bg-background p-6 text-center shadow-2xl">
        {allowClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-md border border-border p-2 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            aria-label="Close waiting modal"
          >
            <XIcon className="size-4" />
          </button>
        )}

        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-5 flex justify-center">
          <div className="relative size-36 overflow-hidden rounded-[30px] bg-background text-primary">
            <div className="pointer-events-none absolute inset-0 animate-[spin_1500ms_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_288deg,currentColor_320deg,currentColor_350deg,transparent_360deg)]" />
            <div className="absolute inset-[3px] rounded-[26px] bg-background" />
            <div className="relative flex size-full items-center justify-center">
              <div className="flex size-[88%] items-center justify-center">
                {showConnectedWalletIcon ? (
                  <ActionPromptWalletIcon />
                ) : (
                  <WalletIcon className="size-16 text-primary" strokeWidth={1.7} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Loader2Icon className="size-4 animate-spin text-primary" />
          <span>Waiting for wallet approval...</span>
        </div>
      </div>
    </div>
  );
}

function ActionPromptWalletIcon({
  className = "size-16",
  rounded = true,
  fit = "cover",
}: ActionPromptWalletIconProps) {
  const { walletInfo } = useWalletInfo();
  const [failedIconUrl, setFailedIconUrl] = useState<string | null>(null);
  const walletName = typeof walletInfo?.name === "string" ? walletInfo.name : undefined;
  const walletIconUrl = typeof walletInfo?.icon === "string" ? walletInfo.icon.trim() : "";

  if (!walletIconUrl || failedIconUrl === walletIconUrl) {
    return <WalletIcon className={`${className} text-primary`} strokeWidth={1.7} />;
  }

  return (
    <Image
      key={walletIconUrl}
      src={walletIconUrl}
      alt={walletName ? `${walletName} wallet icon` : "Connected wallet icon"}
      width={64}
      height={64}
      unoptimized
      className={`${className} ${rounded ? "rounded-2xl" : ""} ${
        fit === "contain" ? "object-contain" : "object-cover"
      }`}
      onError={() => setFailedIconUrl(walletIconUrl)}
    />
  );
}

function StepFooterBrand() {
  return (
    <span className="launch-footer-brand" aria-hidden="true">
      <span className="launch-footer-brand-logo" />
      <span className="launch-footer-brand-text">{FOOTER_BRAND_NAME}</span>
    </span>
  );
}

export default function LaunchpadForm() {
  const account = useAccount();
  const { disconnect, status: disconnectStatus } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();
  const { open: openAppKit, isReady: isAppKitReady, error: appKitError } = useAppKit();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [step1AdvancedOpen, setStep1AdvancedOpen] = useState(false);
  const [step2AdvancedOpen, setStep2AdvancedOpen] = useState(false);
  const [isVercelTokenInputFocused, setIsVercelTokenInputFocused] = useState(false);
  const [vercelAuthMethod, setVercelAuthMethod] = useState<VercelAuthMethod>(
    DEFAULT_VERCEL_AUTH_METHOD,
  );
  const [oauthStatus, setOAuthStatus] = useState<OAuthStatusResponse | null>(null);
  const [oauthStatusLoading, setOAuthStatusLoading] = useState(false);
  const [oauthStatusError, setOAuthStatusError] = useState<string | null>(null);

  const [walletActionLoading, setWalletActionLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [connectPromptOpen, setConnectPromptOpen] = useState(false);
  const [signPromptOpen, setSignPromptOpen] = useState(false);
  const [autoSignAfterConnect, setAutoSignAfterConnect] = useState(false);

  const [supabaseResources, setSupabaseResources] = useState<SupabaseResourceOption[]>([]);
  const [isLoadingSupabaseResources, setIsLoadingSupabaseResources] = useState(false);
  const [supabaseResourcesError, setSupabaseResourcesError] = useState<string | null>(null);

  const [isLaunching, setIsLaunching] = useState(false);
  const [result, setResult] = useState<LaunchResponseBody | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState("");
  const [domainActionLoading, setDomainActionLoading] = useState<"add" | "verify" | null>(null);
  const [domainActionError, setDomainActionError] = useState<string | null>(null);
  const [domainState, setDomainState] = useState<VercelDomainResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(
    BASE_TIMELINE.map((step) => ({ ...step, status: "idle" })),
  );

  const timelineIntervalRef = useRef<number | null>(null);
  const timelineIndexRef = useRef(0);
  const handleConnectOrSignRef = useRef<
    ((options?: { autoProgress?: boolean }) => Promise<void>) | null
  >(null);

  const isConnected = account.status === "connected" && Boolean(account.address);
  const onRequiredChain =
    isConnected && account.chainId !== undefined ? account.chainId === REQUIRED_CHAIN_ID : false;

  const step1Complete =
    Boolean(form.env.KUEST_ADDRESS) &&
    Boolean(form.env.KUEST_API_KEY) &&
    Boolean(form.env.KUEST_API_SECRET) &&
    Boolean(form.env.KUEST_PASSPHRASE);
  const vercelOauthConnected = Boolean(oauthStatus?.vercel.connected);
  const vercelOauthIdentity =
    oauthStatus?.vercel.email || oauthStatus?.vercel.login || oauthStatus?.vercel.name || "";

  const resolvedProjectSlug = useMemo(() => {
    if (form.projectSlugOverride.trim()) {
      return slugify(form.projectSlugOverride);
    }
    return slugify(form.brandName);
  }, [form.projectSlugOverride, form.brandName]);

  const computedSiteUrl = useMemo(() => {
    if (form.env.SITE_URL.trim()) {
      return form.env.SITE_URL.trim();
    }
    return `https://${resolvedProjectSlug}.vercel.app`;
  }, [resolvedProjectSlug, form.env.SITE_URL]);

  useEffect(() => {
    return () => {
      if (timelineIntervalRef.current) {
        window.clearInterval(timelineIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const raw =
        window.sessionStorage.getItem(FORM_SESSION_STORAGE_KEY) ||
        window.sessionStorage.getItem(LEGACY_FORM_SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(LEGACY_FORM_SESSION_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<FormState>;
      if (!parsed || typeof parsed !== "object") {
        return;
      }

      setForm((previous) => ({
        ...previous,
        brandName: typeof parsed.brandName === "string" ? parsed.brandName : previous.brandName,
        projectSlugOverride:
          typeof parsed.projectSlugOverride === "string"
            ? parsed.projectSlugOverride
            : previous.projectSlugOverride,
        gitRepo: typeof parsed.gitRepo === "string" ? parsed.gitRepo : previous.gitRepo,
        gitBranch: typeof parsed.gitBranch === "string" ? parsed.gitBranch : previous.gitBranch,
        vercelTeamId:
          typeof parsed.vercelTeamId === "string" ? parsed.vercelTeamId : previous.vercelTeamId,
        supabaseRegion:
          typeof parsed.supabaseRegion === "string"
            ? parsed.supabaseRegion
            : previous.supabaseRegion,
        supabaseResourceId:
          typeof parsed.supabaseResourceId === "string"
            ? parsed.supabaseResourceId
            : previous.supabaseResourceId,
        keyNonce: typeof parsed.keyNonce === "string" ? parsed.keyNonce : previous.keyNonce,
        env: {
          ...previous.env,
          REOWN_APPKIT_PROJECT_ID:
            parsed.env &&
            typeof parsed.env === "object" &&
            typeof parsed.env.REOWN_APPKIT_PROJECT_ID === "string"
              ? parsed.env.REOWN_APPKIT_PROJECT_ID
              : previous.env.REOWN_APPKIT_PROJECT_ID,
          SITE_URL:
            parsed.env &&
            typeof parsed.env === "object" &&
            typeof parsed.env.SITE_URL === "string"
              ? parsed.env.SITE_URL
              : previous.env.SITE_URL,
        },
      }));
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    try {
      const persistable = toPersistableFormState(form);
      window.sessionStorage.setItem(FORM_SESSION_STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      // ignore storage errors
    }
  }, [form]);

  useEffect(() => {
    if (isConnected) {
      setConnectPromptOpen(false);
    }
  }, [isConnected]);

  const refreshOAuthStatus = useCallback(async () => {
    setOAuthStatusLoading(true);
    try {
      const response = await fetch("/api/oauth/status", {
        cache: "no-store",
      });
      const json = (await response.json()) as OAuthStatusResponse;
      setOAuthStatus(json);
      if (response.ok) {
        setOAuthStatusError(null);
      }
    } catch (error) {
      setOAuthStatusError(
        error instanceof Error ? error.message : "Unable to check OAuth connection status.",
      );
    } finally {
      setOAuthStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOAuthStatus();
  }, [refreshOAuthStatus]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const oauthResult = url.searchParams.get("oauth");
    const oauthError = url.searchParams.get("oauth_error");

    if (!oauthResult && !oauthError) {
      return;
    }

    if (oauthResult === "vercel_connected") {
      setVercelAuthMethod("oauth");
      setOAuthStatusError(null);
      void refreshOAuthStatus();
    }

    if (oauthError) {
      setOAuthStatusError(oauthError);
    }

    url.searchParams.delete("oauth");
    url.searchParams.delete("oauth_error");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [refreshOAuthStatus]);

  const disconnectVercelOAuth = useCallback(async () => {
    setOAuthStatusError(null);
    try {
      await fetch("/api/oauth/vercel/disconnect", {
        method: "POST",
      });
      setSupabaseResources([]);
      setForm((previous) => ({
        ...previous,
        supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
      }));
      await refreshOAuthStatus();
    } catch (error) {
      setOAuthStatusError(
        error instanceof Error ? error.message : "Failed to disconnect Vercel OAuth.",
      );
    }
  }, [refreshOAuthStatus]);

  function startVercelOAuth() {
    setOAuthStatusError(null);
    if (typeof window === "undefined") {
      return;
    }
    const returnTo = encodeURIComponent("/launch");
    window.location.assign(`/api/oauth/vercel/start?return_to=${returnTo}`);
  }

  function switchVercelAuthMethod(nextMethod: VercelAuthMethod) {
    setVercelAuthMethod(nextMethod);
    setIsVercelTokenInputFocused(false);
    setSupabaseResources([]);
    setForm((previous) => ({
      ...previous,
      supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
    }));
  }

  const loadSupabaseResources = useCallback(
    async (options?: { silentIfNoToken?: boolean }) => {
      const token = vercelAuthMethod === "token" ? form.vercelAccessToken.trim() : "";
      const requiresToken = vercelAuthMethod === "token";
      const requiresOAuth = vercelAuthMethod === "oauth";

      if (requiresToken && !token) {
        setSupabaseResources([]);
        setForm((previous) => ({
          ...previous,
          supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
        }));
        if (!options?.silentIfNoToken) {
          setSupabaseResourcesError("Paste your Vercel Access Token first.");
        } else {
          setSupabaseResourcesError(null);
        }
        return;
      }
      if (requiresOAuth && !vercelOauthConnected) {
        setSupabaseResources([]);
        setForm((previous) => ({
          ...previous,
          supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
        }));
        if (!options?.silentIfNoToken) {
          setSupabaseResourcesError("Connect Vercel OAuth first.");
        } else {
          setSupabaseResourcesError(null);
        }
        return;
      }

      setIsLoadingSupabaseResources(true);
      setSupabaseResourcesError(null);

      try {
        const response = await fetch("/api/vercel/supabase-resources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token || undefined,
            teamId: form.vercelTeamId.trim() || undefined,
          }),
        });

        const json = (await response.json()) as SupabaseResourcesResponse;
        const resources = Array.isArray(json.resources) ? json.resources : [];
        setSupabaseResources(resources);
        setForm((previous) => ({
          ...previous,
          supabaseResourceId:
            previous.supabaseResourceId !== SUPABASE_CREATE_NEW_OPTION &&
            resources.some((resource) => resource.id === previous.supabaseResourceId)
              ? previous.supabaseResourceId
              : SUPABASE_CREATE_NEW_OPTION,
        }));

        if (!response.ok) {
          setSupabaseResourcesError(json.error ?? "Failed to list Supabase databases.");
        } else if (!resources.length) {
          setSupabaseResourcesError("No existing database found. You can still create a new one.");
        } else {
          setSupabaseResourcesError(null);
        }
      } catch (error) {
        setSupabaseResources([]);
        setSupabaseResourcesError(
          error instanceof Error ? error.message : "Failed to list Supabase databases.",
        );
      } finally {
        setIsLoadingSupabaseResources(false);
      }
    },
    [form.vercelAccessToken, form.vercelTeamId, vercelAuthMethod, vercelOauthConnected],
  );

  useEffect(() => {
    const tokenReady = Boolean(form.vercelAccessToken.trim()) && !isVercelTokenInputFocused;
    const hasAuth =
      vercelAuthMethod === "oauth" ? vercelOauthConnected : tokenReady;

    if (!hasAuth) {
      setSupabaseResources([]);
      setSupabaseResourcesError(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadSupabaseResources({ silentIfNoToken: true });
    }, 650);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    form.vercelAccessToken,
    isVercelTokenInputFocused,
    vercelAuthMethod,
    vercelOauthConnected,
    loadSupabaseResources,
  ]);

  function mergeAdminWallets(previousValue: string, walletAddress: string) {
    const normalizedTarget = walletAddress.trim().toLowerCase();
    if (!normalizedTarget) {
      return previousValue;
    }
    const values = previousValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.some((value) => value.toLowerCase() === normalizedTarget)) {
      return values.join(",");
    }
    return [...values, walletAddress].join(",");
  }

  function sanitizeNonce(nonce: string) {
    const normalized = nonce.replace(/\D+/g, "");
    return normalized || "0";
  }

  function applyGeneratedCredentials(input: {
    address: string;
    apiKey: string;
    apiSecret: string;
    passphrase: string;
  }) {
    setForm((previous) => ({
      ...previous,
      env: {
        ...previous.env,
        KUEST_ADDRESS: input.address,
        KUEST_API_KEY: input.apiKey,
        KUEST_API_SECRET: input.apiSecret,
        KUEST_PASSPHRASE: input.passphrase,
        ADMIN_WALLETS: mergeAdminWallets(previous.env.ADMIN_WALLETS, input.address),
      },
    }));

    const hasBrandName = Boolean(form.brandName.trim());
    if (hasBrandName) {
      setActiveStep(2);
    }
    return hasBrandName;
  }

  async function saveContactEmailForKey(apiKey: string) {
    const email = form.contactEmail.trim();
    if (!email || !apiKey.trim()) {
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("key_emails").insert({
        api_key: apiKey.trim(),
        email,
      });

      // Duplicate email+key is expected in retries.
      if (error && error.code !== "23505") {
        throw new Error(error.message ?? "Supabase rejected email save.");
      }
    } catch (error) {
      // Email save is optional and must never block key generation.
      console.warn(
        "[launch] Optional email save failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  function clearGeneratedCredentials() {
    setForm((previous) => ({
      ...previous,
      env: {
        ...previous.env,
        KUEST_ADDRESS: "",
        KUEST_API_KEY: "",
        KUEST_API_SECRET: "",
        KUEST_PASSPHRASE: "",
        ADMIN_WALLETS: "",
      },
    }));
    setWalletInfo(null);
    setWalletError(null);
    setAutoSignAfterConnect(false);
  }

  function handleWalletDisconnect() {
    disconnect();
    clearGeneratedCredentials();
  }

  async function handleGenerateWithInjectedWallet() {
    setWalletActionLoading(true);
    setWalletError(null);
    setWalletInfo(null);

    try {
      const generated = await generateKuestKeysViaWallet({
        nonce: sanitizeNonce(form.keyNonce),
        onStatus: (message) => {
          if (!message) {
            setWalletInfo(null);
            return;
          }
          if (message.includes("Minting")) {
            setWalletInfo("Creating your account...");
            return;
          }
          if (message.includes("sign")) {
            setWalletInfo("Check your wallet and confirm.");
            return;
          }
          setWalletInfo(message);
        },
      });
      const advancedToStep2 = applyGeneratedCredentials(generated);
      void saveContactEmailForKey(generated.apiKey);
      if (advancedToStep2) {
        setWalletInfo(null);
      } else {
        setWalletInfo("Wallet connected. Enter your site name to continue.");
      }
    } catch (error) {
      setWalletError(
        error instanceof Error ? error.message : "Failed to generate credentials with browser wallet.",
      );
    } finally {
      setWalletActionLoading(false);
    }
  }

  async function handleEnsureRequiredNetwork() {
    if (!isConnected) {
      throw new Error("Connect wallet before switching network.");
    }
    if (onRequiredChain) {
      return;
    }

    if (!switchChain) {
      const provider = readInjectedProvider();
      if (!provider) {
        throw new Error(`Switch to ${REQUIRED_CHAIN_LABEL} in your wallet settings.`);
      }
      await ensureRequiredNetworkViaProvider(provider);
      return;
    }

    try {
      await switchChain({ chainId: REQUIRED_CHAIN_ID });
    } catch {
      const provider = readInjectedProvider();
      if (!provider) {
        throw new Error(`Unable to switch to ${REQUIRED_CHAIN_LABEL}.`);
      }
      await ensureRequiredNetworkViaProvider(provider);
    }
  }

  async function handleConnectOrSign(options?: { autoProgress?: boolean }) {
    const autoProgress = options?.autoProgress ?? false;

    if (!isAppKitReady) {
      await handleGenerateWithInjectedWallet();
      return;
    }

    setWalletError(null);

    if (!isConnected) {
      setWalletInfo("Open your wallet and approve the connection.");
      setConnectPromptOpen(true);
      try {
        await openAppKit();
      } catch (error) {
        setConnectPromptOpen(false);
        throw error;
      }
      return;
    }

    if (!onRequiredChain) {
      setWalletActionLoading(true);
      setWalletInfo(`Switching to ${REQUIRED_CHAIN_LABEL}...`);
      try {
        await handleEnsureRequiredNetwork();
        if (!autoProgress) {
          setWalletInfo(`${REQUIRED_CHAIN_LABEL} is active. Click Sign to continue.`);
        }
      } finally {
        setWalletActionLoading(false);
      }
      if (!autoProgress) {
        return;
      }
    }

    if (!account.address || account.chainId === undefined) {
      throw new Error("Wallet connection is not ready.");
    }

    const nonce = sanitizeNonce(form.keyNonce);
    const nonceBigInt = BigInt(nonce);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    setWalletActionLoading(true);
    setSignPromptOpen(true);
    setWalletInfo("Approve one signature to generate credentials.");

    try {
      const signature = await signTypedDataAsync({
        domain: {
          name: "ClobAuthDomain",
          version: "1",
          chainId: account.chainId,
        },
        types: {
          ClobAuth: [
            { name: "address", type: "address" },
            { name: "timestamp", type: "string" },
            { name: "nonce", type: "uint256" },
            { name: "message", type: "string" },
          ],
        },
        primaryType: "ClobAuth",
        message: {
          address: account.address,
          timestamp,
          nonce: nonceBigInt,
          message: "This message attests that I control the given wallet",
        },
      });

      setWalletInfo("Minting Kuest credentials...");
      const generated = await mintKuestKeysFromSignature({
        address: account.address,
        signature,
        timestamp,
        nonce,
      });

      const advancedToStep2 = applyGeneratedCredentials(generated);
      void saveContactEmailForKey(generated.apiKey);
      if (advancedToStep2) {
        setWalletInfo(null);
      } else {
        setWalletInfo("Wallet connected. Enter your site name to continue.");
      }
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Unable to sign and generate keys.");
    } finally {
      setSignPromptOpen(false);
      setWalletActionLoading(false);
    }
  }

  handleConnectOrSignRef.current = handleConnectOrSign;

  useEffect(() => {
    if (!autoSignAfterConnect || !isConnected || step1Complete || walletActionLoading) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await handleConnectOrSignRef.current?.({ autoProgress: true });
      } catch (error) {
        if (!cancelled) {
          setWalletError(
            error instanceof Error ? error.message : "Unable to continue wallet signing flow.",
          );
        }
      } finally {
        if (!cancelled) {
          setAutoSignAfterConnect(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoSignAfterConnect, isConnected, step1Complete, walletActionLoading]);

  function startTimelineAnimation() {
    if (timelineIntervalRef.current) {
      window.clearInterval(timelineIntervalRef.current);
      timelineIntervalRef.current = null;
    }

    timelineIndexRef.current = 0;
    setTimeline(
      BASE_TIMELINE.map((item, index) => ({
        ...item,
        status: index === 0 ? "running" : "idle",
      })),
    );

    timelineIntervalRef.current = window.setInterval(() => {
      timelineIndexRef.current = Math.min(
        timelineIndexRef.current + 1,
        BASE_TIMELINE.length - 1,
      );
      setTimeline((previous) =>
        previous.map((entry, index) => ({
          ...entry,
          status: mapTimeline(entry.status, index, timelineIndexRef.current),
        })),
      );
    }, 1500);
  }

  function stopTimelineAnimation(success: boolean) {
    if (timelineIntervalRef.current) {
      window.clearInterval(timelineIntervalRef.current);
      timelineIntervalRef.current = null;
    }

    if (success) {
      setTimeline((previous) =>
        previous.map((entry) => ({
          ...entry,
          status: "done",
        })),
      );
      return;
    }

    setTimeline((previous) =>
      previous.map((entry, index) => {
        if (index < timelineIndexRef.current) {
          return { ...entry, status: "done" };
        }
        if (index === timelineIndexRef.current) {
          return { ...entry, status: "error" };
        }
        return { ...entry, status: "idle" };
      }),
    );
  }

  function normalizeCustomDomain(value: string) {
    return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }

  const handleDomainAction = useCallback(
    async (action: "add" | "verify") => {
      if (!result?.ok) {
        return;
      }

      const domain = normalizeCustomDomain(customDomain);
      if (!domain) {
        setDomainActionError("Enter a domain first.");
        return;
      }

      setDomainActionLoading(action);
      setDomainActionError(null);

      try {
        const token = vercelAuthMethod === "token" ? form.vercelAccessToken.trim() : undefined;
        const response = await fetch("/api/vercel/domain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            token,
            domain,
            projectId: result.projectId,
            projectName: result.projectName || resolvedProjectSlug,
            teamId: result.resolvedTeamId || form.vercelTeamId.trim() || undefined,
          }),
        });

        const json = (await response.json()) as VercelDomainApiResponse;
        if (!response.ok || !json.domain) {
          throw new Error(json.error ?? "Domain action failed.");
        }

        setDomainState(json.domain);
        setCustomDomain(json.domain.name);
      } catch (error) {
        setDomainActionError(error instanceof Error ? error.message : "Domain action failed.");
      } finally {
        setDomainActionLoading(null);
      }
    },
    [
      customDomain,
      form.vercelAccessToken,
      form.vercelTeamId,
      resolvedProjectSlug,
      result,
      vercelAuthMethod,
    ],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLaunching(true);
    setRequestError(null);
    setResult(null);
    setDomainState(null);
    setDomainActionError(null);
    setDomainActionLoading(null);
    setCustomDomain("");
    setActiveStep(3);
    startTimelineAnimation();

    try {
      const resolvedVercelToken =
        vercelAuthMethod === "token" ? form.vercelAccessToken.trim() : undefined;
      const payload = {
        brandName: form.brandName,
        projectName: resolvedProjectSlug,
        gitRepo: form.gitRepo,
        gitBranch: form.gitBranch,
        databaseMode: "vercel_supabase_integration" as const,
        vercelTeamId: form.vercelTeamId || undefined,
        supabase: {
          region: form.supabaseRegion.trim() || undefined,
          existingResourceId:
            form.supabaseResourceId !== SUPABASE_CREATE_NEW_OPTION
              ? form.supabaseResourceId
              : undefined,
        },
        tokens: {
          vercel: resolvedVercelToken,
        },
        env: {
          ...form.env,
          SITE_URL: form.env.SITE_URL || computedSiteUrl,
          ...parseExtraEnv(form.extraEnvText),
        },
      };

      const response = await fetch("/api/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as LaunchResponseBody;
      setResult(json);

      if (!response.ok || !json.ok) {
        setRequestError(json.error ?? "Launch failed.");
        stopTimelineAnimation(false);
      } else {
        stopTimelineAnimation(true);
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to call API.");
      stopTimelineAnimation(false);
    } finally {
      setIsLaunching(false);
    }
  }

  const step2TokenReady = Boolean(form.vercelAccessToken.trim()) && !isVercelTokenInputFocused;
  const step2VercelReady = vercelAuthMethod === "oauth" ? vercelOauthConnected : step2TokenReady;
  const step2ReownReady = Boolean(form.env.REOWN_APPKIT_PROJECT_ID.trim());
  const step2DatabaseReady = step2VercelReady && Boolean(form.supabaseResourceId.trim());

  const stepItems = [
    {
      number: 1,
      title: "Site + Admin wallet",
      done: step1Complete && Boolean(form.brandName.trim()),
      active: activeStep === 1,
    },
    {
      number: 2,
      title: "Host + Database",
      done: step2VercelReady && step2ReownReady,
      active: activeStep === 2,
    },
    {
      number: 3,
      title: "Deploy",
      done: Boolean(result?.ok),
      active: activeStep === 3,
    },
  ] as const;

  const storedStep1Address = form.env.KUEST_ADDRESS.trim();
  const connectedAddressMatchesStep1 =
    !isConnected ||
    !account.address ||
    storedStep1Address.toLowerCase() === account.address.toLowerCase();
  const showSignedWalletState =
    step1Complete &&
    Boolean(storedStep1Address) &&
    connectedAddressMatchesStep1;
  const brandNameReady = Boolean(form.brandName.trim());
  const step1PrimaryLabel = !isAppKitReady
    ? "Use browser wallet"
    : !isConnected
      ? "Connect"
      : !onRequiredChain
        ? `Switch to ${REQUIRED_CHAIN_LABEL}`
        : "Sign";
  const step1WalletLabel = showSignedWalletState
    ? `${shortAddress(storedStep1Address)} · ${account.chain?.name ?? REQUIRED_CHAIN_LABEL}`
    : "";
  const canContinueStep2 = showSignedWalletState && brandNameReady;
  const canContinueStep3 = canContinueStep2 && step2VercelReady && step2ReownReady;

  return (
    <form onSubmit={onSubmit} className="launch-shell">
      <div className={`launch-stepper launch-stepper-active-${activeStep}`}>
        {stepItems.map((step) => (
          <button
            key={step.number}
            type="button"
            className={`launch-step ${step.active ? "is-active" : ""} ${step.done ? "is-done" : ""}`}
            onClick={() => {
              if (step.number === 1) {
                setActiveStep(1);
                return;
              }
              if (step.number === 2 && canContinueStep2) {
                setActiveStep(2);
                return;
              }
              if (step.number === 3 && canContinueStep3) {
                setActiveStep(3);
              }
            }}
            disabled={
              step.number === 2 ? !canContinueStep2 : step.number === 3 ? !canContinueStep3 : false
            }
          >
            <span className="launch-step-index">{step.number}</span>
            <span className="launch-step-title">{step.title}</span>
          </button>
        ))}
      </div>

      {activeStep === 1 && (
        <section className="launch-island launch-step1-island">
          <h2 className="sr-only">Step 1. Site + Admin wallet</h2>

          <div className="mt-5 launch-grid launch-step1-brand-grid">
            <label className="launch-field launch-step1-brand-field">
              <span className="launch-field-label">
                <span>Site name</span>
                <InfoTip text="This is your brand name." />
              </span>
              <input
                value={form.brandName}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    brandName: event.target.value,
                  }))
                }
                placeholder="Your Prediction Market Site Name"
                required
              />
            </label>
          </div>

          <div className="launch-step1-wallet mt-5 rounded-2xl border border-border/70 px-5 py-5">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Admin wallet</h3>
              <InfoTip text="One wallet signature creates your Kuest CLOB credentials. This wallet becomes the admin." />
            </div>
            {!isConnected && (
              <>
                <p className="text-xs text-muted-foreground">
                  For the simplest setup, use{" "}
                  <a
                    className="launch-link"
                    href="https://metamask.io/download"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="hidden sm:inline">MetaMask browser extension</span>
                    <span className="sm:hidden">MetaMask app</span>
                  </a>
                  . No balance required, no funds moved, no gas fees.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We try to switch to Polygon Amoy automatically and add the network when needed.
                </p>
              </>
            )}

            {showSignedWalletState ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5">
                  <ActionPromptWalletIcon className="size-8" rounded={false} fit="contain" />
                  <p className="text-sm font-semibold text-foreground">{step1WalletLabel}</p>
                </div>

                {isConnected && account.address && (
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={handleWalletDisconnect}
                    disabled={disconnectStatus === "pending"}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="launch-cta launch-cta-compact"
                  onClick={() => {
                    if (!step1Complete && isAppKitReady && !isConnected) {
                      setAutoSignAfterConnect(true);
                    }
                    void handleConnectOrSign();
                  }}
                  disabled={walletActionLoading}
                >
                  {walletActionLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2Icon className="size-4 animate-spin" />
                      Working...
                    </span>
                  ) : (
                    step1PrimaryLabel
                  )}
                </button>

                {isConnected && account.address && (
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={handleWalletDisconnect}
                    disabled={disconnectStatus === "pending"}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            )}

            {appKitError && !isAppKitReady && (
              <p className="mt-3 text-sm text-primary/90">{appKitError}</p>
            )}
            {walletInfo && <p className="mt-3 text-sm text-primary">{walletInfo}</p>}
            {walletError && <p className="mt-3 text-sm text-destructive">{walletError}</p>}
            <div className="mt-4 border-t border-border/60 pt-4">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground"
                onClick={() => setStep1AdvancedOpen((previous) => !previous)}
              >
                <span>Advanced options</span>
                <ChevronDownIcon
                  className={`size-4 transition-transform ${step1AdvancedOpen ? "rotate-180" : ""}`}
                />
              </button>

              {step1AdvancedOpen && (
                <div className="mt-4 launch-grid">
                  <label className="launch-field">
                    <span>Email (optional)</span>
                    <input
                      type="email"
                      value={form.contactEmail}
                      placeholder="you@team.com"
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          contactEmail: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="launch-field">
                    <span>Nonce</span>
                    <input
                      value={form.keyNonce}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          keyNonce: event.target.value.replace(/\D+/g, "") || "0",
                        }))
                      }
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="launch-step-actions launch-step-footer launch-step1-actions mt-6">
            <span className="launch-step-footer-spacer" aria-hidden="true" />
            <StepFooterBrand />
            <div className="launch-step-footer-control launch-binary-nav">
              <span className="launch-binary-label">Continue</span>
              <button type="button" className="launch-choice-button launch-choice-no" disabled>
                <ArrowLeftIcon className="size-3.5" />
                No
              </button>
              <button
                type="button"
                className="launch-choice-button launch-choice-yes"
                disabled={!canContinueStep2}
                onClick={() => setActiveStep(2)}
              >
                Yes
                <ArrowRightIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {activeStep === 2 && (
        <section className="launch-island launch-step2-island">
          <h2 className="sr-only">Step 2. Host + Database</h2>

          <div className="launch-stack mt-5 space-y-3">
            <div className="launch-panel-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Vercel authentication</h3>
                  <InfoTip text="Vercel is where your prediction market website is hosted." />
                </div>
                {step2VercelReady ? (
                  <CircleCheckIcon className="size-5 text-primary" />
                ) : (
                  <CircleIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              {ALLOW_VERCEL_TOKEN_FALLBACK && !step2VercelReady && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={() => switchVercelAuthMethod("oauth")}
                    disabled={vercelAuthMethod === "oauth"}
                  >
                    OAuth
                  </button>
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={() => switchVercelAuthMethod("token")}
                    disabled={vercelAuthMethod === "token"}
                  >
                    Access Token
                  </button>
                </div>
              )}

              {vercelAuthMethod === "oauth" ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-md border border-black bg-black">
                      <Image
                        src="/images/vercel.svg"
                        alt="Vercel"
                        width={14}
                        height={14}
                        className="size-3.5"
                      />
                    </span>
                    {vercelOauthConnected ? (
                      <span className="text-xs font-medium text-foreground">
                        {vercelOauthIdentity || "Connected account"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not connected</span>
                    )}

                    {vercelOauthConnected ? (
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={() => {
                          void disconnectVercelOAuth();
                        }}
                        disabled={oauthStatusLoading}
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={startVercelOAuth}
                        disabled={oauthStatusLoading}
                      >
                        {oauthStatusLoading ? "Checking..." : "Connect Vercel"}
                      </button>
                    )}
                  </div>

                  {oauthStatusError && (
                    <p className="mt-2 text-xs font-medium text-primary/90">{oauthStatusError}</p>
                  )}
                </>
              ) : (
                <>
                  {step2TokenReady ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-md border border-black bg-black">
                        <Image
                          src="/images/vercel.svg"
                          alt="Vercel"
                          width={14}
                          height={14}
                          className="size-3.5"
                        />
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {maskToken(form.vercelAccessToken)}
                      </span>
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            vercelAccessToken: "",
                            supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
                          }))
                        }
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="launch-field">
                        <span className="sr-only">Vercel Access Token</span>
                        <input
                          type="password"
                          value={form.vercelAccessToken}
                          onChange={(event) => {
                            setForm((previous) => ({
                              ...previous,
                              vercelAccessToken: event.target.value,
                              supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
                            }));
                          }}
                          onFocus={() => setIsVercelTokenInputFocused(true)}
                          onBlur={() => setIsVercelTokenInputFocused(false)}
                          placeholder="Paste Vercel Access Token"
                          required
                        />
                      </label>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <a
                          className="launch-link"
                          href="https://vercel.com/account/tokens"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Create token in Vercel
                        </a>
                      </p>
                    </>
                  )}

                </>
              )}
            </div>

            <div className="launch-panel-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Reown Project ID</h3>
                  <InfoTip text="Reown Project ID enables wallet login for your end users." />
                </div>
                {step2ReownReady ? (
                  <CircleCheckIcon className="size-5 text-primary" />
                ) : (
                  <CircleIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              <label className="launch-field">
                <span className="sr-only">Reown Project ID</span>
                <input
                  value={form.env.REOWN_APPKIT_PROJECT_ID}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      env: {
                        ...previous.env,
                        REOWN_APPKIT_PROJECT_ID: event.target.value,
                      },
                    }))
                  }
                  placeholder="Required"
                  required
                />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                Get it at{" "}
                <a
                  className="launch-link"
                  href="https://cloud.reown.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  cloud.reown.com
                </a>
                {" "}→ create/select project → copy Project ID.
              </p>
            </div>

            <div className="launch-panel-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Supabase database</h3>
                  <InfoTip text="Supabase stores users, sessions, and app data. It is connected or created through your Vercel integration." />
                </div>
                {step2DatabaseReady ? (
                  <CircleCheckIcon className="size-5 text-primary" />
                ) : (
                  <CircleIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="launch-field-inline">
                <select
                  className="launch-inline-control"
                  value={form.supabaseResourceId}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      supabaseResourceId: event.target.value,
                    }))
                  }
                  disabled={isLoadingSupabaseResources}
                >
                  <option value={SUPABASE_CREATE_NEW_OPTION}>CREATE NEW DATABASE</option>
                  {supabaseResources.map((resource, index) => (
                    <option key={resource.id} value={resource.id}>
                      {`SUPABASE DATABASE ${index + 1} - ${resource.name}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="launch-mini-button"
                  onClick={() => {
                    void loadSupabaseResources();
                  }}
                  disabled={!step2VercelReady || isLoadingSupabaseResources}
                >
                  {isLoadingSupabaseResources ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              {supabaseResourcesError && (
                <p className="mt-2 text-xs font-medium text-primary/90">{supabaseResourcesError}</p>
              )}
            </div>
          </div>

          <div className="launch-panel-card mt-5 rounded-2xl border border-border/70 px-5 py-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground"
              onClick={() => setStep2AdvancedOpen((previous) => !previous)}
            >
              <span>Advanced options</span>
              <ChevronDownIcon
                className={`size-4 transition-transform ${step2AdvancedOpen ? "rotate-180" : ""}`}
              />
            </button>

            {step2AdvancedOpen && (
              <div className="mt-4 border-t border-border/60 pt-4">
                <div className="launch-grid">
                  <label className="launch-field">
                    <span>Project slug (auto)</span>
                    <input value={resolvedProjectSlug} readOnly />
                  </label>
                  <label className="launch-field">
                    <span>Project slug override</span>
                    <input
                      value={form.projectSlugOverride}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          projectSlugOverride: event.target.value,
                        }))
                      }
                      placeholder="optional"
                    />
                  </label>
                  <label className="launch-field">
                    <span>Repository</span>
                    <input
                      value={form.gitRepo}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          gitRepo: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="launch-field">
                    <span>Branch</span>
                    <input
                      value={form.gitBranch}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          gitBranch: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="launch-field">
                    <span>Vercel Team ID</span>
                    <input
                      value={form.vercelTeamId}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          vercelTeamId: event.target.value,
                          supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
                        }))
                      }
                      placeholder="empty = personal account"
                    />
                  </label>
                  <label className="launch-field">
                    <span>Supabase region</span>
                    <input
                      value={form.supabaseRegion}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          supabaseRegion: event.target.value,
                        }))
                      }
                      placeholder="us-east-1"
                    />
                  </label>
                  <label className="launch-field">
                    <span>BETTER_AUTH_SECRET</span>
                    <div className="launch-field-inline">
                      <input
                        value={form.env.BETTER_AUTH_SECRET}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              BETTER_AUTH_SECRET: event.target.value,
                            },
                          }))
                        }
                        placeholder="empty = auto generated by API"
                      />
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              BETTER_AUTH_SECRET: randomString(40),
                            },
                          }))
                        }
                      >
                        Generate
                      </button>
                    </div>
                  </label>
                  <label className="launch-field">
                    <span>CRON_SECRET</span>
                    <div className="launch-field-inline">
                      <input
                        value={form.env.CRON_SECRET}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              CRON_SECRET: event.target.value,
                            },
                          }))
                        }
                        placeholder="empty = auto generated by API"
                      />
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              CRON_SECRET: randomString(28),
                            },
                          }))
                        }
                      >
                        Generate
                      </button>
                    </div>
                  </label>
                  <label className="launch-field">
                    <span>SITE_URL override</span>
                    <input
                      value={form.env.SITE_URL}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          env: {
                            ...previous.env,
                            SITE_URL: event.target.value,
                          },
                        }))
                      }
                      placeholder={computedSiteUrl}
                    />
                  </label>
                </div>
                <label className="launch-field mt-4">
                  <span>Extra env vars (.env format)</span>
                  <textarea
                    value={form.extraEnvText}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        extraEnvText: event.target.value,
                      }))
                    }
                    rows={5}
                    placeholder={`OPENROUTER_API_KEY=...\nSENTRY_DSN=...`}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="launch-step-actions launch-step-footer mt-6">
            <span className="launch-step-footer-spacer" aria-hidden="true" />
            <StepFooterBrand />
            <div className="launch-step-footer-control launch-binary-nav">
              <span className="launch-binary-label">Continue</span>
              <button
                type="button"
                className="launch-choice-button launch-choice-no"
                onClick={() => setActiveStep(1)}
              >
                <ArrowLeftIcon className="size-3.5" />
                No
              </button>
              <button
                type="button"
                className="launch-choice-button launch-choice-yes"
                disabled={!canContinueStep3 || !form.env.REOWN_APPKIT_PROJECT_ID.trim()}
                onClick={() => setActiveStep(3)}
              >
                Yes
                <ArrowRightIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {activeStep === 3 && (
        <section className="launch-island launch-step3-island">
          <h2 className="sr-only">Step 3. Deploy</h2>

          <div className="launch-panel-card mt-5 rounded-2xl border border-border/70 px-5 py-5">
            <div className="space-y-3">
              {timeline.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 text-sm">
                  <span
                    className={`launch-timeline-dot ${
                      entry.status === "done"
                        ? "is-done"
                        : entry.status === "running"
                          ? "is-running"
                          : entry.status === "error"
                            ? "is-error"
                            : ""
                    }`}
                  >
                    {entry.status === "done" ? <CheckIcon className="size-3" /> : null}
                  </span>
                  <span
                    className={
                      entry.status === "error"
                        ? "text-destructive"
                        : entry.status === "running"
                          ? "text-primary"
                          : "text-muted-foreground"
                    }
                  >
                    {entry.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="launch-step-actions launch-step-footer mt-6">
              <span className="launch-step-footer-spacer" aria-hidden="true" />
              <StepFooterBrand />
              <div className="launch-step-footer-control launch-binary-nav">
                <span className="launch-binary-label">Deploy</span>
                <button
                  type="button"
                  className="launch-choice-button launch-choice-no"
                  onClick={() => setActiveStep(2)}
                >
                  <ArrowLeftIcon className="size-3.5" />
                  No
                </button>
                <button
                  type="submit"
                  className="launch-choice-button launch-choice-yes"
                  disabled={
                    isLaunching ||
                    !canContinueStep3 ||
                    !form.env.REOWN_APPKIT_PROJECT_ID.trim()
                  }
                >
                  {isLaunching ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2Icon className="size-4 animate-spin" />
                      Yes
                    </span>
                  ) : (
                    <>
                      <RocketIcon className="size-3.5" />
                      Yes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {requestError && (
            <div className="mt-5 rounded-xl border border-destructive/45 p-4 text-sm text-destructive">
              {requestError}
            </div>
          )}

          {result && (
            <section className="launch-panel-card mt-5 rounded-2xl border border-border/70 p-5">
              <h3 className="text-base font-semibold text-foreground">Result</h3>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div>
                  Status:{" "}
                  <strong className={result.ok ? "text-primary" : "text-destructive"}>
                    {result.ok ? "success" : "failed"}
                  </strong>
                </div>
                <div>
                  Project: <strong>{result.projectName ?? "-"}</strong>
                </div>
                <div>
                  URL:{" "}
                  {result.projectUrl ? (
                    <a className="launch-link" href={result.projectUrl} target="_blank" rel="noreferrer">
                      {result.projectUrl}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  Vercel dashboard:{" "}
                  {result.vercelDashboardUrl ? (
                    <a
                      className="launch-link"
                      href={result.vercelDashboardUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {result.vercelDashboardUrl}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  Supabase dashboard:{" "}
                  {result.supabaseDashboardUrl ? (
                    <a
                      className="launch-link"
                      href={result.supabaseDashboardUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {result.supabaseDashboardUrl}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
                <div>Duration: {Math.round(result.durationMs / 100) / 10}s</div>
              </div>

              {result.ok && result.projectName && (
                <div className="launch-subcard mt-5 rounded-xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">Custom domain (optional)</h4>
                      <InfoTip text="Use your own domain after deploy. Add it first, then verify DNS records." />
                    </div>
                    {domainState && (
                      <span
                        className={`text-xs font-semibold ${
                          domainState.verified ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {domainState.verified ? "Verified" : "Pending verification"}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 launch-field-inline">
                    <input
                      className="launch-inline-control"
                      value={customDomain}
                      onChange={(event) => setCustomDomain(event.target.value)}
                      placeholder="app.yourdomain.com"
                    />
                    <button
                      type="button"
                      className="launch-mini-button"
                      onClick={() => {
                        void handleDomainAction("add");
                      }}
                      disabled={domainActionLoading !== null}
                    >
                      {domainActionLoading === "add" ? "Adding..." : "Add domain"}
                    </button>
                    <button
                      type="button"
                      className="launch-mini-button"
                      onClick={() => {
                        void handleDomainAction("verify");
                      }}
                      disabled={domainActionLoading !== null || !customDomain.trim()}
                    >
                      {domainActionLoading === "verify" ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                  {domainActionError && (
                    <p className="mt-2 text-xs font-medium text-primary/90">{domainActionError}</p>
                  )}
                  {domainState && domainState.nameservers && domainState.nameservers.length > 0 && (
                    <div className="launch-subcard mt-3 rounded-lg border border-border/70 px-3 py-2 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">Nameservers to set at your registrar:</p>
                      <div className="mt-1 space-y-1">
                        {domainState.nameservers.map((nameServer) => (
                          <p key={nameServer} className="font-mono text-[11px] leading-4">
                            {nameServer}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {domainState && !domainState.verified && domainState.verification.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {domainState.verification.map((record, index) => (
                        <div
                          key={`${record.type ?? "record"}-${record.domain ?? "domain"}-${index}`}
                          className="launch-subcard rounded-lg border border-border/70 px-3 py-2 text-xs text-muted-foreground"
                        >
                          <span className="font-semibold text-foreground">
                            {record.type || "DNS"}:
                          </span>{" "}
                          {record.domain || "@"} {"->"} {record.value || "check Vercel DNS instructions"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5">
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Logs
                </h4>
                <LogList logs={result.logs} />
              </div>
            </section>
          )}
        </section>
      )}

      <ActionPrompt
        open={connectPromptOpen}
        title="Connecting wallet"
        description="Open your wallet and approve the connection to continue."
        showConnectedWalletIcon={isAppKitReady}
        allowClose
        onClose={() => setConnectPromptOpen(false)}
      />

      <ActionPrompt
        open={signPromptOpen}
        title="Waiting for signature"
        description="Approve the signature in your wallet to continue."
        showConnectedWalletIcon={isAppKitReady}
        allowClose
        onClose={() => setSignPromptOpen(false)}
      />
    </form>
  );
}
