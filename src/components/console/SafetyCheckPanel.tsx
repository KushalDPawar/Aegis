"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaymentRail, RegistryEntry } from "@/lib/fraud/registry";
import { runSafetyCheck, type SafetyCheckResult, type StageResult } from "@/lib/fraud/safety-check";
import { formatINR } from "@/lib/format";

type Phase = "form" | "running" | "result";

/**
 * Safety Check Before You Send.
 *
 * The stages reveal one at a time on a timer. That is not decoration: the
 * product's claim is that a deliberate pause is what breaks a coercion script,
 * and a result that appears instantly gives a pressured customer nothing to
 * push back against. The delay is the intervention.
 *
 * Scoring runs through `runSafetyCheck`, which calls the same risk engine the
 * rest of the platform uses — this screen cannot disagree with a real payment.
 */
export function SafetyCheckPanel({
  registry,
  rails,
  averageAmount,
}: {
  registry: RegistryEntry[];
  rails: { id: PaymentRail; label: string }[];
  averageAmount: number;
}) {
  const [amount, setAmount] = useState(240000);
  const [rail, setRail] = useState<PaymentRail>("IMPS");
  const [registryId, setRegistryId] = useState(registry[0]?.id ?? "");
  const [enteredName, setEnteredName] = useState("Govt Clearance Escrow - Verif 09");
  const [purpose, setPurpose] = useState("Urgent CBI case clearance — verification deposit");
  const [phase, setPhase] = useState<Phase>("form");
  const [revealed, setRevealed] = useState(0);
  const [result, setResult] = useState<SafetyCheckResult | null>(null);

  const selected = useMemo(() => registry.find((r) => r.id === registryId) ?? registry[0], [registry, registryId]);

  const start = useCallback(() => {
    const outcome = runSafetyCheck({ amount, rail, registryId, enteredName, purpose });
    setResult(outcome);
    setRevealed(0);
    setPhase("running");
  }, [amount, rail, registryId, enteredName, purpose]);

  // Walk the stages, then settle on the verdict.
  useEffect(() => {
    if (phase !== "running" || !result) return;
    if (revealed >= result.stages.length) {
      const done = window.setTimeout(() => setPhase("result"), 500);
      return () => window.clearTimeout(done);
    }
    const t = window.setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 420 : 680);
    return () => window.clearTimeout(t);
  }, [phase, revealed, result]);

  const reset = () => {
    setPhase("form");
    setResult(null);
    setRevealed(0);
  };

  return (
    <section className="glass-panel rounded-2xl p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal-teal/70">Transaction intercept</p>
          <h2 className="font-display text-lg font-medium text-cream-100 mt-1">Safety check before you send</h2>
          <p className="text-sm text-cream-100/50 mt-1.5 max-w-xl">
            Enter the transfer details and Aegis checks them for signs of fraud before any money moves.
          </p>
        </div>
        {phase !== "form" && (
          <button
            onClick={reset}
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-cream-100/70 hover:text-cream-100 transition-colors"
          >
            New check
          </button>
        )}
      </div>

      {phase === "form" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="How much are you sending?">
              <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 focus-within:border-signal-teal/50 transition-colors">
                <span className="font-mono text-sm text-cream-100/50">₹</span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-sm text-cream-100 focus:outline-none tabular-nums"
                />
              </div>
              <p className="font-mono text-[10px] text-cream-100/35 mt-1.5">
                Your 90-day average is {formatINR(averageAmount)}
              </p>
            </Field>

            <Field label="How are you sending it?">
              <div className="grid grid-cols-2 gap-2">
                {rails.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRail(r.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                      r.id === rail
                        ? "border-signal-teal/45 bg-signal-teal/10 text-signal-teal"
                        : "border-white/12 text-cream-100/60 hover:text-cream-100"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="What name were you given?">
              <input
                value={enteredName}
                onChange={(e) => setEnteredName(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm text-cream-100 focus:border-signal-teal/50 focus:outline-none transition-colors"
              />
            </Field>

            <Field label="What is this transfer for?">
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm text-cream-100 focus:border-signal-teal/50 focus:outline-none transition-colors"
              />
            </Field>
          </div>

          <div className="space-y-4">
            <Field label={`Who are you sending to? · ${registry.length} accounts in registry`}>
              <select
                value={registryId}
                onChange={(e) => setRegistryId(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-ink-850 px-3.5 py-2.5 text-sm text-cream-100 focus:border-signal-teal/50 focus:outline-none transition-colors"
              >
                {registry.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.legalName} — {r.ifsc} · {r.accountRef}
                  </option>
                ))}
              </select>
            </Field>

            {selected && (
              <div
                className={`rounded-xl border px-4 py-3.5 ${
                  selected.knownMule
                    ? "border-signal-crimson/35 bg-signal-crimson/[0.07]"
                    : selected.trusted
                      ? "border-signal-jade/30 bg-signal-jade/[0.05]"
                      : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">
                      Inter-bank Confirmation of Payee
                    </p>
                    <p className="text-sm text-cream-100 mt-1.5">{selected.legalName}</p>
                    <p className="font-mono text-[11px] text-cream-100/45 mt-0.5">
                      {selected.bank} · {selected.accountType}
                    </p>
                  </div>
                  {selected.knownMule ? (
                    <span className="shrink-0 rounded-full border border-signal-crimson/45 bg-signal-crimson/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-signal-crimson">
                      Known mule
                    </span>
                  ) : selected.trusted ? (
                    <span className="shrink-0 rounded-full border border-signal-jade/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-signal-jade">
                      Verified
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-cream-100/55 mt-2.5 leading-relaxed">{selected.intelligence}</p>
              </div>
            )}

            <button
              onClick={start}
              className="w-full rounded-full border border-signal-teal/45 bg-signal-teal/10 px-5 py-3 text-sm font-medium text-signal-teal hover:bg-signal-teal/15 transition-colors"
            >
              Run safety check
            </button>
          </div>
        </div>
      )}

      {phase !== "form" && result && (
        <div className="mt-6 space-y-5">
          {/* ---------------- Stage walk ---------------- */}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">
                We run 5 checks to look for signs of fraud
              </p>
              <p className="font-mono text-[11px] text-cream-100/50 tabular-nums">
                {Math.min(revealed, result.stages.length)} / {result.stages.length} done
              </p>
            </div>
            <ol className="mt-3 space-y-2">
              {result.stages.map((s, i) => (
                <Stage key={s.step} stage={s} shown={i < revealed} />
              ))}
            </ol>
          </div>

          {phase === "result" && (
            <>
              {/* ---------------- Verdict ---------------- */}
              <div
                className={`value-in rounded-2xl border p-5 ${
                  result.verdict === "HIGH_RISK"
                    ? "border-signal-crimson/40 bg-signal-crimson/[0.07]"
                    : result.verdict === "CAUTION"
                      ? "border-signal-amber/40 bg-signal-amber/[0.06]"
                      : "border-signal-jade/40 bg-signal-jade/[0.06]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">
                      Safety check results · simulated
                    </p>
                    <h3
                      className={`font-display text-xl font-semibold mt-1.5 ${
                        result.verdict === "HIGH_RISK"
                          ? "text-signal-crimson"
                          : result.verdict === "CAUTION"
                            ? "text-signal-amber"
                            : "text-signal-jade"
                      }`}
                    >
                      {result.headline}
                    </h3>
                    <p className="text-sm text-cream-100/60 mt-1">{result.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-4xl font-semibold text-cream-100 tabular-nums">
                      {result.dangerScore}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/40">out of 100</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-white/[0.07] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.verdict === "HIGH_RISK"
                          ? "bg-signal-crimson"
                          : result.verdict === "CAUTION"
                            ? "bg-signal-amber"
                            : "bg-signal-jade"
                      }`}
                      style={{ width: `${result.dangerScore}%`, transition: "width 1s cubic-bezier(.2,.8,.2,1)" }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-cream-100/30 mt-1.5">
                    <span>0 — safe</span>
                    <span>50 — caution</span>
                    <span>100 — very high risk</span>
                  </div>
                </div>
              </div>

              {/* ---------------- Confirmation of Payee ---------------- */}
              <div className="rounded-2xl border border-white/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">
                    Bank registry cross-check
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                      result.payee.verdict === "MATCH"
                        ? "border-signal-jade/45 text-signal-jade"
                        : result.payee.verdict === "PARTIAL"
                          ? "border-signal-amber/45 text-signal-amber"
                          : "border-signal-crimson/45 text-signal-crimson"
                    }`}
                  >
                    {result.payee.matchPercent}% match · {result.payee.verdict.replace("_", " ")}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl border border-white/8 px-3.5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35">
                      Name you were given
                    </p>
                    <p className="text-sm text-cream-100 mt-1">{enteredName}</p>
                    <p className="font-mono text-[10px] text-cream-100/35 mt-1">
                      {result.payee.entry.ifsc} · {result.payee.entry.accountRef}
                    </p>
                  </div>
                  <div className="rounded-xl border border-signal-crimson/25 bg-signal-crimson/[0.05] px-3.5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35">
                      Bank core record (legal KYC)
                    </p>
                    <p className="text-sm text-cream-100 mt-1">{result.payee.entry.legalName}</p>
                    <p className="font-mono text-[10px] text-cream-100/35 mt-1">
                      {result.payee.entry.bank} · {result.payee.entry.accountType}
                    </p>
                  </div>
                </div>

                {result.payee.verdict !== "MATCH" && (
                  <p className="text-xs text-cream-100/55 mt-3 leading-relaxed">
                    You entered &ldquo;{enteredName}&rdquo;, but this account legally belongs to{" "}
                    &ldquo;{result.payee.entry.legalName}&rdquo;. Official bodies do not collect payments into a private
                    individual&apos;s account.
                  </p>
                )}
              </div>

              {/* ---------------- Sovereign choice ---------------- */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">
                  What would you like to do?
                </p>
                <p className="text-sm text-cream-100/55 mt-1">
                  You are always in control. Aegis applies friction, never a block.
                </p>
                <div className="grid gap-3 sm:grid-cols-3 mt-4">
                  <Choice
                    tag="Recommended"
                    tone="jade"
                    title="Wait 48 hours"
                    detail="Pause and come back later. Scammers disappear when they cannot get money quickly."
                    action="Pause my transfer"
                  />
                  <Choice
                    tag="Second opinion"
                    tone="cyan"
                    title="Ask someone you trust"
                    detail="Share this with a family member before sending. A fresh pair of eyes catches what pressure hides."
                    action="Share with a trusted person"
                  />
                  <Choice
                    tag="Your choice"
                    tone="muted"
                    title="Send anyway"
                    detail="You can still proceed. We will ask you to confirm you understand the risks first."
                    action="I accept the risks"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Stage({ stage, shown }: { stage: StageResult; shown: boolean }) {
  return (
    <li
      className={`rounded-xl border px-4 py-3 transition-all duration-500 ${
        shown
          ? stage.status === "flagged"
            ? "border-signal-amber/30 bg-signal-amber/[0.05] opacity-100 translate-y-0"
            : "border-white/10 opacity-100 translate-y-0"
          : "border-white/5 opacity-35 translate-y-1"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-cream-100/90">
            <span className="font-mono text-cream-100/40 mr-2">{stage.step}.</span>
            {stage.title}
          </p>
          <p className="text-xs text-cream-100/45 mt-1 leading-relaxed">{stage.subtitle}</p>
          {shown && <p className="text-xs text-cream-100/35 mt-1.5 leading-relaxed">{stage.detail}</p>}
        </div>
        {shown ? (
          <span
            className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-right max-w-[45%] ${
              stage.status === "flagged" ? "text-signal-amber" : "text-signal-jade"
            }`}
          >
            {stage.finding}
          </span>
        ) : (
          <span className="shrink-0 h-2 w-2 rounded-full bg-white/15 mt-1.5" aria-hidden="true" />
        )}
      </div>
    </li>
  );
}

const CHOICE_TONE: Record<string, string> = {
  jade: "border-signal-jade/35 hover:border-signal-jade/60 text-signal-jade",
  cyan: "border-signal-cyan/30 hover:border-signal-cyan/60 text-signal-cyan",
  muted: "border-white/12 hover:border-white/25 text-cream-100/60",
};

function Choice({
  tag,
  tone,
  title,
  detail,
  action,
}: {
  tag: string;
  tone: keyof typeof CHOICE_TONE;
  title: string;
  detail: string;
  action: string;
}) {
  return (
    <article className={`rounded-xl border p-4 transition-colors ${CHOICE_TONE[tone]}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em]">{tag}</p>
      <h4 className="font-display text-base font-medium text-cream-100 mt-2">{title}</h4>
      <p className="text-xs text-cream-100/55 mt-2 leading-relaxed">{detail}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] mt-3">{action} →</p>
    </article>
  );
}
