import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { mintKuestKeysFromSignature } from './kuest-keygen'

const config = {
  CLOB_URL: 'https://clob.example.com',
  RELAYER_URL: 'https://relayer.example.com',
  KUEST_CHAIN_MODE: 'amoy',
} as const

const input = {
  address: `0x${'1'.repeat(40)}`,
  signature: `0x${'2'.repeat(130)}`,
  timestamp: '1800000000',
  nonce: '0',
}

const credentials = {
  apiKey: 'api-key',
  secret: 'api-secret',
  passphrase: 'passphrase',
}
const staleCredentials = {
  apiKey: 'stale-api-key',
  secret: 'stale-api-secret',
  passphrase: 'stale-passphrase',
}

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status })
}

function getRequestUrl(input: string | URL | Request) {
  if (typeof input === 'string') {
    return input
  }
  return input instanceof URL ? input.toString() : input.url
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Kuest wallet key generation', () => {
  it('creates a new wallet key only on the primary CLOB service and derives it everywhere', async () => {
    let created = false
    const postUrls: string[] = []
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? 'GET'

      if (method === 'POST') {
        postUrls.push(getRequestUrl(input))
        created = true
        return jsonResponse(credentials)
      }
      if (!created) {
        return jsonResponse({ error: 'not found' }, 404)
      }
      return jsonResponse(credentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await mintKuestKeysFromSignature(input, config)

    expect(postUrls).toEqual(['https://clob.example.com/auth/api-key'])
    expect(result).toMatchObject({
      address: input.address,
      apiKey: credentials.apiKey,
      apiSecret: credentials.secret,
      passphrase: credentials.passphrase,
    })
  })

  it('reuses synchronized credentials without creating another key', async () => {
    let postRequests = 0
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        postRequests += 1
      }
      return jsonResponse(credentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    await mintKuestKeysFromSignature(input, config)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(postRequests).toBe(0)
  })

  it('retries a stale relayer credential while a newly created key is propagating', async () => {
    let created = false
    let relayerDeriveAttemptsAfterCreation = 0
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(getRequestUrl(input))
      const method = init?.method ?? 'GET'

      if (method === 'POST') {
        created = true
        return jsonResponse(credentials)
      }
      if (!created) {
        return jsonResponse({ error: 'not found' }, 404)
      }
      if (url.origin === 'https://relayer.example.com') {
        relayerDeriveAttemptsAfterCreation += 1
        if (relayerDeriveAttemptsAfterCreation === 1) {
          return jsonResponse(staleCredentials)
        }
      }
      return jsonResponse(credentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(mintKuestKeysFromSignature(input, config)).resolves.toMatchObject({
      apiKey: credentials.apiKey,
    })
    expect(relayerDeriveAttemptsAfterCreation).toBe(2)
  })

  it('reports a mismatch when every service stays on credentials different from the created key', async () => {
    vi.useFakeTimers()
    let created = false
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? 'GET'

      if (method === 'POST') {
        created = true
        return jsonResponse(credentials)
      }
      return created ? jsonResponse(staleCredentials) : jsonResponse({ error: 'not found' }, 404)
    })
    vi.stubGlobal('fetch', fetchMock)

    const expectation = expect(mintKuestKeysFromSignature(input, config)).rejects.toThrow(
      'mismatched API credentials',
    )
    await vi.runAllTimersAsync()
    await expectation
  })
})
