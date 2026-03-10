import type { ReactNode } from "react";
import { AppProviders } from "@/providers/app-providers";

export default function DefaultAppRouteLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
