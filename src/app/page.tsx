import BackgroundParticles from "@/components/background-particles";
import LaunchpadForm from "@/components/launchpad-form";

export default function Home() {
  return (
    <main className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <BackgroundParticles />

      <section className="relative z-[1] mb-10">
        <h1 className="launch-hero-title text-center">
          Launch your Prediction Market
        </h1>
        <p className="launch-hero-subtitle mx-auto mt-4 max-w-3xl text-center">
          From zero to live in under 15 minutes
        </p>
      </section>

      <div className="relative z-[1] launch-form-intro">
        <LaunchpadForm />
      </div>
    </main>
  );
}
