import { useSyncExternalStore } from 'react'

function subscribe() {
  return function unsubscribe() {
    return undefined
  }
}

export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/',
  )
}
