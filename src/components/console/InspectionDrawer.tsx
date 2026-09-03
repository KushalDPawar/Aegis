"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { TransactionInspection } from "@/lib/queries/console";
import { AxisBar, IntegrityGauge, RiskBadge, StatusBadge, ActionBadge, Money } from "./primitives";
import { formatDateTime } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  TRANSACTION: "Transaction",
  BENEFICIARY: "Beneficiary",
  BEHAVIORAL: "Behavioral",
  CONTEXT: "Context",
  SOCIAL_ENGINEERING: "Social engineering",
};

/**
 * Slide-over inspection of a single payment.
 *
 * Ordered to match how the decision was actually made: what the money was,
 * who it was going to, what each axis contributed, which individual signals
 * fired, and only then what Aegis did about it. Leading with the verdict would
 * invite an operator to rubber-stamp it rather than read the evidence.
 */
export function InspectionDrawer({
  inspection,
  backHref = "/console/fraud",
}: {
  inspection: TransactionInspection;
  backHref?: string;
}) {
  const router = useRouter();

  const close = () => router.push(backHref);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const a = inspection.assessment;

  return (
    <>
      <button aria-label="Close inspection" onClick={close} className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm" />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto scrollbar-thin border-l border-white/10 bg-ink-900 drawer-in">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/8 bg-ink-900/95 backdrop-blur-xl px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal-teal/70">Inspection</p>
            <h2 className="font-display text-xl font-semibold text-cream-100 mt-1 tabular-nums">
              <Money value={inspection.amount} />
            </h2>
            <p className="text-xs text-cream-100/45 mt-1">
              {inspection.customer.name} <span className="text-cream-100/30">→</span> {inspection.beneficiary.name}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-lg border border-white/12 p-1.5 text-cream-100/60 hover:text-cream-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="px-6 py-5 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={inspection.status} />
            <RiskBadge level={a?.overallLevel ?? null} />
            {a && <ActionBadge action={a.recommendedAction} />}
            {inspection.scenarioCode && (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35 border border-white/10 rounded-full px-2.5 py-0.5">
                {inspection.scenarioCode.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {/* ---------------- Context ---------------- */}
          <section className="grid sm:grid-cols-2 gap-3">
            <Field label="Purpose" value={inspection.purpose} />
            <Field label="Initiated" value={formatDateTime(inspection.createdAt)} />
            <Field
              label="Customer"
              value={`${inspection.customer.name}${inspection.customer.age ? `, ${inspection.customer.age}` : ""}`}
              hint={inspection.customer.vulnerabilityProfile}
              hintTone={inspection.customer.vulnerabilityProfile !== "STANDARD" ? "warn" : undefined}
            />
            <Field
              label="Beneficiary"
              value={inspection.beneficiary.name}
              hint={`${inspection.beneficiary.isFirstTime ? "First-time payee" : "Known payee"} · trust ${inspection.beneficiary.trustScore}/100`}
              hintTone={inspection.beneficiary.suspiciousFlag ? "bad" : inspection.beneficiary.isFirstTime ? "warn" : undefined}
            />
          </section>

          {!a ? (
            <p className="rounded-xl border border-dashed border-white/12 px-4 py-6 text-center text-sm text-cream-100/50">
              This payment has not been scored.
            </p>
          ) : (
            <>
              {/* ---------------- Two-axis verdict ---------------- */}
              <section className="glass-panel rounded-2xl p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal-teal/70 mb-3">
                  Decision integrity
                </p>
                <IntegrityGauge value={a.decisionIntegrity} riskLabel={a.decisionIntegrityLabel} />
                <p className="text-xs text-cream-100/50 leading-relaxed mt-3">
                  Higher is healthier: it scores how sound the customer&apos;s decision looked, independently of whether
                  the transaction itself was valid.
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3.5 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/45">
                    Overall verdict
                  </span>
                  <RiskBadge level={a.overallLevel} />
                </div>
                <p className="text-xs text-cream-100/45 leading-relaxed mt-2">
                  The verdict takes the worse of the two axes — a sound-looking decision does not clear a payment whose
                  transaction signals are severe.
                </p>
              </section>

              {/* ---------------- Axis contributions ---------------- */}
              <section>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40 mb-3">
                  Risk by dimension
                </p>
                <div className="space-y-3">
                  <AxisBar label="Transaction" value={a.transactionRisk} />
                  <AxisBar label="Beneficiary" value={a.beneficiaryRisk} />
                  <AxisBar label="Behavioral" value={a.behavioralRisk} />
                  <AxisBar label="Context" value={a.contextRisk} />
                  <AxisBar label="Social engineering" value={a.socialEngineeringRisk} />
                </div>
              </section>

              {/* ---------------- Signals ---------------- */}
              <section>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40 mb-3">
                  Signals fired ({a.signals.length})
                </p>
                {a.signals.length === 0 ? (
                  <p className="text-xs text-cream-100/40">No individual signals recorded.</p>
                ) : (
                  <ul className="space-y-2">
                    {a.signals
                      .slice()
                      .sort((x, y) => y.contribution - x.contribution)
                      .map((s) => (
                        <li key={s.code} className="rounded-xl border border-white/8 px-3.5 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-cream-100">{s.label}</p>
                              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cream-100/35 mt-0.5">
                                {CATEGORY_LABEL[s.category] ?? s.category} · {s.confidence}
                              </p>
                            </div>
                            <span className="font-mono text-xs tabular-nums text-signal-amber shrink-0">
                              +{s.contribution}
                            </span>
                          </div>
                          <p className="text-xs text-cream-100/50 mt-2 leading-relaxed">{s.detail}</p>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* ---------------- Decision path ---------------- */}
          {(inspection.events.length > 0 || inspection.interventions.length > 0) && (
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40 mb-3">Decision path</p>
              <ol className="relative border-l border-white/10 pl-5 space-y-4">
                {inspection.events.map((e, i) => (
                  <li key={`e${i}`} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
                    <p className="text-sm text-cream-100/85">{e.label}</p>
                    <p className="text-xs text-cream-100/45 mt-0.5 leading-relaxed">{e.description}</p>
                    <p className="font-mono text-[10px] text-cream-100/30 mt-1">{formatDateTime(e.createdAt)}</p>
                  </li>
                ))}
                {inspection.interventions.map((iv, i) => (
                  <li key={`i${i}`} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-signal-teal" aria-hidden="true" />
                    <div className="flex items-center gap-2">
                      <ActionBadge action={iv.action as never} />
                    </div>
                    <p className="text-xs text-cream-100/60 mt-1.5 leading-relaxed">{iv.reason}</p>
                    <p className="text-xs text-cream-100/45 mt-1 leading-relaxed">{iv.explanation}</p>
                    {iv.customerChoice && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-signal-cyan mt-1.5">
                        Customer chose: {iv.customerChoice}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

function Field({
  label,
  value,
  hint,
  hintTone,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "warn" | "bad";
}) {
  const tone = hintTone === "bad" ? "text-signal-coral" : hintTone === "warn" ? "text-signal-amber" : "text-cream-100/35";
  return (
    <div className="rounded-xl border border-white/8 px-3.5 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35">{label}</p>
      <p className="text-sm text-cream-100/85 mt-1">{value}</p>
      {hint && <p className={`font-mono text-[10px] uppercase tracking-[0.1em] mt-1 ${tone}`}>{hint}</p>}
    </div>
  );
}
