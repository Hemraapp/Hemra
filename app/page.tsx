import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Footer } from "@/components/footer";
import { FutureVisionPreview } from "@/components/future-vision-preview";
import { Header } from "@/components/header";
import { LandingHero } from "@/components/landing-hero";
import { ProblemCards } from "@/components/problem-cards";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <LandingHero />
        <ProblemCards />
        <FutureVisionPreview />
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="max-w-xl">
            <DisclaimerBanner compact />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
