import type { AstroCookies } from 'astro'
import { AsyncLocalStorage } from 'node:async_hooks'

const requestStore = new AsyncLocalStorage<{ cookies: AstroCookies }>()

export function runWithRequestContext<T>(cookies: AstroCookies, callback: () => T) {
  return requestStore.run({ cookies }, callback)
}

export function getRequestCookies() {
  const store = requestStore.getStore()
  if (!store) {
    throw new Error('Request cookies were accessed outside an Astro API request.')
  }
  return store.cookies
}
