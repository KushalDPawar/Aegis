"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { runScenarioAction } from "@/lib/actions/lab";
import type { ScenarioCode } from "@/lib/scenarios/definitions";
import { formatINR } from "@/lib/format";

interface ScenarioCard {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  amount: number;
  outcome: string;
}

const OUTCOME_TONE: Record<string, string> = {
  PAUSE: "text-signal-crimson border-signal-crimson/40",
  WARN: "text-signal-coral border-signal-coral/40",
  COOLING_PERIOD: "text-signal-coral border-signal-coral/40",
  VERIFY: "text-signal-amber border-signal-amber/40",
  ALLOW: "text-signal-jade border-signal-jade/40",
};

/**
 * Launches a scripted case against the real engine.
 *
 * `runScenarioAction` is the same server action the customer-facing Lab uses,
 * so a run here is indistinguishable from one started by a customer — which is
 * the point: an operator testing the system should be exercising the code path
 * that actually runs in production, not a console-only imitation of it.
 */
export function ScenarioLauncher({ scenarios }: { scenarios: ScenarioCard[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(code: string) {
    setError(null);
    setRunning(code);
    startTransition(async () => {
      const result = await runScenarioAction(code as ScenarioCode);
      setRunning(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section>
      {error && (
        <p className="value-in mb-4 rounded-xl border border-signal-coral/30 bg-signal-coral/[0.07] px-4 py-3 text-xs text-signal-coral">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => {
          const busy = running === s.code && pending;
          return (
            <article key={s.code} className="glass-panel rounded-2xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/35">
                  {formatINR(s.amount)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${OUTCOME_TONE[s.outcome] ?? "text-cream-100/50 border-white/15"}`}
                >
                  {s.outcome}
                </span>
              </div>
              <h3 className="font-display text-base font-medium text-cream-100 mt-3">{s.title}</h3>
              <p className="font-mono text-[10px] text-cream-100/40 mt-1.5">{s.subtitle}</p>
              <p className="text-xs text-cream-100/55 mt-3 leading-relaxed flex-1">{s.description}</p>
              <button
                onClick={() => run(s.code)}
                disabled={pending}
                className="mt-4 w-full rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs text-cream-100/85 hover:border-signal-teal/50 hover:text-cream-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {busy ? "Running through engine…" : "Run case"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
