'use client'

import type { FormEvent } from 'react'
import type { SupportedLocale } from '@/i18n/locales'
import type {
  LaunchLogEntry,
  LaunchResponseBody,
  OAuthStatusResponse,
  VercelConnectionStatusResponse,
  VercelDomainResponse,
} from '@/lib/launch-types'
import { useWalletInfo } from '@reown/appkit/react'
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
} from 'lucide-react'
import { useExtracted, useLocale } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useDisconnect, useSignTypedData, useSwitchChain } from 'wagmi'
import { useAppKit } from '@/hooks/useAppKit'
import { LANGUAGE_OPTIONS } from '@/i18n/locales'
import { getPathname } from '@/i18n/navigation'
import {
  ensureRequiredNetworkViaProvider,
  generateKuestKeysViaWallet,
  mintKuestKeysFromSignature,
  readInjectedProvider,
  REQUIRED_CHAIN_ID,
  REQUIRED_CHAIN_LABEL,
} from '@/lib/kuest-keygen'
import { normalizeSiteUrl } from '@/lib/site-url'
import { createSupabaseClient } from '@/lib/supabase'

interface FormState {
  vercelAccessToken: string
  brandName: string
  projectSlugOverride: string
  gitRepo: string
  gitBranch: string
  vercelTeamId: string
  supabaseRegion: string
  supabaseResourceId: string
  keyNonce: string
  contactEmail: string
  env: {
    KUEST_ADDRESS: string
    KUEST_API_KEY: string
    KUEST_API_SECRET: string
    KUEST_PASSPHRASE: string
    ADMIN_WALLETS: string
    REOWN_APPKIT_PROJECT_ID: string
    BETTER_AUTH_SECRET: string
    CRON_SECRET: string
    SITE_URL: string
  }
  extraEnvText: string
}

interface SupabaseResourceOption {
  id: string
  name: string
}

interface SupabaseResourcesResponse {
  resources?: SupabaseResourceOption[]
  resolvedTeamId?: string
  error?: string
}

interface VercelDomainApiResponse {
  domain?: VercelDomainResponse
  error?: string
}

type TimelineStatus = 'idle' | 'running' | 'done' | 'error'

interface TimelineEntry {
  id: string
  label: string
  status: TimelineStatus
}

interface ActionPromptProps {
  open: boolean
  title: string
  description: string
  showConnectedWalletIcon?: boolean
  allowClose?: boolean
  onClose?: () => void
}

interface ActionPromptWalletIconProps {
  className?: string
  rounded?: boolean
  fit?: 'cover' | 'contain'
}

type VercelAuthMethod = 'oauth' | 'token'
type LaunchStep = 1 | 2 | 3

interface GitHubConnectState {
  repoUrl: string
  syncEnabled: boolean
}

const SUPABASE_CREATE_NEW_OPTION = '__create_new__'
const FORM_SESSION_STORAGE_KEY = 'launchpad_form_state_v6'
const LEGACY_FORM_SESSION_STORAGE_KEY = 'launchpad_form_state_v4'
const DEFAULT_VERCEL_AUTH_METHOD: VercelAuthMethod = 'token'
const ALLOW_VERCEL_TOKEN_FALLBACK
  = process.env.NEXT_PUBLIC_VERCEL_ALLOW_TOKEN_FALLBACK !== 'false'
const FOOTER_BRAND_NAME = 'Kuest'
const GITHUB_APP_URL = process.env.NEXT_PUBLIC_GITHUB_APP_URL?.trim() || ''
const VERCEL_GITHUB_APP_URL = 'https://github.com/apps/vercel'

const LAUNCHPAD_COPY: Record<
  SupportedLocale,
  {
    connectionsStep: string
    step2Connections: string
    step3Deploy: string
    githubInfo: string
    redirecting: string
    connectGitHub: string
    githubCreated: string
    githubConnected: string
    oauthSoon: string
  }
> = {
  en: {
    connectionsStep: 'Connections',
    step2Connections: 'Step 2. Connections',
    step3Deploy: 'Step 3. Deploy',
    githubInfo: 'Authorize Kuest on GitHub so we can create a repository in your GitHub account with a cloned Kuest prediction market. If you already have your own repository, you can enter it manually in Advanced options.',
    redirecting: 'Redirecting...',
    connectGitHub: 'Connect GitHub',
    githubCreated: 'created',
    githubConnected: 'connected',
    oauthSoon: '(soon) OAuth',
  },
  de: {
    connectionsStep: 'Verbindungen',
    step2Connections: 'Schritt 2. Verbindungen',
    step3Deploy: 'Schritt 3. Bereitstellen',
    githubInfo: 'Autorisiere Kuest auf GitHub, damit wir in deinem GitHub-Konto ein Repository mit einem geklonten Kuest Prediction Market erstellen können. Wenn du bereits ein eigenes Repository hast, kannst du es in den erweiterten Optionen manuell eintragen.',
    redirecting: 'Weiterleitung...',
    connectGitHub: 'GitHub verbinden',
    githubCreated: 'erstellt',
    githubConnected: 'verbunden',
    oauthSoon: '(bald) OAuth',
  },
  es: {
    connectionsStep: 'Conexiones',
    step2Connections: 'Paso 2. Conexiones',
    step3Deploy: 'Paso 3. Implementar',
    githubInfo: 'Autoriza a Kuest en GitHub para que podamos crear un repositorio en tu cuenta de GitHub con un clon del prediction market de Kuest. Si ya tienes tu propio repositorio, puedes introducirlo manualmente en las opciones avanzadas.',
    redirecting: 'Redirigiendo...',
    connectGitHub: 'Conectar GitHub',
    githubCreated: 'creado',
    githubConnected: 'conectado',
    oauthSoon: '(soon) OAuth',
  },
  pt: {
    connectionsStep: 'Conexões',
    step2Connections: 'Etapa 2. Conexões',
    step3Deploy: 'Etapa 3. Implantar',
    githubInfo: 'Autorize a Kuest no GitHub para que possamos criar um repositório na sua conta com um clone do prediction market da Kuest. Se você já tem seu próprio repositório, pode preenchê-lo manualmente em Opções avançadas.',
    redirecting: 'Redirecionando...',
    connectGitHub: 'Conectar GitHub',
    githubCreated: 'criado',
    githubConnected: 'conectado',
    oauthSoon: '(soon) OAuth',
  },
  fr: {
    connectionsStep: 'Connexions',
    step2Connections: 'Étape 2. Connexions',
    step3Deploy: 'Étape 3. Déployer',
    githubInfo: 'Autorisez Kuest sur GitHub afin que nous puissions créer un dépôt dans votre compte GitHub avec un clone du prediction market de Kuest. Si vous avez déjà votre propre dépôt, vous pouvez le renseigner manuellement dans les options avancées.',
    redirecting: 'Redirection...',
    connectGitHub: 'Connecter GitHub',
    githubCreated: 'créé',
    githubConnected: 'connecté',
    oauthSoon: '(soon) OAuth',
  },
  zh: {
    connectionsStep: '连接',
    step2Connections: '第 2 步：连接',
    step3Deploy: '第 3 步：部署',
    githubInfo: '请在 GitHub 上授权 Kuest，这样我们就能在你的 GitHub 账号中创建一个包含 Kuest prediction market 克隆的仓库。如果你已经有自己的仓库，也可以在高级选项中手动填写。',
    redirecting: '正在跳转...',
    connectGitHub: '连接 GitHub',
    githubCreated: '已创建',
    githubConnected: '已连接',
    oauthSoon: '(soon) OAuth',
  },
}

const DEFAULT_FORM: FormState = {
  vercelAccessToken: '',
  brandName: '',
  projectSlugOverride: '',
  gitRepo: '',
  gitBranch: 'main',
  vercelTeamId: process.env.NEXT_PUBLIC_DEFAULT_VERCEL_TEAM_ID ?? '',
  supabaseRegion: process.env.NEXT_PUBLIC_DEFAULT_SUPABASE_REGION ?? 'us-east-1',
  supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
  keyNonce: '0',
  contactEmail: '',
  env: {
    KUEST_ADDRESS: '',
    KUEST_API_KEY: '',
    KUEST_API_SECRET: '',
    KUEST_PASSPHRASE: '',
    ADMIN_WALLETS: '',
    REOWN_APPKIT_PROJECT_ID: '',
    BETTER_AUTH_SECRET: '',
    CRON_SECRET: '',
    SITE_URL: '',
  },
  extraEnvText: '',
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return (slug || 'kuest-market').slice(0, 96)
}

function randomString(length: number) {
  const alphabet
    = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_!@#%*'
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join('')
}

function parseExtraEnv(extraEnvText: string) {
  const env: Record<string, string> = {}
  const lines = extraEnvText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !line.startsWith('#'))

  for (const line of lines) {
    const separator = line.indexOf('=')
    if (separator <= 0) {
      continue
    }
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (key) {
      env[key] = value
    }
  }

  return env
}

function toPersistableFormState(form: FormState, githubState: GitHubConnectState) {
  return {
    brandName: form.brandName,
    projectSlugOverride: form.projectSlugOverride,
    gitRepo: form.gitRepo,
    gitBranch: form.gitBranch,
    vercelTeamId: form.vercelTeamId,
    supabaseRegion: form.supabaseRegion,
    supabaseResourceId: form.supabaseResourceId,
    keyNonce: form.keyNonce,
    contactEmail: form.contactEmail,
    env: {
      KUEST_ADDRESS: form.env.KUEST_ADDRESS,
      KUEST_API_KEY: form.env.KUEST_API_KEY,
      KUEST_API_SECRET: form.env.KUEST_API_SECRET,
      KUEST_PASSPHRASE: form.env.KUEST_PASSPHRASE,
      ADMIN_WALLETS: form.env.ADMIN_WALLETS,
      REOWN_APPKIT_PROJECT_ID: form.env.REOWN_APPKIT_PROJECT_ID,
      SITE_URL: form.env.SITE_URL,
    },
    githubRepoUrl: githubState.repoUrl,
    githubSyncEnabled: githubState.syncEnabled,
  }
}

function shortAddress(address?: string) {
  if (!address) {
    return ''
  }
  if (address.length <= 10) {
    return address
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function maskToken(value: string) {
  const token = value.trim()
  if (!token) {
    return ''
  }
  if (token.length <= 10) {
    return '••••••••'
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

function mapTimeline(status: TimelineStatus, index: number, runningIndex: number) {
  if (status === 'error') {
    return status
  }
  if (status === 'done') {
    return status
  }
  if (index < runningIndex) {
    return 'done'
  }
  if (index === runningIndex) {
    return 'running'
  }
  return 'idle'
}

function LogList({ locale, logs }: { locale: SupportedLocale, logs: LaunchLogEntry[] }) {
  return (
    <ul className="launch-log-list">
      {logs.map((entry, index) => (
        <li
          key={`${entry.at}-${entry.step}-${index}`}
          className="launch-log-item rounded-lg border border-border/70 p-3"
        >
          <div className="launch-log-time text-xs text-muted-foreground">
            {new Date(entry.at).toLocaleString(locale)}
          </div>
          <div className="launch-log-head text-sm font-semibold text-foreground">
            [
            {entry.step}
            ]
            {' '}
            {' '}
            <span
              className={
                entry.level === 'error'
                  ? 'text-destructive'
                  : entry.level === 'warning'
                    ? 'text-primary/90'
                    : 'text-primary'
              }
            >
              {entry.level.toUpperCase()}
            </span>
          </div>
          <div className="launch-log-message text-sm text-muted-foreground">{entry.message}</div>
        </li>
      ))}
    </ul>
  )
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
  )
}

function ConnectionCardTitle({
  iconSrc,
  iconAlt,
  title,
  infoText,
}: {
  iconSrc: string
  iconAlt: string
  title: string
  infoText: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="launch-service-badge" aria-hidden="true">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={16}
          height={16}
          className="launch-service-mark"
        />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <InfoTip text={infoText} />
    </div>
  )
}

function ActionPrompt({
  open,
  title,
  description,
  showConnectedWalletIcon = false,
  allowClose = false,
  onClose,
}: ActionPromptProps) {
  const t = useExtracted()

  if (!open) {
    return null
  }

  return (
    <div className="
      launch-action-modal fixed inset-0 z-80 flex items-center justify-center bg-background/85 px-4 py-6
      backdrop-blur-md
    "
    >
      <div className="
        launch-action-modal-card relative w-full max-w-sm rounded-2xl border border-border/70 bg-background p-6
        text-center shadow-2xl
      "
      >
        {allowClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="
              absolute top-4 right-4 rounded-md border border-border p-2 text-muted-foreground transition
              hover:bg-muted/60 hover:text-foreground
            "
            aria-label={t('Close waiting modal')}
          >
            <XIcon className="size-4" />
          </button>
        )}

        <div className="launch-action-modal-copy">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="launch-action-modal-visual mt-5 flex justify-center">
          <div className="relative size-36 overflow-hidden rounded-[30px] bg-background text-primary">
            <div className="
              pointer-events-none absolute inset-0 animate-[spin_1500ms_linear_infinite]
              bg-[conic-gradient(from_0deg,transparent_0deg,transparent_288deg,currentColor_320deg,currentColor_350deg,transparent_360deg)]
            "
            />
            <div className="absolute inset-0.75 rounded-[26px] bg-background" />
            <div className="relative flex size-full items-center justify-center">
              <div className="flex size-[88%] items-center justify-center">
                {showConnectedWalletIcon
                  ? (
                      <ActionPromptWalletIcon />
                    )
                  : (
                      <WalletIcon className="size-16 text-primary" strokeWidth={1.7} />
                    )}
              </div>
            </div>
          </div>
        </div>

        <div className="
          launch-action-modal-status mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground
        "
        >
          <Loader2Icon className="size-4 animate-spin text-primary" />
          <span>{t('Waiting for wallet approval...')}</span>
        </div>
      </div>
    </div>
  )
}

function ActionPromptWalletIcon({
  className = 'size-16',
  rounded = true,
  fit = 'cover',
}: ActionPromptWalletIconProps) {
  const t = useExtracted()
  const { walletInfo } = useWalletInfo()
  const [failedIconUrl, setFailedIconUrl] = useState<string | null>(null)
  const walletName = typeof walletInfo?.name === 'string' ? walletInfo.name : undefined
  const walletIconUrl = typeof walletInfo?.icon === 'string' ? walletInfo.icon.trim() : ''

  if (!walletIconUrl || failedIconUrl === walletIconUrl) {
    return <WalletIcon className={`${className} text-primary`} strokeWidth={1.7} />
  }

  return (
    <Image
      key={walletIconUrl}
      src={walletIconUrl}
      alt={
        walletName
          ? t('{walletName} wallet icon', { walletName })
          : t('Connected wallet icon')
      }
      width={64}
      height={64}
      unoptimized
      className={`${className} ${rounded ? 'rounded-2xl' : ''} ${
        fit === 'contain' ? 'object-contain' : 'object-cover'
      }`}
      onError={() => setFailedIconUrl(walletIconUrl)}
    />
  )
}

function StepFooterBrand() {
  return (
    <span className="launch-footer-brand" aria-hidden="true">
      <span className="launch-footer-brand-logo" />
      <span className="launch-footer-brand-text">{FOOTER_BRAND_NAME}</span>
    </span>
  )
}

function StepFooterLanguageControl() {
  const t = useExtracted()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement | null>(null)
  const currentLocaleOption = LANGUAGE_OPTIONS.find(option => option.code === locale) ?? LANGUAGE_OPTIONS[0]

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!controlRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="launch-step-footer-language">
      <div
        ref={controlRef}
        className="launch-language-control"
        data-open={open ? 'true' : 'false'}
      >
        <button
          type="button"
          className="launch-language-trigger"
          aria-label={t('Change launch app language')}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(previous => !previous)}
        >
          <span className="launch-language-trigger-content">
            <Image
              src={currentLocaleOption.flagSrc}
              alt=""
              width={18}
              height={12}
              sizes="18px"
              className="launch-language-flag"
            />
            <span className="launch-language-label">{currentLocaleOption.label}</span>
          </span>
          <span className="launch-language-icon" aria-hidden="true">
            <ChevronDownIcon className="size-3.5" />
          </span>
        </button>
        <div className="launch-language-menu" role="listbox" aria-label={t('Change launch app language')}>
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = option.code === locale

            return (
              <a
                key={option.code}
                role="option"
                aria-selected={isSelected}
                className={`launch-language-option ${isSelected ? 'is-selected' : ''}`}
                href={getPathname({ href: '/launch', locale: option.code })}
                onClick={() => setOpen(false)}
              >
                <span className="launch-language-option-row">
                  <Image
                    src={option.flagSrc}
                    alt=""
                    width={18}
                    height={12}
                    sizes="18px"
                    className="launch-language-flag"
                  />
                  <span>{option.label}</span>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function LaunchpadForm({ locale }: { locale: SupportedLocale }) {
  const t = useExtracted()
  const copy = LAUNCHPAD_COPY[locale]
  const account = useAccount()
  const { disconnect, status: disconnectStatus } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { signTypedDataAsync } = useSignTypedData()
  const { open: openAppKit, isReady: isAppKitReady, error: appKitError } = useAppKit()

  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [activeStep, setActiveStep] = useState<LaunchStep>(1)
  const [step1AdvancedOpen, setStep1AdvancedOpen] = useState(false)
  const [step2AdvancedOpen, setStep2AdvancedOpen] = useState(false)
  const [isVercelTokenInputFocused, setIsVercelTokenInputFocused] = useState(false)
  const [vercelAuthMethod, setVercelAuthMethod] = useState<VercelAuthMethod>(
    DEFAULT_VERCEL_AUTH_METHOD,
  )
  const [githubRepoUrl, setGithubRepoUrl] = useState('')
  const [githubSyncEnabled, setGithubSyncEnabled] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [isRedirectingToGitHub, setIsRedirectingToGitHub] = useState(false)
  const [oauthStatus, setOauthStatus] = useState<OAuthStatusResponse | null>(null)
  const [oauthStatusLoading, setOauthStatusLoading] = useState(false)
  const [oauthStatusError, setOauthStatusError] = useState<string | null>(null)
  const [vercelConnection, setVercelConnection] = useState<VercelConnectionStatusResponse | null>(null)
  const [vercelConnectionLoading, setVercelConnectionLoading] = useState(false)
  const [vercelConnectionError, setVercelConnectionError] = useState<string | null>(null)
  const [awaitingVercelGitHubConnection, setAwaitingVercelGitHubConnection] = useState(false)

  const [walletActionLoading, setWalletActionLoading] = useState(false)
  const [walletInfo, setWalletInfo] = useState<string | null>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [connectPromptOpen, setConnectPromptOpen] = useState(false)
  const [signPromptOpen, setSignPromptOpen] = useState(false)
  const [autoSignAfterConnect, setAutoSignAfterConnect] = useState(false)

  const [supabaseResources, setSupabaseResources] = useState<SupabaseResourceOption[]>([])
  const [isLoadingSupabaseResources, setIsLoadingSupabaseResources] = useState(false)
  const [supabaseResourcesError, setSupabaseResourcesError] = useState<string | null>(null)

  const [isLaunching, setIsLaunching] = useState(false)
  const [result, setResult] = useState<LaunchResponseBody | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [customDomain, setCustomDomain] = useState('')
  const [domainActionLoading, setDomainActionLoading] = useState<'add' | 'verify' | null>(null)
  const [domainActionError, setDomainActionError] = useState<string | null>(null)
  const [domainState, setDomainState] = useState<VercelDomainResponse | null>(null)

  const TIMELINE = useMemo(() => [
    {
      id: 'validation',
      label: t('Validate launch setting'),
    },
    {
      id: 'vercel',
      label: t('Prepare or reuse Vercel project'),
    },
    {
      id: 'database',
      label: t('Attach Supabase database'),
    },
    {
      id: 'deploy',
      label: t('Trigger deployment'),
    },
  ], [t])

  const [timeline, setTimeline] = useState<TimelineEntry[]>(
    TIMELINE.map(item => ({
      id: item.id,
      label: item.label,
      status: 'idle',
    })),
  )

  const timelineIntervalRef = useRef<number | null>(null)
  const timelineIndexRef = useRef(0)
  const handleConnectOrSignRef = useRef<
      ((_options?: { autoProgress?: boolean }) => Promise<void>) | null
  >(null)

  useEffect(() => {
    // @ts-expect-error ignore
    setTimeline(previous =>
      previous.map(entry => ({
        ...entry,
        label: TIMELINE.find(item => item.id === entry.id)?.label,
      })),
    )
  }, [TIMELINE])

  const isConnected = account.status === 'connected' && Boolean(account.address)
  const onRequiredChain
    = isConnected && account.chainId !== undefined ? account.chainId === REQUIRED_CHAIN_ID : false

  const step1Complete
    = Boolean(form.env.KUEST_ADDRESS)
      && Boolean(form.env.KUEST_API_KEY)
      && Boolean(form.env.KUEST_API_SECRET)
      && Boolean(form.env.KUEST_PASSPHRASE)
  const vercelOauthConnected = Boolean(oauthStatus?.vercel.connected)
  const vercelOauthIdentity
    = oauthStatus?.vercel.email || oauthStatus?.vercel.login || oauthStatus?.vercel.name || ''
  const vercelConnectionReady = Boolean(vercelConnection?.connected)
  const vercelConnectionIdentity = vercelConnection?.identity?.trim() || ''
  const vercelGitImportReady = Boolean(vercelConnection?.githubImportReady)

  const resolvedProjectSlug = useMemo(() => {
    if (form.projectSlugOverride.trim()) {
      return slugify(form.projectSlugOverride)
    }
    return slugify(form.brandName)
  }, [form.projectSlugOverride, form.brandName])

  const computedSiteUrl = useMemo(() => {
    const siteUrlOverride = normalizeSiteUrl(form.env.SITE_URL)
    if (siteUrlOverride) {
      return siteUrlOverride
    }
    return normalizeSiteUrl(`https://${resolvedProjectSlug}.vercel.app`)
  }, [resolvedProjectSlug, form.env.SITE_URL])

  useEffect(() => {
    return () => {
      if (timelineIntervalRef.current) {
        window.clearInterval(timelineIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    try {
      const raw
        = window.sessionStorage.getItem(FORM_SESSION_STORAGE_KEY)
          || window.sessionStorage.getItem(LEGACY_FORM_SESSION_STORAGE_KEY)
      window.sessionStorage.removeItem(LEGACY_FORM_SESSION_STORAGE_KEY)
      if (!raw) {
        return
      }
      const parsed = JSON.parse(raw) as Partial<
        ReturnType<typeof toPersistableFormState>
      >
      if (!parsed || typeof parsed !== 'object') {
        return
      }

      setForm(previous => ({
        ...previous,
        brandName: typeof parsed.brandName === 'string' ? parsed.brandName : previous.brandName,
        projectSlugOverride:
            typeof parsed.projectSlugOverride === 'string'
              ? parsed.projectSlugOverride
              : previous.projectSlugOverride,
        gitRepo: typeof parsed.gitRepo === 'string' ? parsed.gitRepo : previous.gitRepo,
        gitBranch: typeof parsed.gitBranch === 'string' ? parsed.gitBranch : previous.gitBranch,
        vercelTeamId:
            typeof parsed.vercelTeamId === 'string' ? parsed.vercelTeamId : previous.vercelTeamId,
        supabaseRegion:
            typeof parsed.supabaseRegion === 'string'
              ? parsed.supabaseRegion
              : previous.supabaseRegion,
        supabaseResourceId:
            typeof parsed.supabaseResourceId === 'string'
              ? parsed.supabaseResourceId
              : previous.supabaseResourceId,
        keyNonce: typeof parsed.keyNonce === 'string' ? parsed.keyNonce : previous.keyNonce,
        contactEmail:
            typeof parsed.contactEmail === 'string' ? parsed.contactEmail : previous.contactEmail,
        env: {
          ...previous.env,
          KUEST_ADDRESS:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.KUEST_ADDRESS === 'string'
                ? parsed.env.KUEST_ADDRESS
                : previous.env.KUEST_ADDRESS,
          KUEST_API_KEY:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.KUEST_API_KEY === 'string'
                ? parsed.env.KUEST_API_KEY
                : previous.env.KUEST_API_KEY,
          KUEST_API_SECRET:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.KUEST_API_SECRET === 'string'
                ? parsed.env.KUEST_API_SECRET
                : previous.env.KUEST_API_SECRET,
          KUEST_PASSPHRASE:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.KUEST_PASSPHRASE === 'string'
                ? parsed.env.KUEST_PASSPHRASE
                : previous.env.KUEST_PASSPHRASE,
          ADMIN_WALLETS:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.ADMIN_WALLETS === 'string'
                ? parsed.env.ADMIN_WALLETS
                : previous.env.ADMIN_WALLETS,
          REOWN_APPKIT_PROJECT_ID:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.REOWN_APPKIT_PROJECT_ID === 'string'
                ? parsed.env.REOWN_APPKIT_PROJECT_ID
                : previous.env.REOWN_APPKIT_PROJECT_ID,
          SITE_URL:
              parsed.env
              && typeof parsed.env === 'object'
              && typeof parsed.env.SITE_URL === 'string'
                ? normalizeSiteUrl(parsed.env.SITE_URL)
                : previous.env.SITE_URL,
        },
      }))
      setGithubRepoUrl(typeof parsed.githubRepoUrl === 'string' ? parsed.githubRepoUrl : '')
      setGithubSyncEnabled(parsed.githubSyncEnabled === true)
    }
    catch {
      // keep defaults
    }
  }, [])

  useEffect(() => {
    try {
      const persistable = toPersistableFormState(form, {
        repoUrl: githubRepoUrl,
        syncEnabled: githubSyncEnabled,
      })
      window.sessionStorage.setItem(FORM_SESSION_STORAGE_KEY, JSON.stringify(persistable))
    }
    catch {
      // ignore storage errors
    }
  }, [form, githubRepoUrl, githubSyncEnabled])

  useEffect(() => {
    if (isConnected) {
      setConnectPromptOpen(false)
    }
  }, [isConnected])

  const refreshOAuthStatus = useCallback(async () => {
    setOauthStatusLoading(true)
    try {
      const response = await fetch('/api/oauth/status', {
        cache: 'no-store',
      })
      const json = (await response.json()) as OAuthStatusResponse
      setOauthStatus(json)
      if (response.ok) {
        setOauthStatusError(null)
      }
    }
    catch (error) {
      setOauthStatusError(
        error instanceof Error ? error.message : t('Unable to check OAuth connection status.'),
      )
    }
    finally {
      setOauthStatusLoading(false)
    }
  }, [t])

  const refreshVercelConnection = useCallback(
    async (options?: { silent?: boolean }) => {
      const token = vercelAuthMethod === 'token' ? form.vercelAccessToken.trim() : ''
      const requiresToken = vercelAuthMethod === 'token'
      const requiresOAuth = vercelAuthMethod === 'oauth'

      if (requiresToken && !token) {
        setVercelConnection(null)
        setVercelConnectionError(options?.silent ? null : t('Paste your Vercel Access Token first.'))
        return
      }

      if (requiresOAuth && !vercelOauthConnected) {
        setVercelConnection(null)
        setVercelConnectionError(options?.silent ? null : t('Connect Vercel first.'))
        return
      }

      setVercelConnectionLoading(true)
      if (!options?.silent) {
        setVercelConnectionError(null)
      }

      try {
        const response = await fetch('/api/vercel/connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token || undefined,
          }),
        })

        const json = (await response.json()) as VercelConnectionStatusResponse
        if (!response.ok || !json.connected) {
          setVercelConnection(null)
          setVercelConnectionError(
            json.error ?? t('We could not verify this Vercel connection. Check it and try again.'),
          )
          return
        }

        setVercelConnection(json)
        setVercelConnectionError(null)
      }
      catch (error) {
        setVercelConnection(null)
        setVercelConnectionError(
          error instanceof Error
            ? error.message
            : t('We could not verify this Vercel connection. Check it and try again.'),
        )
      }
      finally {
        setVercelConnectionLoading(false)
      }
    },
    [
      t,
      form.vercelAccessToken,
      vercelAuthMethod,
      vercelOauthConnected,
    ],
  )

  useEffect(() => {
    void refreshOAuthStatus()
  }, [refreshOAuthStatus])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)
    const oauthResult = url.searchParams.get('oauth')
    const oauthError = url.searchParams.get('oauth_error')

    if (!oauthResult && !oauthError) {
      return
    }

    if (oauthResult === 'vercel_connected') {
      setVercelAuthMethod('token')
      setOauthStatusError(t('OAuth is not available right now, use Access Token.'))
    }

    if (oauthError) {
      setOauthStatusError(oauthError)
    }

    url.searchParams.delete('oauth')
    url.searchParams.delete('oauth_error')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [refreshOAuthStatus, t])

  useEffect(() => {
    if (!awaitingVercelGitHubConnection) {
      return
    }

    function handleReconnectCheck() {
      if (document.visibilityState === 'hidden') {
        return
      }
      setAwaitingVercelGitHubConnection(false)
      void refreshVercelConnection({ silent: true })
    }

    window.addEventListener('focus', handleReconnectCheck)
    document.addEventListener('visibilitychange', handleReconnectCheck)

    return () => {
      window.removeEventListener('focus', handleReconnectCheck)
      document.removeEventListener('visibilitychange', handleReconnectCheck)
    }
  }, [awaitingVercelGitHubConnection, refreshVercelConnection])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)
    const githubRepo = url.searchParams.get('github_repo')
    const nextGithubRepoUrl = url.searchParams.get('github_repo_url')
    const nextGithubSync = url.searchParams.get('github_sync')
    const nextGithubError = url.searchParams.get('github_error')

    if (!githubRepo && !nextGithubError) {
      return
    }

    if (githubRepo) {
      setForm(previous => ({
        ...previous,
        gitRepo: githubRepo,
      }))
      setGithubRepoUrl(nextGithubRepoUrl || '')
      setGithubSyncEnabled(nextGithubSync === 'enabled')
      setGithubError(null)
      setIsRedirectingToGitHub(false)
      setActiveStep(2)
    }

    if (nextGithubError) {
      setGithubError(nextGithubError)
      setIsRedirectingToGitHub(false)
      setActiveStep(2)
    }

    url.searchParams.delete('github_repo')
    url.searchParams.delete('github_repo_url')
    url.searchParams.delete('github_sync')
    url.searchParams.delete('github_source')
    url.searchParams.delete('github_error')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  function startGitHubProvisioning() {
    if (!GITHUB_APP_URL) {
      setGithubError('Missing NEXT_PUBLIC_GITHUB_APP_URL.')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    setGithubError(null)
    setIsRedirectingToGitHub(true)

    const returnTo = new URL(window.location.href)
    returnTo.searchParams.delete('github_repo')
    returnTo.searchParams.delete('github_repo_url')
    returnTo.searchParams.delete('github_sync')
    returnTo.searchParams.delete('github_source')
    returnTo.searchParams.delete('github_error')

    const connectUrl = new URL('/connect', GITHUB_APP_URL)
    connectUrl.searchParams.set('return_to', returnTo.toString())

    window.location.assign(connectUrl.toString())
  }

  const disconnectVercelOAuth = useCallback(async () => {
    setOauthStatusError(null)
    setVercelConnection(null)
    setVercelConnectionError(null)
    try {
      await fetch('/api/oauth/vercel/disconnect', {
        method: 'POST',
      })
      setSupabaseResources([])
      setForm(previous => ({
        ...previous,
        supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
      }))
      await refreshOAuthStatus()
    }
    catch (error) {
      setOauthStatusError(
        error instanceof Error ? error.message : t('Failed to disconnect Vercel OAuth.'),
      )
    }
  }, [t, refreshOAuthStatus])

  function startVercelOAuth() {
    setVercelAuthMethod('token')
    setOauthStatusError(t('OAuth is not available right now, use Access Token.'))
  }

  function startVercelGitHubConnect() {
    setAwaitingVercelGitHubConnection(true)
    window.open(VERCEL_GITHUB_APP_URL, '_blank', 'noopener,noreferrer')
  }

  function switchVercelAuthMethod(nextMethod: VercelAuthMethod) {
    if (nextMethod === 'oauth') {
      setVercelAuthMethod('token')
      setOauthStatusError(t('OAuth is not available right now, use Access Token.'))
      return
    }

    setVercelAuthMethod(nextMethod)
    setOauthStatusError(null)
    setVercelConnection(null)
    setVercelConnectionError(null)
    setIsVercelTokenInputFocused(false)
    setSupabaseResources([])
    setForm(previous => ({
      ...previous,
      supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
    }))
  }

  const loadSupabaseResources = useCallback(
    async (options?: { silentIfNoToken?: boolean }) => {
      const token = vercelAuthMethod === 'token' ? form.vercelAccessToken.trim() : ''
      const requiresToken = vercelAuthMethod === 'token'
      const requiresOAuth = vercelAuthMethod === 'oauth'

      if (requiresToken && !token) {
        setSupabaseResources([])
        setForm(previous => ({
          ...previous,
          supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
        }))
        if (!options?.silentIfNoToken) {
          setSupabaseResourcesError(t('Paste your Vercel Access Token first.'))
        }
        else {
          setSupabaseResourcesError(null)
        }
        return
      }
      if (requiresOAuth && !vercelOauthConnected) {
        setSupabaseResources([])
        setForm(previous => ({
          ...previous,
          supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
        }))
        if (!options?.silentIfNoToken) {
          setSupabaseResourcesError(t('Connect Vercel OAuth first.'))
        }
        else {
          setSupabaseResourcesError(null)
        }
        return
      }

      setIsLoadingSupabaseResources(true)
      setSupabaseResourcesError(null)

      try {
        const response = await fetch('/api/vercel/supabase-resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token || undefined,
            teamId: form.vercelTeamId.trim() || undefined,
          }),
        })

        const json = (await response.json()) as SupabaseResourcesResponse
        const resources = Array.isArray(json.resources) ? json.resources : []
        setSupabaseResources(resources)
        setForm(previous => ({
          ...previous,
          supabaseResourceId:
                previous.supabaseResourceId !== SUPABASE_CREATE_NEW_OPTION
                && resources.some(resource => resource.id === previous.supabaseResourceId)
                  ? previous.supabaseResourceId
                  : SUPABASE_CREATE_NEW_OPTION,
        }))

        if (!response.ok) {
          setSupabaseResourcesError(json.error ?? t('Failed to list Supabase databases.'))
        }
        else if (!resources.length) {
          setSupabaseResourcesError(t('No existing database found. You can still create a new one.'))
        }
        else {
          setSupabaseResourcesError(null)
        }
      }
      catch (error) {
        setSupabaseResources([])
        setSupabaseResourcesError(
          error instanceof Error ? error.message : t('Failed to list Supabase databases.'),
        )
      }
      finally {
        setIsLoadingSupabaseResources(false)
      }
    },
    [
      t,
      form.vercelAccessToken,
      form.vercelTeamId,
      vercelAuthMethod,
      vercelOauthConnected,
    ],
  )

  useEffect(() => {
    const tokenReady = Boolean(form.vercelAccessToken.trim()) && !isVercelTokenInputFocused
    const hasAuth
      = vercelAuthMethod === 'oauth' ? vercelOauthConnected : tokenReady

    if (!hasAuth) {
      setVercelConnection(null)
      setVercelConnectionError(null)
      setSupabaseResources([])
      setSupabaseResourcesError(null)
      return
    }

    const timeout = window.setTimeout(() => {
      void refreshVercelConnection({ silent: true })
      if (vercelConnectionReady) {
        void loadSupabaseResources({ silentIfNoToken: true })
      }
    }, 650)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [
    form.vercelAccessToken,
    isVercelTokenInputFocused,
    vercelAuthMethod,
    vercelOauthConnected,
    vercelConnectionReady,
    refreshVercelConnection,
    loadSupabaseResources,
  ])

  function mergeAdminWallets(previousValue: string, walletAddress: string) {
    const normalizedTarget = walletAddress.trim().toLowerCase()
    if (!normalizedTarget) {
      return previousValue
    }
    const values = previousValue
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
    if (values.some(value => value.toLowerCase() === normalizedTarget)) {
      return values.join(',')
    }
    return [...values, walletAddress].join(',')
  }

  function sanitizeNonce(nonce: string) {
    const normalized = nonce.replace(/\D+/g, '')
    return normalized || '0'
  }

  function applyGeneratedCredentials(input: {
    address: string
    apiKey: string
    apiSecret: string
    passphrase: string
  }) {
    setForm(previous => ({
      ...previous,
      env: {
        ...previous.env,
        KUEST_ADDRESS: input.address,
        KUEST_API_KEY: input.apiKey,
        KUEST_API_SECRET: input.apiSecret,
        KUEST_PASSPHRASE: input.passphrase,
        ADMIN_WALLETS: mergeAdminWallets(previous.env.ADMIN_WALLETS, input.address),
      },
    }))

    const hasBrandName = Boolean(form.brandName.trim())
    if (hasBrandName) {
      setActiveStep(2)
    }
    return hasBrandName
  }

  async function saveContactEmailForKey(apiKey: string) {
    const email = form.contactEmail.trim()
    if (!email || !apiKey.trim()) {
      return
    }

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('key_emails').insert({
        api_key: apiKey.trim(),
        email,
      })

      // Duplicate email+key is expected in retries.
      if (error && error.code !== '23505') {
        throw new Error(error.message ?? 'Supabase rejected email save.')
      }
    }
    catch (error) {
      // Email save is optional and must never block key generation.
      console.warn(
        '[launch] Optional email save failed:',
        error instanceof Error ? error.message : error,
      )
    }
  }

  function clearGeneratedCredentials() {
    setForm(previous => ({
      ...previous,
      env: {
        ...previous.env,
        KUEST_ADDRESS: '',
        KUEST_API_KEY: '',
        KUEST_API_SECRET: '',
        KUEST_PASSPHRASE: '',
        ADMIN_WALLETS: '',
      },
    }))
    setWalletInfo(null)
    setWalletError(null)
    setAutoSignAfterConnect(false)
  }

  function handleWalletDisconnect() {
    disconnect()
    clearGeneratedCredentials()
  }

  async function handleGenerateWithInjectedWallet() {
    setWalletActionLoading(true)
    setWalletError(null)
    setWalletInfo(null)

    try {
      const generated = await generateKuestKeysViaWallet({
        nonce: sanitizeNonce(form.keyNonce),
        onStatus: (message) => {
          if (!message) {
            setWalletInfo(null)
            return
          }
          if (message.includes('Minting')) {
            setWalletInfo(t('Creating your account...'))
            return
          }
          if (message.includes('sign')) {
            setWalletInfo(t('Check your wallet and confirm.'))
            return
          }
          setWalletInfo(message)
        },
      })
      const advancedToStep2 = applyGeneratedCredentials(generated)
      void saveContactEmailForKey(generated.apiKey)
      if (advancedToStep2) {
        setWalletInfo(null)
      }
      else {
        setWalletInfo(t('Wallet connected. Enter your site name to continue.'))
      }
    }
    catch (error) {
      setWalletError(
        error instanceof Error ? error.message : t('Failed to generate credentials with browser wallet.'),
      )
    }
    finally {
      setWalletActionLoading(false)
    }
  }

  async function handleEnsureRequiredNetwork() {
    if (!isConnected) {
      throw new Error(t('Connect wallet before switching network.'))
    }
    if (onRequiredChain) {
      return
    }

    if (!switchChain) {
      const provider = readInjectedProvider()
      if (!provider) {
        throw new Error(t('Switch to {network} in your wallet settings.', { network: REQUIRED_CHAIN_LABEL }))
      }
      await ensureRequiredNetworkViaProvider(provider)
      return
    }

    try {
      await switchChain({ chainId: REQUIRED_CHAIN_ID })
    }
    catch {
      const provider = readInjectedProvider()
      if (!provider) {
        throw new Error(t('Unable to switch to {network}.', { network: REQUIRED_CHAIN_LABEL }))
      }
      await ensureRequiredNetworkViaProvider(provider)
    }
  }

  async function handleConnectOrSign(options?: { autoProgress?: boolean }) {
    const autoProgress = options?.autoProgress ?? false

    if (!isAppKitReady) {
      await handleGenerateWithInjectedWallet()
      return
    }

    setWalletError(null)

    if (!isConnected) {
      setWalletInfo(t('Open your wallet and approve the connection.'))
      setConnectPromptOpen(true)
      try {
        await openAppKit()
      }
      catch (error) {
        setConnectPromptOpen(false)
        throw error
      }
      return
    }

    if (!onRequiredChain) {
      setWalletActionLoading(true)
      setWalletInfo(t('Switching to {network}...', { network: REQUIRED_CHAIN_LABEL }))
      try {
        await handleEnsureRequiredNetwork()
        if (!autoProgress) {
          setWalletInfo(t('{network} is active. Click Sign to continue.', { network: REQUIRED_CHAIN_LABEL }))
        }
      }
      finally {
        setWalletActionLoading(false)
      }
      if (!autoProgress) {
        return
      }
    }

    if (!account.address || account.chainId === undefined) {
      throw new Error(t('Wallet connection is not ready.'))
    }

    const nonce = sanitizeNonce(form.keyNonce)
    const nonceBigInt = BigInt(nonce)
    const timestamp = Math.floor(Date.now() / 1000).toString()

    setWalletActionLoading(true)
    setSignPromptOpen(true)
    setWalletInfo(t('Approve one signature to generate credentials.'))

    try {
      const signature = await signTypedDataAsync({
        domain: {
          name: 'ClobAuthDomain',
          version: '1',
          chainId: account.chainId,
        },
        types: {
          ClobAuth: [
            { name: 'address', type: 'address' },
            { name: 'timestamp', type: 'string' },
            { name: 'nonce', type: 'uint256' },
            { name: 'message', type: 'string' },
          ],
        },
        primaryType: 'ClobAuth',
        message: {
          address: account.address,
          timestamp,
          nonce: nonceBigInt,
          message: 'This message attests that I control the given wallet',
        },
      })

      setWalletInfo(t('Minting Kuest credentials...'))
      const generated = await mintKuestKeysFromSignature({
        address: account.address,
        signature,
        timestamp,
        nonce,
      })

      const advancedToStep2 = applyGeneratedCredentials(generated)
      void saveContactEmailForKey(generated.apiKey)
      if (advancedToStep2) {
        setWalletInfo(null)
      }
      else {
        setWalletInfo(t('Wallet connected. Enter your site name to continue.'))
      }
    }
    catch (error) {
      setWalletError(
        error instanceof Error ? error.message : t('Unable to sign and generate keys.'),
      )
    }
    finally {
      setSignPromptOpen(false)
      setWalletActionLoading(false)
    }
  }

  handleConnectOrSignRef.current = handleConnectOrSign

  useEffect(() => {
    if (!autoSignAfterConnect || !isConnected || step1Complete || walletActionLoading) {
      return
    }

    let cancelled = false
    void (async () => {
      try {
        await handleConnectOrSignRef.current?.({ autoProgress: true })
      }
      catch (error) {
        if (!cancelled) {
          setWalletError(
            error instanceof Error ? error.message : t('Unable to continue wallet signing flow.'),
          )
        }
      }
      finally {
        if (!cancelled) {
          setAutoSignAfterConnect(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    t,
    autoSignAfterConnect,
    isConnected,
    step1Complete,
    walletActionLoading,
  ])

  function startTimelineAnimation() {
    if (timelineIntervalRef.current) {
      window.clearInterval(timelineIntervalRef.current)
      timelineIntervalRef.current = null
    }

    timelineIndexRef.current = 0
    setTimeline(
      TIMELINE.map((item, index) => ({
        ...item,
        status: index === 0 ? 'running' : 'idle',
      })),
    )

    timelineIntervalRef.current = window.setInterval(() => {
      timelineIndexRef.current = Math.min(
        timelineIndexRef.current + 1,
        TIMELINE.length - 1,
      )
      setTimeline(previous =>
        previous.map((entry, index) => ({
          ...entry,
          status: mapTimeline(entry.status, index, timelineIndexRef.current),
        })),
      )
    }, 1500)
  }

  function stopTimelineAnimation(success: boolean) {
    if (timelineIntervalRef.current) {
      window.clearInterval(timelineIntervalRef.current)
      timelineIntervalRef.current = null
    }

    if (success) {
      setTimeline(previous =>
        previous.map(entry => ({
          ...entry,
          status: 'done',
        })),
      )
      return
    }

    setTimeline(previous =>
      previous.map((entry, index) => {
        if (index < timelineIndexRef.current) {
          return { ...entry, status: 'done' }
        }
        if (index === timelineIndexRef.current) {
          return { ...entry, status: 'error' }
        }
        return { ...entry, status: 'idle' }
      }),
    )
  }

  function normalizeCustomDomain(value: string) {
    return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
  }

  const handleDomainAction = useCallback(
    async (action: 'add' | 'verify') => {
      if (!result?.ok) {
        return
      }

      const domain = normalizeCustomDomain(customDomain)
      if (!domain) {
        setDomainActionError(t('Enter a domain first.'))
        return
      }

      setDomainActionLoading(action)
      setDomainActionError(null)

      try {
        const token = vercelAuthMethod === 'token' ? form.vercelAccessToken.trim() : undefined
        const response = await fetch('/api/vercel/domain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            token,
            domain,
            projectId: result.projectId,
            projectName: result.projectName || resolvedProjectSlug,
            teamId: result.resolvedTeamId || form.vercelTeamId.trim() || undefined,
          }),
        })

        const json = (await response.json()) as VercelDomainApiResponse
        if (!response.ok || !json.domain) {
          throw new Error(json.error ?? t('Domain action failed.'))
        }

        setDomainState(json.domain)
        setCustomDomain(json.domain.name)
      }
      catch (error) {
        setDomainActionError(
          error instanceof Error ? error.message : t('Domain action failed.'),
        )
      }
      finally {
        setDomainActionLoading(null)
      }
    },
    [
      t,
      customDomain,
      form.vercelAccessToken,
      form.vercelTeamId,
      resolvedProjectSlug,
      result,
      vercelAuthMethod,
    ],
  )

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLaunching(true)
    setRequestError(null)
    setResult(null)
    setDomainState(null)
    setDomainActionError(null)
    setDomainActionLoading(null)
    setCustomDomain('')
    setActiveStep(3)
    startTimelineAnimation()

    try {
      const resolvedVercelToken
        = vercelAuthMethod === 'token' ? form.vercelAccessToken.trim() : undefined
      const env = {
        ...form.env,
        ...parseExtraEnv(form.extraEnvText),
      }
      env.SITE_URL = normalizeSiteUrl(env.SITE_URL)
      const payload = {
        brandName: form.brandName,
        projectName: resolvedProjectSlug,
        gitRepo: form.gitRepo,
        gitBranch: form.gitBranch,
        databaseMode: 'vercel_supabase_integration' as const,
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
        env,
      }

      const response = await fetch('/api/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = (await response.json()) as LaunchResponseBody
      setResult(json)

      if (!response.ok || !json.ok) {
        setRequestError(json.error ?? t('Launch failed.'))
        stopTimelineAnimation(false)
      }
      else {
        stopTimelineAnimation(true)
      }
    }
    catch (error) {
      setRequestError(error instanceof Error ? error.message : t('Failed to call API.'))
      stopTimelineAnimation(false)
    }
    finally {
      setIsLaunching(false)
    }
  }

  const step2GitHubReady = Boolean(form.gitRepo.trim())
  const step3TokenReady = vercelAuthMethod === 'token' && vercelConnectionReady
  const step3VercelAuthReady
    = vercelAuthMethod === 'oauth'
      ? vercelOauthConnected && vercelConnectionReady
      : vercelConnectionReady
  const step3VercelReady = step3VercelAuthReady && vercelGitImportReady
  const step3ReownReady = Boolean(form.env.REOWN_APPKIT_PROJECT_ID.trim())
  const step3DatabaseReady = step3VercelAuthReady && Boolean(form.supabaseResourceId.trim())
  const step2ConnectionsReady
    = step2GitHubReady && step3VercelReady && step3ReownReady && step3DatabaseReady
  const githubStatusText = form.gitRepo.trim()
    ? `${form.gitRepo} ${githubRepoUrl ? copy.githubCreated : copy.githubConnected}`
    : ''
  const vercelGitImportRequiredHint = result?.ok === false && result.hints?.vercelGitImportRequired === true
  const vercelStatusText = step3VercelAuthReady
    ? `${vercelConnectionIdentity || vercelOauthIdentity || maskToken(form.vercelAccessToken)} connected`
    : ''
  const showVercelGitHubButton
    = step2GitHubReady && step3VercelAuthReady && (!vercelGitImportReady || vercelGitImportRequiredHint)
  const vercelCardMessage = vercelConnectionLoading
    ? t('Checking Vercel...')
    : showVercelGitHubButton
      ? t('Connect Vercel to GitHub to continue.')
      : step3VercelReady
        ? t('Vercel is ready for deploys.')
        : step3VercelAuthReady
          ? t('Vercel connected.')
          : null
  const hasSuccessfulDeployment = result?.ok === true

  const stepItems = [
    {
      number: 1,
      title: t('Site + Admin wallet'),
      done: step1Complete && Boolean(form.brandName.trim()),
      active: activeStep === 1,
    },
    {
      number: 2,
      title: copy.connectionsStep,
      done: step2ConnectionsReady,
      active: activeStep === 2,
    },
    {
      number: 3,
      title: t('Deploy'),
      done: Boolean(result?.ok),
      active: activeStep === 3,
    },
  ] as const

  const storedStep1Address = form.env.KUEST_ADDRESS.trim()
  const connectedAddressMatchesStep1
    = !isConnected
      || !account.address
      || storedStep1Address.toLowerCase() === account.address.toLowerCase()
  const showSignedWalletState
    = step1Complete
      && Boolean(storedStep1Address)
      && connectedAddressMatchesStep1
  const brandNameReady = Boolean(form.brandName.trim())
  const step1PrimaryLabel = !isAppKitReady
    ? t('Use browser wallet')
    : !isConnected
        ? t('Connect')
        : !onRequiredChain
            ? t('Switch to {network}', { network: REQUIRED_CHAIN_LABEL })
            : t('Sign')
  const step1WalletLabel = showSignedWalletState
    ? `${shortAddress(storedStep1Address)} · ${account.chain?.name ?? REQUIRED_CHAIN_LABEL}`
    : ''
  const canContinueStep2 = showSignedWalletState && brandNameReady
  const canContinueStep3 = canContinueStep2 && step2ConnectionsReady

  return (
    <form onSubmit={onSubmit} className="launch-shell">
      <div className={`launch-stepper launch-stepper-active-${activeStep}`}>
        {stepItems.map(step => (
          <button
            key={step.number}
            type="button"
            className={`launch-step ${step.active ? 'is-active' : ''} ${step.done ? 'is-done' : ''}`}
            onClick={() => {
              if (step.number === 1) {
                setActiveStep(1)
                return
              }
              if (step.number === 2 && canContinueStep2) {
                setActiveStep(2)
                return
              }
              if (step.number === 3 && canContinueStep3) {
                setActiveStep(3)
              }
            }}
            disabled={
              step.number === 2
                ? !canContinueStep2
                : step.number === 3
                  ? !canContinueStep3
                  : false
            }
          >
            <span className="launch-step-index">{step.number}</span>
            <span className="launch-step-title">{step.title}</span>
          </button>
        ))}
      </div>

      {activeStep === 1 && (
        <section className="launch-island launch-step1-island">
          <h2 className="sr-only">{t('Step 1. Site + Admin wallet')}</h2>

          <div className="launch-grid launch-step1-brand-grid mt-5">
            <label className="launch-field launch-step1-brand-field">
              <span className="launch-field-label">
                <span>{t('Site name')}</span>
                <InfoTip text={t('This is your brand name.')} />
              </span>
              <input
                value={form.brandName}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    brandName: event.target.value,
                  }))}
                placeholder={t('Your Prediction Market Site Name')}
                required
              />
            </label>
          </div>

          <div className="launch-step1-wallet mt-5 rounded-2xl border border-border/70 p-5">
            <div className="launch-step1-wallet-header mb-2 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {t('Admin wallet')}
              </h3>
              <InfoTip text={t('One wallet signature creates your Kuest CLOB credentials. This wallet becomes the admin.')} />
            </div>
            {!isConnected && (
              <div className="launch-step1-wallet-copy">
                <p className="text-xs text-muted-foreground">
                  {t('For the simplest setup, use')}
                  {' '}
                  <a
                    className="launch-link"
                    href="https://metamask.io/download"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="hidden sm:inline!">{t('MetaMask browser extension')}</span>
                    <span className="sm:hidden">{t('MetaMask app')}</span>
                  </a>
                  .
                  {' '}
                  {t('No balance required, no funds moved, no gas fees.')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('We try to switch to Polygon Amoy automatically and add the network when needed.')}
                </p>
              </div>
            )}

            {showSignedWalletState
              ? (
                  <div className="launch-step1-wallet-actions mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="
                      launch-step1-wallet-badge flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5
                    "
                    >
                      <ActionPromptWalletIcon className="size-8" rounded={false} fit="contain" />
                      <p className="text-sm font-semibold text-foreground">{step1WalletLabel}</p>
                    </div>

                    {isConnected && account.address && (
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={handleWalletDisconnect}
                        disabled={disconnectStatus === 'pending'}
                      >
                        {t('Disconnect')}
                      </button>
                    )}
                  </div>
                )
              : (
                  <div className="launch-step1-wallet-actions mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="launch-cta launch-cta-compact"
                      onClick={() => {
                        if (!step1Complete && isAppKitReady && !isConnected) {
                          setAutoSignAfterConnect(true)
                        }
                        void handleConnectOrSign()
                      }}
                      disabled={walletActionLoading}
                    >
                      {walletActionLoading
                        ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2Icon className="size-4 animate-spin" />
                              {t('Working...')}
                            </span>
                          )
                        : (
                            step1PrimaryLabel
                          )}
                    </button>

                    {isConnected && account.address && (
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={handleWalletDisconnect}
                        disabled={disconnectStatus === 'pending'}
                      >
                        {t('Disconnect')}
                      </button>
                    )}
                  </div>
                )}

            {appKitError && !isAppKitReady && (
              <p className="launch-status-note text-sm text-destructive">{appKitError}</p>
            )}
            {walletInfo && <p className="launch-status-note text-sm text-primary">{walletInfo}</p>}
            {walletError && <p className="launch-status-note text-sm text-destructive">{walletError}</p>}
            <div className="launch-step1-advanced mt-4 border-t border-border/60 pt-4">
              <button
                type="button"
                className="
                  launch-step1-advanced-toggle flex w-full items-center justify-between text-left text-sm font-medium
                  text-foreground
                "
                onClick={() => setStep1AdvancedOpen(previous => !previous)}
              >
                <span>{t('Advanced options')}</span>
                <ChevronDownIcon
                  className={`size-4 transition-transform ${step1AdvancedOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {step1AdvancedOpen && (
                <div className="launch-grid launch-step1-advanced-grid mt-4">
                  <label className="launch-field">
                    <span>{t('Email (optional)')}</span>
                    <input
                      type="email"
                      value={form.contactEmail}
                      placeholder={t('you@team.com')}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          contactEmail: event.target.value,
                        }))}
                    />
                  </label>
                  <label className="launch-field">
                    <span>{t('Nonce')}</span>
                    <input
                      value={form.keyNonce}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          keyNonce: event.target.value.replace(/\D+/g, '') || '0',
                        }))}
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="launch-step-actions launch-step-footer launch-step1-actions mt-6">
            <StepFooterLanguageControl />
            <StepFooterBrand />
            <div className="launch-step-footer-control launch-binary-nav">
              <span className="launch-binary-label">{t('Continue')}</span>
              <button type="button" className="launch-choice-button launch-choice-no" disabled>
                <ArrowLeftIcon className="size-3.5" />
                {t('No')}
              </button>
              <button
                type="button"
                className="launch-choice-button launch-choice-yes"
                disabled={!canContinueStep2}
                onClick={() => setActiveStep(2)}
              >
                {t('Yes')}
                <ArrowRightIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {activeStep === 2 && (
        <section className="launch-island launch-step2-island">
          <h2 className="sr-only">{copy.step2Connections}</h2>

          <div className="launch-stack launch-step2-stack mt-5 space-y-3">
            <div className="launch-panel-card launch-step2-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="launch-card-header mb-3 flex items-center justify-between gap-3">
                <ConnectionCardTitle
                  iconSrc="/assets/images/github.svg"
                  iconAlt="GitHub"
                  title="GitHub"
                  infoText={copy.githubInfo}
                />
                {step2GitHubReady
                  ? (
                      <CircleCheckIcon className="size-5 text-primary" />
                    )
                  : (
                      <CircleIcon className="size-5 text-muted-foreground" />
                    )}
              </div>

              <div className="mt-4">
                {step2GitHubReady
                  ? (
                      <div className="launch-field">
                        <input
                          value={githubStatusText}
                          readOnly
                          disabled
                          className="launch-github-status-input"
                        />
                      </div>
                    )
                  : (
                      <button
                        type="button"
                        className="launch-cta launch-cta-compact"
                        onClick={startGitHubProvisioning}
                        disabled={isRedirectingToGitHub}
                      >
                        {isRedirectingToGitHub
                          ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2Icon className="size-4 animate-spin" />
                                {copy.redirecting}
                              </span>
                            )
                          : copy.connectGitHub}
                      </button>
                    )}
              </div>

              {githubError && (
                <p className="launch-helper-text mt-3 text-xs font-medium text-destructive">{githubError}</p>
              )}
            </div>
            <div className="launch-panel-card launch-step2-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="launch-card-header mb-3 flex items-center justify-between gap-3">
                <ConnectionCardTitle
                  iconSrc="/assets/images/vercel.svg"
                  iconAlt="Vercel"
                  title={t('Vercel authentication')}
                  infoText={t('Allow Vercel to import your GitHub repository for deploys.')}
                />
                {step3VercelReady
                  ? (
                      <CircleCheckIcon className="size-5 text-primary" />
                    )
                  : (
                      <CircleIcon className="size-5 text-muted-foreground" />
                    )}
              </div>
              {ALLOW_VERCEL_TOKEN_FALLBACK && !step3VercelAuthReady && (
                <div className="launch-auth-switch mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={() => switchVercelAuthMethod('token')}
                    disabled={vercelAuthMethod === 'token'}
                  >
                    {t('Access Token')}
                  </button>
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={() => switchVercelAuthMethod('oauth')}
                    disabled={vercelAuthMethod === 'oauth'}
                  >
                    {copy.oauthSoon}
                  </button>
                </div>
              )}

              {vercelAuthMethod === 'oauth'
                ? (
                    <>
                      {step3VercelAuthReady
                        ? (
                            <div className="launch-field">
                              <input
                                value={vercelStatusText}
                                readOnly
                                disabled
                                className="launch-github-status-input"
                              />
                            </div>
                          )
                        : (
                            <div className="launch-auth-state flex flex-wrap items-center gap-2">
                              <span className="
                                inline-flex size-7 items-center justify-center rounded-md border border-black bg-black
                              "
                              >
                                <Image
                                  src="/images/vercel.svg"
                                  alt="Vercel"
                                  width={14}
                                  height={14}
                                  className="size-3.5"
                                />
                              </span>
                              {vercelOauthConnected
                                ? (
                                    <span className="text-xs font-medium text-foreground">
                                      {vercelOauthIdentity || t('Connected account')}
                                    </span>
                                  )
                                : (
                                    <span className="text-xs text-muted-foreground">
                                      {t('Not connected')}
                                    </span>
                                  )}

                              {vercelOauthConnected
                                ? (
                                    <button
                                      type="button"
                                      className="launch-mini-button"
                                      onClick={() => {
                                        void disconnectVercelOAuth()
                                      }}
                                      disabled={oauthStatusLoading}
                                    >
                                      {t('Disconnect')}
                                    </button>
                                  )
                                : (
                                    <button
                                      type="button"
                                      className="launch-mini-button"
                                      onClick={startVercelOAuth}
                                      disabled={oauthStatusLoading}
                                    >
                                      {oauthStatusLoading
                                        ? t('Checking...')
                                        : t('Connect Vercel')}
                                    </button>
                                  )}
                            </div>
                          )}
                    </>
                  )
                : (
                    <>
                      {step3TokenReady
                        ? (
                            <div className="launch-stack space-y-3">
                              <div className="launch-field">
                                <input
                                  value={vercelStatusText}
                                  readOnly
                                  disabled
                                  className="launch-github-status-input"
                                />
                              </div>
                              <div className="launch-auth-actions flex flex-wrap gap-2">
                                {showVercelGitHubButton && (
                                  <button
                                    type="button"
                                    className="launch-mini-button"
                                    onClick={startVercelGitHubConnect}
                                  >
                                    {t('Connect Vercel to GitHub')}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="launch-mini-button"
                                  onClick={() => {
                                    setVercelConnection(null)
                                    setVercelConnectionError(null)
                                    setForm(previous => ({
                                      ...previous,
                                      vercelAccessToken: '',
                                      supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
                                    }))
                                  }}
                                >
                                  {t('Disconnect')}
                                </button>
                              </div>
                            </div>
                          )
                        : (
                            <div className="launch-token-entry">
                              <label className="launch-field">
                                <span className="sr-only">{t('Vercel Access Token')}</span>
                                <input
                                  type="password"
                                  value={form.vercelAccessToken}
                                  onChange={(event) => {
                                    setVercelConnection(null)
                                    setVercelConnectionError(null)
                                    setForm(previous => ({
                                      ...previous,
                                      vercelAccessToken: event.target.value,
                                      supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
                                    }))
                                  }}
                                  onFocus={() => setIsVercelTokenInputFocused(true)}
                                  onBlur={() => setIsVercelTokenInputFocused(false)}
                                  placeholder={t('Paste Vercel Access Token')}
                                  required
                                />
                              </label>
                              <p className="launch-helper-text mt-2 text-xs text-muted-foreground">
                                <a
                                  className="launch-link"
                                  href="https://vercel.com/account/tokens"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t('Create token in Vercel')}
                                </a>
                              </p>
                            </div>
                          )}

                    </>
                  )}
              {vercelAuthMethod === 'oauth' && step3VercelAuthReady && (
                <div className="launch-auth-actions flex flex-wrap gap-2">
                  {showVercelGitHubButton && (
                    <button
                      type="button"
                      className="launch-mini-button"
                      onClick={startVercelGitHubConnect}
                    >
                      {t('Connect Vercel to GitHub')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="launch-mini-button"
                    onClick={() => {
                      void disconnectVercelOAuth()
                    }}
                    disabled={oauthStatusLoading}
                  >
                    {t('Disconnect')}
                  </button>
                </div>
              )}
              {vercelCardMessage && !vercelConnectionError && !oauthStatusError && (
                <p className="launch-helper-text text-xs font-medium text-primary/90">{vercelCardMessage}</p>
              )}
              {vercelConnectionError && (
                <p className="launch-helper-text text-xs font-medium text-destructive">{vercelConnectionError}</p>
              )}
              {oauthStatusError && (
                <p className="launch-helper-text text-xs font-medium text-destructive">{oauthStatusError}</p>
              )}
            </div>

            <div className="launch-panel-card launch-step2-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="launch-card-header mb-3 flex items-center justify-between gap-3">
                <ConnectionCardTitle
                  iconSrc="/assets/images/reown.svg"
                  iconAlt="Reown"
                  title={t('Reown Project ID')}
                  infoText={t('Reown Project ID enables wallet login for your end users.')}
                />
                {step3ReownReady
                  ? (
                      <CircleCheckIcon className="size-5 text-primary" />
                    )
                  : (
                      <CircleIcon className="size-5 text-muted-foreground" />
                    )}
              </div>
              <label className="launch-field">
                <span className="sr-only">{t('Reown Project ID')}</span>
                <input
                  value={form.env.REOWN_APPKIT_PROJECT_ID}
                  onChange={event =>
                    setForm(previous => ({
                      ...previous,
                      env: {
                        ...previous.env,
                        REOWN_APPKIT_PROJECT_ID: event.target.value,
                      },
                    }))}
                  placeholder={t('Required')}
                  required
                />
              </label>
              <p className="launch-helper-text mt-2 text-xs text-muted-foreground">
                {t('Get it at')}
                {' '}
                <a
                  className="launch-link"
                  href="https://cloud.reown.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  cloud.reown.com
                </a>
                {' '}
                {t('→ create/select project → copy Project ID.')}
              </p>
            </div>

            <div className="launch-panel-card launch-step2-card rounded-2xl border border-border/70 px-5 py-4">
              <div className="launch-card-header mb-3 flex items-center justify-between gap-3">
                <ConnectionCardTitle
                  iconSrc="/assets/images/supabase.svg"
                  iconAlt="Supabase"
                  title={t('Supabase database')}
                  infoText={t('Supabase stores users, sessions, and app data. It is connected or created through your Vercel integration.')}
                />
                {step3DatabaseReady
                  ? (
                      <CircleCheckIcon className="size-5 text-primary" />
                    )
                  : (
                      <CircleIcon className="size-5 text-muted-foreground" />
                    )}
              </div>
              <div className="launch-field-inline">
                <select
                  className="launch-inline-control"
                  value={form.supabaseResourceId}
                  onChange={event =>
                    setForm(previous => ({
                      ...previous,
                      supabaseResourceId: event.target.value,
                    }))}
                  disabled={isLoadingSupabaseResources}
                >
                  <option value={SUPABASE_CREATE_NEW_OPTION}>
                    {t('CREATE NEW DATABASE')}
                  </option>
                  {supabaseResources.map((resource, index) => (
                    <option key={resource.id} value={resource.id}>
                      {t('SUPABASE DATABASE {index} - {name}', { index: `${index + 1}`, name: resource.name })}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="launch-mini-button"
                  onClick={() => {
                    void loadSupabaseResources()
                  }}
                  disabled={!step3VercelAuthReady || isLoadingSupabaseResources}
                >
                  {isLoadingSupabaseResources
                    ? t('Refreshing...')
                    : t('Refresh')}
                </button>
              </div>
              {supabaseResourcesError && (
                <p className="launch-helper-text text-xs font-medium text-primary/90">{supabaseResourcesError}</p>
              )}
            </div>
          </div>

          <div className="launch-panel-card launch-step2-advanced mt-5 rounded-2xl border border-border/70 px-5 py-4">
            <button
              type="button"
              className="
                launch-step2-advanced-toggle flex w-full items-center justify-between text-left text-sm font-medium
                text-foreground
              "
              onClick={() => setStep2AdvancedOpen(previous => !previous)}
            >
              <span>{t('Advanced options')}</span>
              <ChevronDownIcon
                className={`size-4 transition-transform ${step2AdvancedOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {step2AdvancedOpen && (
              <div className="launch-step2-advanced-body mt-4 border-t border-border/60 pt-4">
                <div className="launch-grid">
                  <label className="launch-field">
                    <span>{t('Project slug (auto)')}</span>
                    <input value={resolvedProjectSlug} readOnly />
                  </label>
                  <label className="launch-field">
                    <span>{t('Project slug override')}</span>
                    <input
                      value={form.projectSlugOverride}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          projectSlugOverride: event.target.value,
                        }))}
                      placeholder={t('optional')}
                    />
                  </label>
                  <label className="launch-field">
                    <span>{t('Repository')}</span>
                    <input
                      value={form.gitRepo}
                      onChange={(event) => {
                        setGithubError(null)
                        setGithubRepoUrl('')
                        setGithubSyncEnabled(false)
                        setForm(previous => ({
                          ...previous,
                          gitRepo: event.target.value,
                        }))
                      }}
                    />
                  </label>
                  <label className="launch-field">
                    <span>{t('Branch')}</span>
                    <input
                      value={form.gitBranch}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          gitBranch: event.target.value,
                        }))}
                    />
                  </label>
                  <label className="launch-field">
                    <span>{t('Vercel Team ID')}</span>
                    <input
                      value={form.vercelTeamId}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          vercelTeamId: event.target.value,
                          supabaseResourceId: SUPABASE_CREATE_NEW_OPTION,
                        }))}
                      placeholder={t('empty = personal account')}
                    />
                  </label>
                  <label className="launch-field">
                    <span>{t('Supabase region')}</span>
                    <input
                      value={form.supabaseRegion}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          supabaseRegion: event.target.value,
                        }))}
                      placeholder="us-east-1"
                    />
                  </label>
                  <label className="launch-field">
                    <span>BETTER_AUTH_SECRET</span>
                    <div className="launch-field-inline">
                      <input
                        value={form.env.BETTER_AUTH_SECRET}
                        onChange={event =>
                          setForm(previous => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              BETTER_AUTH_SECRET: event.target.value,
                            },
                          }))}
                        placeholder={t('empty = auto generated by API')}
                      />
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={() =>
                          setForm(previous => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              BETTER_AUTH_SECRET: randomString(40),
                            },
                          }))}
                      >
                        {t('Generate')}
                      </button>
                    </div>
                  </label>
                  <label className="launch-field">
                    <span>CRON_SECRET</span>
                    <div className="launch-field-inline">
                      <input
                        value={form.env.CRON_SECRET}
                        onChange={event =>
                          setForm(previous => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              CRON_SECRET: event.target.value,
                            },
                          }))}
                        placeholder={t('empty = auto generated by API')}
                      />
                      <button
                        type="button"
                        className="launch-mini-button"
                        onClick={() =>
                          setForm(previous => ({
                            ...previous,
                            env: {
                              ...previous.env,
                              CRON_SECRET: randomString(28),
                            },
                          }))}
                      >
                        {t('Generate')}
                      </button>
                    </div>
                  </label>
                  <label className="launch-field">
                    <span>{t('SITE_URL override')}</span>
                    <input
                      value={form.env.SITE_URL}
                      onChange={event =>
                        setForm(previous => ({
                          ...previous,
                          env: {
                            ...previous.env,
                            SITE_URL: event.target.value,
                          },
                        }))}
                      placeholder={computedSiteUrl}
                    />
                  </label>
                </div>
                <label className="launch-field mt-4">
                  <span>{t('Extra env vars (.env format)')}</span>
                  <textarea
                    value={form.extraEnvText}
                    onChange={event =>
                      setForm(previous => ({
                        ...previous,
                        extraEnvText: event.target.value,
                      }))}
                    rows={5}
                    placeholder={'OPENROUTER_API_KEY=...\nSENTRY_DSN=...'}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="launch-step-actions launch-step-footer mt-6">
            <StepFooterLanguageControl />
            <StepFooterBrand />
            <div className="launch-step-footer-control launch-binary-nav">
              <span className="launch-binary-label">{t('Continue')}</span>
              <button
                type="button"
                className="launch-choice-button launch-choice-no"
                onClick={() => setActiveStep(1)}
              >
                <ArrowLeftIcon className="size-3.5" />
                {t('No')}
              </button>
              <button
                type="button"
                className="launch-choice-button launch-choice-yes"
                disabled={!canContinueStep3}
                onClick={() => setActiveStep(3)}
              >
                {t('Yes')}
                <ArrowRightIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {activeStep === 3 && (
        <section className="launch-island launch-step3-island">
          <h2 className="sr-only">{copy.step3Deploy}</h2>

          <div className="launch-panel-card launch-step3-card mt-5 rounded-2xl border border-border/70 p-5">
            <div className="launch-timeline-list space-y-3">
              {timeline.map(entry => (
                <div key={entry.id} className="launch-timeline-entry flex items-center gap-3 text-sm">
                  <span
                    className={`launch-timeline-dot ${
                      entry.status === 'done'
                        ? 'is-done'
                        : entry.status === 'running'
                          ? 'is-running'
                          : entry.status === 'error'
                            ? 'is-error'
                            : ''
                    }`}
                  >
                    {entry.status === 'done' ? <CheckIcon className="size-3" /> : null}
                  </span>
                  <span
                    className={
                      entry.status === 'error'
                        ? 'text-destructive'
                        : entry.status === 'running'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }
                  >
                    {entry.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="launch-step-actions launch-step-footer mt-6">
              <StepFooterLanguageControl />
              <StepFooterBrand />
              <div className="launch-step-footer-control launch-binary-nav">
                <span className="launch-binary-label">{t('Deploy')}</span>
                <button
                  type="button"
                  className="launch-choice-button launch-choice-no"
                  disabled={hasSuccessfulDeployment}
                  onClick={() => setActiveStep(2)}
                >
                  <ArrowLeftIcon className="size-3.5" />
                  {t('No')}
                </button>
                <button
                  type="submit"
                  className="launch-choice-button launch-choice-yes"
                  disabled={
                    hasSuccessfulDeployment
                    || isLaunching
                    || !canContinueStep3
                  }
                >
                  {isLaunching
                    ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2Icon className="size-4 animate-spin" />
                          {t('Yes')}
                        </span>
                      )
                    : (
                        <>
                          <RocketIcon className="size-3.5" />
                          {t('Yes')}
                        </>
                      )}
                </button>
              </div>
            </div>
          </div>

          {requestError && (
            <div className="
              launch-step3-error mt-5 rounded-xl border border-destructive/45 p-4 text-sm text-destructive
            "
            >
              {requestError}
            </div>
          )}

          {result && (
            <section className="launch-panel-card launch-step3-result mt-5 rounded-2xl border border-border/70 p-5">
              <h3 className="text-base font-semibold text-foreground">{t('Result')}</h3>
              <div className="launch-result-grid mt-3 space-y-2 text-sm text-muted-foreground">
                <div>
                  {t('Status')}
                  :
                  {' '}
                  <strong className={result.ok ? 'text-primary' : 'text-destructive'}>
                    {result.ok ? t('success') : t('failed')}
                  </strong>
                </div>
                <div>
                  {t('Project')}
                  :
                  {' '}
                  <strong>{result.projectName ?? '-'}</strong>
                </div>
                <div>
                  URL:
                  {' '}
                  {result.projectUrl
                    ? (
                        <a className="launch-link" href={result.projectUrl} target="_blank" rel="noreferrer">
                          {result.projectUrl}
                        </a>
                      )
                    : '-'}
                </div>
                <div>
                  {t('Vercel dashboard')}
                  :
                  {' '}
                  {result.vercelDashboardUrl
                    ? (
                        <a
                          className="launch-link"
                          href={result.vercelDashboardUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {result.vercelDashboardUrl}
                        </a>
                      )
                    : '-'}
                </div>
                <div>
                  {t('Supabase dashboard')}
                  :
                  {' '}
                  {result.supabaseDashboardUrl
                    ? (
                        <a
                          className="launch-link"
                          href={result.supabaseDashboardUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {result.supabaseDashboardUrl}
                        </a>
                      )
                    : '-'}
                </div>
                <div>
                  {t('Duration')}
                  :
                  {' '}
                  {Math.round(result.durationMs / 100) / 10}
                  s
                </div>
              </div>

              {result.ok && (
                <div className="launch-subcard mt-5 rounded-xl border border-border/70 p-4!">
                  <div className="flex items-start gap-3">
                    <CircleCheckIcon className="mt-0.5 size-4 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t('Deployment completed successfully. Market events typically begin appearing on your site within 5 to 15 minutes.')}
                    </p>
                  </div>
                </div>
              )}

              {result.ok && result.projectName && (
                <div className="launch-subcard mt-5 rounded-xl border border-border/70 p-4!">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {t('Custom domain (optional)')}
                      </h4>
                      <InfoTip text={t('Use your own domain after deploy. Add it first, then verify DNS records.')} />
                    </div>
                    {domainState && (
                      <span
                        className={`text-xs font-semibold ${
                          domainState.verified ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {domainState.verified
                          ? t('Verified')
                          : t('Pending verification')}
                      </span>
                    )}
                  </div>
                  <div className="launch-field-inline mt-3">
                    <input
                      className="launch-inline-control"
                      value={customDomain}
                      onChange={event => setCustomDomain(event.target.value)}
                      placeholder="app.yourdomain.com"
                    />
                    <button
                      type="button"
                      className="launch-mini-button"
                      onClick={() => {
                        void handleDomainAction('add')
                      }}
                      disabled={domainActionLoading !== null}
                    >
                      {domainActionLoading === 'add'
                        ? t('Adding...')
                        : t('Add domain')}
                    </button>
                    <button
                      type="button"
                      className="launch-mini-button"
                      onClick={() => {
                        void handleDomainAction('verify')
                      }}
                      disabled={domainActionLoading !== null || !customDomain.trim()}
                    >
                      {domainActionLoading === 'verify'
                        ? t('Verifying...')
                        : t('Verify')}
                    </button>
                  </div>
                  {domainActionError && (
                    <p className="mt-2 text-xs font-medium text-primary/90">{domainActionError}</p>
                  )}
                  {domainState && domainState.nameservers && domainState.nameservers.length > 0 && (
                    <div className="
                      launch-subcard mt-3 rounded-lg border border-border/70 px-3 py-2 text-xs text-muted-foreground
                    "
                    >
                      <p className="font-semibold text-foreground">
                        {t('Nameservers to set at your registrar:')}
                      </p>
                      <div className="mt-1 space-y-1">
                        {domainState.nameservers.map(nameServer => (
                          <p key={nameServer} className="font-mono text-[11px]/4">
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
                          key={`${record.type ?? 'record'}-${record.domain ?? 'domain'}-${index}`}
                          className="
                            launch-subcard rounded-lg border border-border/70 px-3 py-2 text-xs text-muted-foreground
                          "
                        >
                          <span className="font-semibold text-foreground">
                            {record.type || 'DNS'}
                            :
                          </span>
                          {' '}
                          {record.domain || '@'}
                          {' '}
                          {'->'}
                          {' '}
                          {record.value || t('check Vercel DNS instructions')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="launch-logs-section mt-5">
                <h4 className="mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                  Logs
                </h4>
                <LogList locale={locale} logs={result.logs} />
              </div>
            </section>
          )}
        </section>
      )}

      <ActionPrompt
        open={connectPromptOpen}
        title={t('Connecting wallet')}
        description={t('Open your wallet and approve the connection to continue.')}
        showConnectedWalletIcon={isAppKitReady}
        allowClose
        onClose={() => setConnectPromptOpen(false)}
      />

      <ActionPrompt
        open={signPromptOpen}
        title={t('Waiting for signature')}
        description={t('Approve the signature in your wallet to continue.')}
        showConnectedWalletIcon={isAppKitReady}
        allowClose
        onClose={() => setSignPromptOpen(false)}
      />
    </form>
  )
}
