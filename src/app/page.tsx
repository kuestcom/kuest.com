import LaunchpadForm from "@/components/launchpad-form";
import { SiteLogoIcon } from "@/components/site-logo-icon";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Kuest";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <section className="mb-10">
        <div className="flex items-center justify-center gap-3 text-foreground">
          <SiteLogoIcon className="size-12 sm:size-14" alt={`${SITE_NAME} logo`} size={56} />
          <span className="text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
            {SITE_NAME}
          </span>
        </div>
        <h1 className="mt-6 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Launch your Prediction Market
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-7 text-muted-foreground sm:text-lg">
          From zero to live in under 15 minutes
        </p>
      </section>

      <LaunchpadForm />
    </main>
  );
}
