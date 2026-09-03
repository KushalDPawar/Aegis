import { PIPELINE_STEPS, GOVERNANCE_PILLARS, TOTAL_LATENCY_MS } from "@/lib/ai/pipeline";
import { getSignalCategoryWeights, getActionDistribution } from "@/lib/queries/console";
import { Panel, ActionBadge, EmptyState } from "@/components/console/primitives";
import { PipelineVisualizer } from "@/components/console/PipelineVisualizer";

export const dynamic = "force-dynamic";

const TONE: Record<string, string> = {
  cyan: "text-signal-cyan border-signal-cyan/30",
  emerald: "text-signal-jade border-signal-jade/30",
  amber: "text-signal-amber border-signal-amber/30",
  rose: "text-signal-coral border-signal-coral/30",
};

const CATEGORY_LABEL: Record<string, string> = {
  TRANSACTION: "Transaction",
  BENEFICIARY: "Beneficiary",
  BEHAVIORAL: "Behavioral",
  CONTEXT: "Context",
  SOCIAL_ENGINEERING: "Social engineering",
};

export default async function IntelligenceCentrePage() {
  const [weights, actions] = await Promise.all([getSignalCategoryWeights(), getActionDistribution()]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70">Intelligence Centre</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100 mt-1.5">How Aegis decides</h1>
        <p className="text-sm text-cream-100/50 mt-1.5 max-w-2xl">
          Six layers between a payment arriving and a decision being made, and the constraints each one operates under.
          Every layer names where it lives in this codebase — the architecture is inspectable, not asserted.
        </p>
      </header>

      <PipelineVisualizer steps={PIPELINE_STEPS} totalLatencyMs={TOTAL_LATENCY_MS} />

      {/* ---------------- What the model is actually weighting ---------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel eyebrow="Live model" title="What is carrying the decisions">
          {weights.length === 0 ? (
            <EmptyState title="No signals recorded yet" />
          ) : (
            <>
              <p className="text-xs text-cream-100/45 mb-4 leading-relaxed">
                Total contribution by signal dimension across every assessment on record — measured, not configured.
              </p>
              <ul className="space-y-3">
                {weights.map((w) => (
                  <li key={w.category}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-cream-100/80">{CATEGORY_LABEL[w.category] ?? w.category}</span>
                      <span className="font-mono text-xs text-cream-100/55 tabular-nums">
                        {w.share}% · {w.occurrences} signal{w.occurrences === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-signal-cyan/60"
                        style={{ width: `${w.share}%`, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel eyebrow="Layer 6" title="Friction actually applied">
          {actions.total === 0 ? (
            <EmptyState title="No assessments scored yet" />
          ) : (
            <>
              <p className="text-xs text-cream-100/45 mb-4 leading-relaxed">
                A healthy distribution leans toward the lighter actions. If PAUSE dominates, the system is excluding
                people rather than protecting them.
              </p>
              <ul className="space-y-3">
                {actions.rows
                  .slice()
                  .sort((a, b) => b.count - a.count)
                  .map((r) => {
                    const pct = Math.round((r.count / actions.total) * 100);
                    return (
                      <li key={r.action}>
                        <div className="flex items-center justify-between gap-3">
                          <ActionBadge action={r.action} />
                          <span className="font-mono text-xs text-cream-100/60 tabular-nums">
                            {r.count} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-signal-teal/70"
                            style={{ width: `${pct}%`, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
        </Panel>
      </div>

      {/* ---------------- Governance ---------------- */}
      <section>
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal-teal/70">Governance</p>
          <h2 className="font-display text-lg font-medium text-cream-100 mt-1">Constitutional AI safeguards</h2>
          <p className="text-sm text-cream-100/50 mt-1.5 max-w-2xl">
            The principles that constrain what the system is allowed to do — the reason friction is proportionate rather
            than absolute.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {GOVERNANCE_PILLARS.map((p) => (
            <article key={p.title} className={`glass-panel rounded-2xl p-5 border-l-2 ${TONE[p.tone]}`}>
              <h3 className={`font-display text-base font-medium ${TONE[p.tone].split(" ")[0]}`}>{p.title}</h3>
              <p className="text-sm text-cream-100/55 mt-2.5 leading-relaxed">{p.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
