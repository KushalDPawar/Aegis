import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { TiltCard } from "@/components/marketing/TiltCard";
import { ScenarioCarousel, type ScenarioSlide } from "@/components/marketing/ScenarioCarousel";
import { ReachSection } from "@/components/marketing/ReachSection";
import { SCENARIOS } from "@/lib/scenarios/definitions";

/**
 * The carousel shows the Scenario Lab's real cases. Deriving the slim slide
 * shape here (rather than importing SCENARIOS into the client component) keeps
 * the timelines, scripted answers and signal fixtures out of the browser
 * bundle — the landing page only needs four strings per case.
 *
 * The verdict badge is the leading token of each scenario's own
 * `expectedOutcome`, so it can never drift from what the Lab actually does.
 */
const SCENARIO_SLIDES: ScenarioSlide[] = SCENARIOS.map((s) => ({
  code: s.code,
  title: s.title,
  subtitle: s.subtitle,
  description: s.description,
  outcome: s.expectedOutcome.split(/[\s—]/)[0].trim(),
}));

export default function LandingPage() {
  return (
    <div className="relative">
      <Hero />

      {/* ---------------------------------------------------------------- */}
      {/* What it is                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative bg-ink-950 px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-4">How Aegis thinks</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-cream-100 max-w-2xl">
              Not a fraud detector. A decision-security system.
            </h2>
            <p className="text-cream-100/55 max-w-xl mt-4">
              A legitimate customer can be authenticated, on their real device, with the correct OTP — and still be
              manipulated. Aegis evaluates both axes independently.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {[
              {
                step: "01",
                title: "Prevent",
                copy: "Sentinel fuses transaction, beneficiary, behavioral, and context signals into an explainable risk score — before money moves.",
              },
              {
                step: "02",
                title: "Protect",
                copy: "MIND asks short, adaptive questions when human-factor risk is high. GUARD applies proportionate friction, never blanket blocking.",
              },
              {
                step: "03",
                title: "Recover",
                copy: "Every incident opens an auditable case. Financial Continuity Mode keeps essential banking alive while a review is underway.",
              },
            ].map((card, i) => (
              <ScrollReveal key={card.step} delay={i * 80}>
                <TiltCard className="glass-panel rounded-2xl p-7 h-full">
                  <span className="font-mono text-xs text-signal-teal/70">{card.step}</span>
                  <h3 className="font-display text-xl font-medium text-cream-100 mt-3">{card.title}</h3>
                  <p className="text-sm text-cream-100/55 mt-3 leading-relaxed">{card.copy}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Scenario carousel                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative bg-ink-950 px-6 lg:px-10 pb-24 lg:pb-32">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-4">Scenario Lab</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-cream-100 max-w-2xl">
              The same customer. The same amount. Opposite outcomes.
            </h2>
            <p className="text-cream-100/55 max-w-xl mt-4">
              Every case below is scripted and reproducible. Drag to compare how proportionate the response is when the
              human factor changes but the transaction does not.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={120} className="mt-14">
            <ScenarioCarousel slides={SCENARIO_SLIDES} />
          </ScrollReveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Pull quote                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative border-y border-white/8 bg-ink-900 px-6 py-24 lg:py-32">
        <ScrollReveal>
          <blockquote className="max-w-4xl mx-auto text-center">
            <p className="font-display text-2xl sm:text-4xl lg:text-5xl font-medium text-cream-100 leading-[1.15] text-balance">
              &ldquo;Authentication is not the same thing as intent. A transaction can be technically valid while a
              customer&apos;s decision is completely compromised.&rdquo;
            </p>
            <cite className="block font-mono text-xs uppercase tracking-[0.2em] text-cream-100/40 mt-8 not-italic">
              Aegis Decision Integrity Engine
            </cite>
          </blockquote>
        </ScrollReveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing statement — the page's only light surface                 */}
      {/* ---------------------------------------------------------------- */}
      <ReachSection />

      <footer className="relative bg-ink-950 px-6 lg:px-10 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-semibold text-cream-100">Aegis</span>
          <p className="text-xs text-cream-100/35 font-mono">
            © {new Date().getFullYear()} Aegis Prototype · Simulation only · No real accounts connected
          </p>
          <div className="flex gap-5 text-xs text-cream-100/45">
            <Link href="/status" className="hover:text-cream-100 transition-colors">
              System Status
            </Link>
            <Link href="/impact" className="hover:text-cream-100 transition-colors">
              Impact
            </Link>
            <Link href="/lab" className="hover:text-cream-100 transition-colors">
              Scenario Lab
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
