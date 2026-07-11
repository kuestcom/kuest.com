import type { PublicRuntimeConfig } from "@/lib/runtime-config";

type KuestRuntimeConfig = Pick<
  PublicRuntimeConfig,
  "CLOB_URL" | "KUEST_CHAIN_MODE" | "RELAYER_URL"
>;

interface CreateKuestKeyInput {
  address: string;
  signature: string;
  timestamp: string;
  nonce: string;
}

interface Eip1193Provider {
  request: (_args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface ErrorWithCode extends Error {
  code?: number;
  cause?: unknown;
}

export interface GeneratedKuestBundle {
  address: string;
  apiKey: string;
  apiSecret: string;
  passphrase: string;
}

type KuestKeyCredential = Omit<GeneratedKuestBundle, "address">;

export const DEFAULT_KUEST_KEY_NONCE = "0";

export function getRequiredChainId(config: KuestRuntimeConfig) {
  return config.KUEST_CHAIN_MODE === "polygon" ? 137 : 80002;
}

export function getRequiredChainLabel(config: KuestRuntimeConfig) {
  return config.KUEST_CHAIN_MODE === "polygon"
    ? "Polygon Mainnet (137)"
    : "Polygon Amoy Testnet (80002)";
}

const AMOY_CHAIN_HEX = "0x13882";
const AMOY_ADD_PARAMS = {
  chainId: AMOY_CHAIN_HEX,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

function getKuestBaseUrls(config: KuestRuntimeConfig) {
  return Array.from(new Set([config.CLOB_URL, config.RELAYER_URL]));
}

function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") {
    return null;
  }

  const maybeWindow = window as Window & {
    ethereum?: Eip1193Provider & { providers?: Eip1193Provider[] };
  };

  const providers = maybeWindow.ethereum?.providers;
  if (Array.isArray(providers) && providers.length) {
    const firstValid = providers.find(
      (provider) => provider && typeof provider.request === "function",
    );
    if (firstValid) {
      return firstValid;
    }
  }

  const maybeProvider = maybeWindow.ethereum;
  if (!maybeProvider || typeof maybeProvider.request !== "function") {
    return null;
  }
  return maybeProvider;
}

function isMissingChainError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }
  const candidate = error as ErrorWithCode;
  const cause = candidate.cause as { code?: number; message?: string } | undefined;
  const message = candidate.message.toLowerCase();
  const causeMessage = cause?.message?.toLowerCase() ?? "";

  return (
    candidate.code === 4902 ||
    cause?.code === 4902 ||
    message.includes("4902") ||
    causeMessage.includes("4902") ||
    message.includes("unrecognized chain") ||
    causeMessage.includes("unrecognized chain")
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function sanitizeKuestMessage(status: number | undefined, rawMessage?: string) {
  const normalized = (rawMessage ?? "").replace(/\s+/g, " ").trim();
  if (status === 401 || status === 403) {
    return "Credentials rejected by Kuest. Generate a fresh API key and try again.";
  }
  if (status === 429) {
    return "Too many requests. Hold on a moment before retrying.";
  }
  if (status === 500 || status === 503) {
    return "Kuest is temporarily unavailable. Retry shortly.";
  }
  if (normalized) {
    return normalized.slice(0, 200);
  }
  return "Kuest request failed. Please try again.";
}

function normalizeKeyBundle(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected response when minting API key.");
  }
  const record = payload as Record<string, unknown>;
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const apiKey = typeof data.apiKey === "string" && data.apiKey ? data.apiKey : undefined;
  const apiSecret = typeof data.secret === "string" && data.secret ? data.secret : undefined;
  const passphrase =
    typeof data.passphrase === "string" && data.passphrase ? data.passphrase : undefined;

  if (!apiKey || !apiSecret || !passphrase) {
    throw new Error("Kuest did not return API credentials.");
  }
  return { apiKey, apiSecret, passphrase };
}

async function requestKuestKey(
  baseUrl: string,
  input: CreateKuestKeyInput,
  options: {
    path: "/auth/api-key" | "/auth/derive-api-key";
    method: "POST" | "GET";
  } = { path: "/auth/api-key", method: "POST" },
) {
  const url = new URL(options.path, baseUrl);
  const response = await fetch(url.toString(), {
    method: options.method,
    headers: {
      KUEST_ADDRESS: input.address,
      KUEST_SIGNATURE: input.signature,
      KUEST_TIMESTAMP: input.timestamp,
      KUEST_NONCE: input.nonce,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Failed to generate API key.";
    try {
      const payload = (await response.json()) as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? message;
    } catch {}
    throw new Error(sanitizeKuestMessage(response.status, message));
  }

  const payload = (await response.json()) as unknown;
  return normalizeKeyBundle(payload);
}

async function deriveKuestKey(baseUrl: string, input: CreateKuestKeyInput) {
  return requestKuestKey(baseUrl, input, {
    path: "/auth/derive-api-key",
    method: "GET",
  });
}

async function createOrDeriveKuestKey(baseUrl: string, input: CreateKuestKeyInput) {
  try {
    return await requestKuestKey(baseUrl, input);
  } catch (createError) {
    try {
      return await deriveKuestKey(baseUrl, input);
    } catch {
      throw createError;
    }
  }
}

function assertMatchingKuestCredentials(credentials: KuestKeyCredential[]) {
  const [first, ...rest] = credentials;
  if (!first) {
    throw new Error("Failed to generate API key.");
  }

  const mismatch = rest.find(
    (credential) =>
      credential.apiKey !== first.apiKey ||
      credential.apiSecret !== first.apiSecret ||
      credential.passphrase !== first.passphrase,
  );
  if (mismatch) {
    throw new Error("Kuest services returned mismatched API credentials.");
  }

  return first;
}

async function createKuestKey(input: CreateKuestKeyInput, config: KuestRuntimeConfig) {
  const targets = getKuestBaseUrls(config);
  const credentials = await Promise.all(
    targets.map((baseUrl) => createOrDeriveKuestKey(baseUrl, input)),
  );
  return assertMatchingKuestCredentials(credentials);
}

export async function mintKuestKeysFromSignature(
  input: CreateKuestKeyInput,
  config: KuestRuntimeConfig,
) {
  const created = await createKuestKey(input, config);
  return {
    address: input.address,
    ...created,
  } satisfies GeneratedKuestBundle;
}

export async function ensureRequiredNetworkViaProvider(
  provider: Eip1193Provider,
  config: KuestRuntimeConfig,
) {
  const requiredChainId = getRequiredChainId(config);
  const requiredChainLabel = getRequiredChainLabel(config);
  const chainHexRaw = await provider.request({ method: "eth_chainId" });
  const chainHex = typeof chainHexRaw === "string" ? chainHexRaw : "";
  const chainId = Number.parseInt(chainHex, 16);

  if (chainId === requiredChainId) {
    return;
  }

  const requiredHex = `0x${requiredChainId.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: requiredHex }],
    });
  } catch (error) {
    if (requiredChainId === 80002 && isMissingChainError(error)) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [AMOY_ADD_PARAMS],
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_HEX }],
      });
      return;
    }
    throw new Error(`Unable to switch to ${requiredChainLabel}.`);
  }
}

async function signTypedDataWithFallback(params: {
  provider: Eip1193Provider;
  address: string;
  typedData: Record<string, unknown>;
}) {
  const { provider, address, typedData } = params;
  const typedDataJson = JSON.stringify(typedData);

  const attempts: Array<{ method: string; params: unknown[] }> = [
    {
      method: "eth_signTypedData_v4",
      params: [address, typedDataJson],
    },
    {
      method: "eth_signTypedData_v3",
      params: [address, typedDataJson],
    },
    {
      method: "eth_signTypedData",
      params: [address, typedData],
    },
    {
      method: "eth_signTypedData",
      params: [typedData, address],
    },
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const signatureRaw = await provider.request({
        method: attempt.method,
        params: attempt.params,
      });
      if (typeof signatureRaw === "string" && signatureRaw.trim()) {
        return signatureRaw;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(getErrorMessage(lastError, "Wallet did not return a typed-data signature."));
}

export async function generateKuestKeysViaWallet(options: {
  onStatus?: (_message: string | null) => void;
  runtimeConfig: KuestRuntimeConfig;
}) {
  const onStatus = options.onStatus ?? (() => {});
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error("No EVM wallet found. Install MetaMask (or compatible wallet).");
  }

  onStatus("Connecting wallet...");
  const accountsRaw = await provider.request({ method: "eth_requestAccounts" });
  const accounts = Array.isArray(accountsRaw) ? accountsRaw : [];
  const address = typeof accounts[0] === "string" ? accounts[0] : "";
  if (!address) {
    throw new Error("Wallet did not return an address.");
  }

  const requiredChainId = getRequiredChainId(options.runtimeConfig);
  const requiredChainLabel = getRequiredChainLabel(options.runtimeConfig);
  onStatus(`Switching to ${requiredChainLabel}...`);
  await ensureRequiredNetworkViaProvider(provider, options.runtimeConfig);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const typedData = {
    domain: {
      name: "ClobAuthDomain",
      version: "1",
      chainId: requiredChainId,
    },
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
      ],
      ClobAuth: [
        { name: "address", type: "address" },
        { name: "timestamp", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "message", type: "string" },
      ],
    },
    primaryType: "ClobAuth",
    message: {
      address,
      timestamp,
      nonce: DEFAULT_KUEST_KEY_NONCE,
      message: "This message attests that I control the given wallet",
    },
  } as const;

  onStatus("Open your wallet and sign...");
  const signature = await signTypedDataWithFallback({
    provider,
    address,
    typedData: typedData as unknown as Record<string, unknown>,
  });

  onStatus("Minting Kuest credentials...");
  const generated = await mintKuestKeysFromSignature(
    {
      address,
      signature,
      timestamp,
      nonce: DEFAULT_KUEST_KEY_NONCE,
    },
    options.runtimeConfig,
  );

  onStatus(null);
  return generated;
}

export function readInjectedProvider() {
  return getInjectedProvider();
}
