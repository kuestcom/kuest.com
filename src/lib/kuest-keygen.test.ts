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
  it('issues once on each service so a new wallet does not depend on database replication', async () => {
    const requests: string[] = []
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = getRequestUrl(input)
      const method = init?.method ?? 'GET'
      requests.push(`${method} ${url}`)
      return jsonResponse(credentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await mintKuestKeysFromSignature(input, config)

    expect(requests).toEqual([
      'POST https://clob.example.com/auth/api-key',
      'POST https://relayer.example.com/auth/api-key',
    ])
    expect(result).toMatchObject({
      address: input.address,
      apiKey: credentials.apiKey,
      apiSecret: credentials.secret,
      passphrase: credentials.passphrase,
    })
  })

  it('uses the idempotent issue endpoint when credentials already exist', async () => {
    const requests: string[] = []
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      requests.push(`${method} ${getRequestUrl(input)}`)
      return jsonResponse(credentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    await mintKuestKeysFromSignature(input, config)

    expect(requests).toEqual([
      'POST https://clob.example.com/auth/api-key',
      'POST https://relayer.example.com/auth/api-key',
    ])
  })

  it('derives from the relayer when its issue response fails after persisting the key', async () => {
    let relayerDeriveAttempts = 0
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(getRequestUrl(input))
      const method = init?.method ?? 'GET'

      if (method === 'POST' && url.origin === 'https://clob.example.com') {
        return jsonResponse(credentials)
      }
      if (method === 'POST') {
        return jsonResponse({ error: 'response lost' }, 503)
      }
      if (url.origin === 'https://relayer.example.com') {
        relayerDeriveAttempts += 1
        if (relayerDeriveAttempts === 1) {
          return jsonResponse(staleCredentials)
        }
      }
      return jsonResponse(credentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(mintKuestKeysFromSignature(input, config)).resolves.toMatchObject({
      apiKey: credentials.apiKey,
    })
    expect(relayerDeriveAttempts).toBe(2)
  })

  it('reports a mismatch when the relayer issues credentials different from the CLOB', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(getRequestUrl(input))
      return url.origin === 'https://clob.example.com' ? jsonResponse(credentials) : jsonResponse(staleCredentials)
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(mintKuestKeysFromSignature(input, config)).rejects.toThrow('mismatched API credentials')
  })
})
