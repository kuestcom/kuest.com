import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/",
  );
}
