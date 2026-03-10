import type { Metadata } from "next";
import { geistMono, openSauceOne } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Kuest";

export const metadata: Metadata = {
  title: `${siteName} Create Prediction Market`,
  description:
    "Guided Kuest launch flow with wallet, Vercel, and Supabase integration.",
  icons: {
    icon: "/images/kuest-logo.svg",
    shortcut: "/images/kuest-logo.svg",
    apple: "/images/kuest-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSauceOne.variable} ${geistMono.variable}`}
      data-theme-mode="dark"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
