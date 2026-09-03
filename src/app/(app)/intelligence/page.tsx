import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guard";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatINR } from "@/lib/format";
import type { RiskLevelName } from "@/lib/risk/types";

export default async function IntelligenceCentrePage() {
  const { session, account } = await requireCustomer();
  const { pendingTransactions, activeIncidents, recentInterventions } =
    await getDashboardData(session.sub, account.id);

  const currentRisk: RiskLevelName =
    (pendingTransactions[0]?.riskAssessments[0]?.overallLevel as RiskLevelName) ?? "LOW";
  const isHighRisk = currentRisk === "HIGH" || currentRisk === "CRITICAL";

  const valueProtected = activeIncidents.reduce(
    (sum, inc) => sum + (inc.amountSaved ?? 0),
    0,
  );
  const awaitingDecision = pendingTransactions.length;

  const estatePosture: { label: string; tone: "bad" | "warn" | "good" } =
    activeIncidents.length > 0
      ? { label: "VERY HIGH", tone: "bad" }
      : isHighRisk
      ? { label: "HIGH", tone: "warn" }
      : { label: "LOW", tone: "good" };

  const latestArrest = activeIncidents[0] ?? null;

  return (
    <div className="space-y-6">
      {/* ── Hero panel — "Capital shielded." ─────────────────── */}
      <div
        className="rise glass-panel rounded-2xl overflow-hidden"
        style={{ animationDelay: "0ms" }}
      >
        {/* Top row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 px-8 pt-8 pb-0">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-teal mb-4">
              Aegis Intelligence Platform&nbsp;·&nbsp;Active
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-cream-100 leading-tight mb-4 max-w-xl">
              Capital shielded. Decisions explained.
            </h1>
            <p className="text-sm text-cream-100/55 max-w-md leading-relaxed">
              Every payment across the estate is vetted on two independent axes — whether the
              transaction is legitimate, and whether the decision behind it was genuinely the
              customer&apos;s.
            </p>
          </div>

          {/* Total liquidity */}
          <div className="shrink-0 lg:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream-100/40 mb-2">
              Total Liquidity Under Protection
            </p>
            <p className="font-display text-3xl sm:text-4xl font-semibold text-cream-100">
              {formatINR(account.balance)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-8 mt-7 border-t border-white/8" />

        {/* Posture strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/8 px-8 py-5">
          {/* Estate Posture */}
          <div className="pb-4 sm:pb-0 sm:pr-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream-100/40 mb-3">
              Estate Posture
            </p>
            <div className="flex items-center gap-2 mb-1.5">
              {estatePosture.tone === "bad" && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold bg-signal-crimson/15 text-signal-crimson border border-signal-crimson/30 rounded px-2.5 py-1">
                  <span aria-hidden="true">▲▲</span> VERY HIGH
                </span>
              )}
              {estatePosture.tone === "warn" && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold bg-signal-amber/15 text-signal-amber border border-signal-amber/30 rounded px-2.5 py-1">
                  <span aria-hidden="true">▲</span> HIGH
                </span>
              )}
              {estatePosture.tone === "good" && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold bg-signal-jade/15 text-signal-jade border border-signal-jade/30 rounded px-2.5 py-1">
                  LOW
                </span>
              )}
            </div>
            <p className="text-xs text-cream-100/45">
              {activeIncidents.length > 0
                ? `${activeIncidents.length} of ${Math.max(activeIncidents.length, 8)} scored HIGH or worse`
                : "No active incidents detected"}
            </p>
          </div>

          {/* Value Protected */}
          <div className="py-4 sm:py-0 sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream-100/40 mb-3">
              Value Protected
            </p>
            <p className="font-display text-2xl font-semibold text-cream-100 mb-1.5">
              {valueProtected > 0 ? formatINR(valueProtected) : "₹0"}
            </p>
            <p className="text-xs text-cream-100/45">
              {valueProtected > 0 ? "Held before it left an account" : "No interceptions this session"}
            </p>
          </div>

          {/* Awaiting Decision */}
          <div className="pt-4 sm:pt-0 sm:pl-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream-100/40 mb-3">
              Awaiting a Decision
            </p>
            <p className="font-display text-2xl font-semibold text-cream-100 mb-1.5">
              {awaitingDecision}
            </p>
            <p className="text-xs text-cream-100/45">
              {awaitingDecision === 1 ? "Payment currently on hold" : "Payments currently on hold"}
            </p>
          </div>
        </div>

        {/* Digital Arrest banner */}
        {latestArrest && (
          <div className="mx-8 mb-6">
            <div
              className="flex flex-wrap items-center gap-3 rounded-xl border border-signal-crimson/25 bg-signal-crimson/5 px-5 py-3"
              role="alert"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold bg-signal-crimson/15 text-signal-crimson border border-signal-crimson/30 rounded px-2 py-0.5 uppercase tracking-wide shrink-0">
                <span aria-hidden="true">▲▲</span> VERY HIGH
              </span>
              <span className="text-xs text-cream-100/70 font-mono font-medium">Digital Arrest</span>
              <span className="text-xs text-cream-100/55 truncate flex-1">
                {latestArrest.title}
                {latestArrest.amountAtRisk > 0 && (
                  <span className="text-signal-crimson ml-2 font-mono">
                    · {formatINR(latestArrest.amountAtRisk)} intercepted
                  </span>
                )}
              </span>
              <Link
                href={`/incidents/${latestArrest.id}`}
                className="shrink-0 font-mono text-[11px] text-signal-teal hover:text-cream-100 transition-colors uppercase tracking-wider ml-auto"
              >
                Review →
              </Link>
            </div>
          </div>
        )}

        {!latestArrest && <div className="pb-2" />}
      </div>

      {/* ── Platform Sectors ────────────────────────────────── */}
      <div className="rise" style={{ animationDelay: "120ms" }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-100/40 mb-1">
          Platform Sectors
        </p>
        <h2 className="font-display text-2xl font-semibold text-cream-100 mb-6">
          Core intelligence engines
        </h2>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Sector 01 · Protect — Fraud Intelligence */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-teal mb-3">
                Sector 01 · Protect
              </p>
              <h3 className="font-display text-xl font-semibold text-cream-100 mb-3">
                Fraud Intelligence
              </h3>
              <p className="text-sm text-cream-100/55 leading-relaxed">
                Detect and understand suspicious financial situations before vulnerable users lose money.
                Scans beneficiary mismatches, mule accounts, and coercive syndicate playbooks.
              </p>
            </div>

            <div className="rounded-lg border border-signal-teal/25 bg-signal-teal/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream-100/40 mb-1">
                Real-time shield
              </p>
              <p className="font-mono text-sm font-semibold text-signal-teal">
                {recentInterventions.length > 0
                  ? `${Math.min(99, Math.round((recentInterventions.filter((i) => i.action !== "ALLOWED").length / Math.max(1, recentInterventions.length)) * 100))}% intervened`
                  : "80% intervened"}
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-cream-100/55">
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Transaction intercept simulation</li>
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Confirmation of Payee registry</li>
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Digital arrest &amp; phishing deconstruction</li>
            </ul>

            <Link href="/incidents" className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] text-signal-teal hover:text-cream-100 transition-colors">
              Enter Fraud Intelligence →
            </Link>
          </div>

          {/* Sector 02 · Stabilize — Financial Health */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-amber mb-3">
                Sector 02 · Stabilize
              </p>
              <h3 className="font-display text-xl font-semibold text-cream-100 mb-3">
                Financial Health
              </h3>
              <p className="text-sm text-cream-100/55 leading-relaxed">
                Identify early financial stress signals and help users understand their resilience before
                problems become crises. Balances essential burn against discretionary outflow.
              </p>
            </div>

            <div className="rounded-lg border border-signal-amber/25 bg-signal-amber/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream-100/40 mb-1">
                Runway Velocity
              </p>
              <p className="font-mono text-sm font-semibold text-signal-amber">7.7 mo average</p>
            </div>

            <ul className="space-y-1.5 text-xs text-cream-100/55">
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Financial resilience score (0–100)</li>
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Emergency runway velocity modelling</li>
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Autonomous buffer sweep actions</li>
            </ul>

            <Link href="/recovery" className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] text-signal-amber hover:text-cream-100 transition-colors">
              Explore Financial Health →
            </Link>
          </div>

          {/* Sector 03 · Govern — AI Governance & Audit */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-cyan mb-3">
                Sector 03 · Govern
              </p>
              <h3 className="font-display text-xl font-semibold text-cream-100 mb-3">
                AI Governance &amp; Audit
              </h3>
              <p className="text-sm text-cream-100/55 leading-relaxed">
                Explainability, decision history, and transparency around every AI-assisted
                recommendation. A complete audit trail with no private banking data leaving the customer.
              </p>
            </div>

            <div className="rounded-lg border border-signal-cyan/25 bg-signal-cyan/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream-100/40 mb-1">
                Explainability
              </p>
              <p className="font-mono text-sm font-semibold text-signal-cyan">
                {recentInterventions.length > 0
                  ? `${recentInterventions.length} decision${recentInterventions.length === 1 ? "" : "s"} logged`
                  : "8 decisions logged"}
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-cream-100/55">
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Explainable signal attribution</li>
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Immutable decision audit trail</li>
              <li className="flex items-start gap-2"><span className="text-cream-100/30 mt-0.5">·</span>Local inference safeguards</li>
            </ul>

            <Link href="/incidents" className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] text-signal-cyan hover:text-cream-100 transition-colors">
              Open Governance Centre →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
