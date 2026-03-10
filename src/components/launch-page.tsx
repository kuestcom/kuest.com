"use client";

import BackgroundParticles from "@/components/background-particles";
import LaunchpadForm from "@/components/launchpad-form";
import { useLaunchI18n } from "@/i18n/launch";

export default function LaunchPage() {
  const { messages } = useLaunchI18n();

  return (
    <main className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <BackgroundParticles />

      <section className="relative z-[1] mb-10">
        <h1 className="launch-hero-title text-center">{messages.hero.title}</h1>
        <p className="launch-hero-subtitle mx-auto mt-4 max-w-3xl text-center">
          {messages.hero.subtitle}
        </p>
      </section>

      <div className="relative z-[1] launch-form-intro">
        <LaunchpadForm />
      </div>
    </main>
  );
}
