interface CreateKuestKeyInput {
  address: string;
  signature: string;
  timestamp: string;
  nonce: string;
}

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
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

export const TARGET_CHAIN_MODE =
  process.env.NEXT_PUBLIC_KUEST_CHAIN_MODE === "polygon" ? "polygon" : "amoy";

export const REQUIRED_CHAIN_ID = TARGET_CHAIN_MODE === "polygon" ? 137 : 80002;

export const REQUIRED_CHAIN_LABEL =
  TARGET_CHAIN_MODE === "polygon"
    ? "Polygon Mainnet (137)"
    : "Polygon Amoy Testnet (80002)";

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

function getKuestBaseUrls() {
  const defaults = ["https://clob.kuest.com", "https://relayer.kuest.com"];
  const configured = [process.env.CLOB_URL, process.env.RELAYER_URL]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  const merged = configured.length ? configured : defaults;
  return Array.from(new Set(merged));
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

async function requestKuestKey(baseUrl: string, input: CreateKuestKeyInput) {
  const url = new URL("/auth/api-key", baseUrl);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      KUEST_ADDRESS: input.address,
      KUEST_SIGNATURE: input.signature,
      KUEST_TIMESTAMP: input.timestamp,
      KUEST_NONCE: input.nonce,
    },
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

async function createKuestKey(input: CreateKuestKeyInput) {
  const targets = getKuestBaseUrls();
  const results = await Promise.allSettled(targets.map((baseUrl) => requestKuestKey(baseUrl, input)));
  const fulfilled = results.find(
    (
      result,
    ): result is PromiseFulfilledResult<{ apiKey: string; apiSecret: string; passphrase: string }> =>
      result.status === "fulfilled",
  );
  if (!fulfilled) {
    const firstError = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    const reason = firstError?.reason;
    throw reason instanceof Error ? reason : new Error("Failed to generate API key.");
  }
  return fulfilled.value;
}

export async function mintKuestKeysFromSignature(input: CreateKuestKeyInput) {
  const created = await createKuestKey(input);
  return {
    address: input.address,
    ...created,
  } satisfies GeneratedKuestBundle;
}

export async function ensureRequiredNetworkViaProvider(provider: Eip1193Provider) {
  const chainHexRaw = await provider.request({ method: "eth_chainId" });
  const chainHex = typeof chainHexRaw === "string" ? chainHexRaw : "";
  const chainId = parseInt(chainHex, 16);

  if (chainId === REQUIRED_CHAIN_ID) {
    return;
  }

  const requiredHex = `0x${REQUIRED_CHAIN_ID.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: requiredHex }],
    });
  } catch (error) {
    if (REQUIRED_CHAIN_ID === 80002 && isMissingChainError(error)) {
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
    throw new Error(`Unable to switch to ${REQUIRED_CHAIN_LABEL}.`);
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
  nonce: string;
  onStatus?: (message: string | null) => void;
}) {
  const onStatus = options.onStatus ?? (() => {});
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error("No EVM wallet found. Install MetaMask (or compatible wallet).",);
  }

  const nonce = options.nonce.trim() || "0";
  if (!/^\d+$/.test(nonce)) {
    throw new Error("Nonce must contain digits only.");
  }

  onStatus("Connecting wallet...");
  const accountsRaw = await provider.request({ method: "eth_requestAccounts" });
  const accounts = Array.isArray(accountsRaw) ? accountsRaw : [];
  const address = typeof accounts[0] === "string" ? accounts[0] : "";
  if (!address) {
    throw new Error("Wallet did not return an address.");
  }

  onStatus(`Switching to ${REQUIRED_CHAIN_LABEL}...`);
  await ensureRequiredNetworkViaProvider(provider);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const typedData = {
    domain: {
      name: "ClobAuthDomain",
      version: "1",
      chainId: REQUIRED_CHAIN_ID,
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
      nonce,
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
  const generated = await mintKuestKeysFromSignature({
    address,
    signature,
    timestamp,
    nonce,
  });

  onStatus(null);
  return generated;
}

export function readInjectedProvider() {
  return getInjectedProvider();
}
