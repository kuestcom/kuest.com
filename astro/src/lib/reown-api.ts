import { LaunchError } from '@/lib/launch-utils'

const REOWN_EXPLORER_API_BASE = 'https://explorer-api.walletconnect.com'

export interface ReownConnectionInspection {
  valid: boolean
  error?: string
}

async function parseResponseBody(response: Response) {
  const text = await response.text()
  if (!text.trim()) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  }
  catch {
    return text
  }
}

export async function inspectReownProjectId(projectId: string): Promise<ReownConnectionInspection> {
  const normalizedProjectId = projectId.trim()

  if (!normalizedProjectId) {
    throw new LaunchError('Missing Reown Project ID.', 'validation')
  }

  const response = await fetch(
    `${REOWN_EXPLORER_API_BASE}/v3/chains?projectId=${encodeURIComponent(normalizedProjectId)}`,
    {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    },
  )

  const payload = await parseResponseBody(response)

  if (response.ok) {
    return {
      valid: true,
    }
  }

  if ([400, 401, 403].includes(response.status)) {
    return {
      valid: false,
      error: 'We could not verify this Reown Project ID. Check it and try again.',
    }
  }

  throw new LaunchError(
    'Unable to verify Reown right now. Try again shortly.',
    'reown',
    payload,
  )
}
