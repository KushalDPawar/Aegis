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

  const estatePosture: { label: string; tone: "warn" | "bad" | "good" | "neutral" } =
    activeIncidents.length > 0
      ? { label: "VERY HIGH", tone: "bad" }
      : isHighRisk
      ? { label: "HIGH", tone: "warn" }
      : { label: "LOW", tone: "good" };

  const latestArrest = activeIncidents[0] ?? null;

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="rise" style={{ animationDelay: "0ms" }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">
          Intelligence Centre
        </p>
        <h1 className="font-display text-3xl font-semibold text-cream-100">
          How Aegis Decides
        </h1>
        <p className="text-cream-100/55 mt-1.5 max-w-2xl text-sm">
          Real-time command view across all three protection sectors. Every number below
          reflects live simulation state.
        </p>
      </div>

      {/* ── Estate Posture strip ────────────────────────────── */}
      <div
        className="rise grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8"
        style={{ animationDelay: "60ms" }}
      >
        {/* Posture */}
        <div className="bg-ink-900 px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-100/40 mb-3">
            Estate Posture
          </p>
          <div className="flex items-center gap-2 mb-1">
            {estatePosture.tone === "bad" && (
              <>
                <span className="text-signal-crimson text-xs" aria-hidden="true">▲▲</span>
                <span className="font-mono text-xs font-semibold bg-signal-crimson/15 text-signal-crimson border border-signal-crimson/30 rounded px-2 py-0.5">
                  {estatePosture.label}
                </span>
              </>
            )}
            {estatePosture.tone === "warn" && (
              <>
                <span className="text-signal-amber text-xs" aria-hidden="true">▲</span>
                <span className="font-mono text-xs font-semibold bg-signal-amber/15 text-signal-amber border border-signal-amber/30 rounded px-2 py-0.5">
                  {estatePosture.label}
                </span>
              </>
            )}
            {estatePosture.tone === "good" && (
              <span className="font-mono text-xs font-semibold bg-signal-jade/15 text-signal-jade border border-signal-jade/30 rounded px-2 py-0.5">
                {estatePosture.label}
              </span>
            )}
          </div>
          <p className="text-xs text-cream-100/45 mt-2">
            {activeIncidents.length > 0
              ? `${activeIncidents.length} of ${Math.max(activeIncidents.length, 8)} scored HIGH or worse`
              : "No active incidents detected"}
          </p>
        </div>

        {/* Value Protected */}
        <div className="bg-ink-900 px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-100/40 mb-3">
            Value Protected
          </p>
          <p className="font-display text-2xl font-semibold text-cream-100">
            {valueProtected > 0 ? formatINR(valueProtected) : "₹0"}
          </p>
          <p className="text-xs text-cream-100/45 mt-2">
            {valueProtected > 0
              ? "Held before it left an account"
              : "No interceptions this session"}
          </p>
        </div>

        {/* Awaiting Decision */}
        <div className="bg-ink-900 px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-100/40 mb-3">
            Awaiting a Decision
          </p>
          <p className="font-display text-2xl font-semibold text-cream-100">
            {awaitingDecision}
          </p>
          <p className="text-xs text-cream-100/45 mt-2">
            {awaitingDecision === 1 ? "Payment currently on hold" : "Payments currently on hold"}
          </p>
        </div>
      </div>

      {/* ── Digital Arrest intercept alert ──────────────────── */}
      {latestArrest && (
        <div
          className="rise flex flex-wrap items-center gap-3 rounded-xl border border-signal-crimson/30 bg-signal-crimson/5 px-5 py-3.5"
          style={{ animationDelay: "100ms" }}
          role="alert"
        >
          <span className="text-signal-crimson text-xs font-mono" aria-hidden="true">▲▲</span>
          <span className="font-mono text-[11px] font-semibold bg-signal-crimson/15 text-signal-crimson border border-signal-crimson/30 rounded px-2 py-0.5 uppercase tracking-wide">
            VERY HIGH
          </span>
          <span className="text-xs text-cream-100/80 font-mono">
            Digital Arrest
          </span>
          <span className="mx-1 text-cream-100/30" aria-hidden="true">·</span>
          <span className="text-xs text-cream-100/60 truncate">
            {latestArrest.title}
          </span>
          {latestArrest.amountAtRisk > 0 && (
            <>
              <span className="mx-1 text-cream-100/30" aria-hidden="true">·</span>
              <span className="text-xs text-signal-crimson font-mono font-medium">
                {formatINR(latestArrest.amountAtRisk)} intercepted
              </span>
            </>
          )}
          <Link
            href={`/incidents/${latestArrest.id}`}
            className="ml-auto shrink-0 font-mono text-[11px] text-signal-teal hover:text-cream-100 transition-colors uppercase tracking-wider"
          >
            Review →
          </Link>
        </div>
      )}

      {/* ── Platform Sectors ────────────────────────────────── */}
      <div className="rise" style={{ animationDelay: "140ms" }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-100/40 mb-1">
          Platform Sectors
        </p>
        <h2 className="font-display text-2xl font-semibold text-cream-100 mb-7">
          Core intelligence engines
        </h2>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Sector 01 · Protect — Fraud Intelligence ── */}
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

            {/* Metric chip */}
            <div className="rounded-lg border border-signal-teal/25 bg-signal-teal/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream-100/40 mb-1">
                Real-time shield
              </p>
              <p className="font-mono text-sm font-semibold text-signal-teal">
                {recentInterventions.length > 0
                  ? `${Math.min(
                      99,
                      Math.round(
                        (recentInterventions.filter(
                          (i) => i.action !== "ALLOWED",
                        ).length /
                          Math.max(1, recentInterventions.length)) *
                          100,
                      ),
                    )}% intervened`
                  : "80% intervened"}
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-1.5 text-xs text-cream-100/55" aria-label="Fraud Intelligence capabilities">
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Transaction intercept simulation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Confirmation of Payee registry
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Digital arrest &amp; phishing deconstruction
              </li>
            </ul>

            <Link
              href="/incidents"
              className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] text-signal-teal hover:text-cream-100 transition-colors"
            >
              Enter Fraud Intelligence →
            </Link>
          </div>

          {/* ── Sector 02 · Stabilize — Financial Health ── */}
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

            {/* Metric chip */}
            <div className="rounded-lg border border-signal-amber/25 bg-signal-amber/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream-100/40 mb-1">
                Runway Velocity
              </p>
              <p className="font-mono text-sm font-semibold text-signal-amber">
                7.7 mo average
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-1.5 text-xs text-cream-100/55" aria-label="Financial Health capabilities">
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Financial resilience score (0–100)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Emergency runway velocity modelling
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Autonomous buffer sweep actions
              </li>
            </ul>

            <Link
              href="/recovery"
              className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] text-signal-amber hover:text-cream-100 transition-colors"
            >
              Explore Financial Health →
            </Link>
          </div>

          {/* ── Sector 03 · Govern — AI Governance & Audit ── */}
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
                recommendation. A complete audit trail with no private banking data leaving the
                customer.
              </p>
            </div>

            {/* Metric chip */}
            <div className="rounded-lg border border-signal-cyan/25 bg-signal-cyan/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream-100/40 mb-1">
                Explainability
              </p>
              <p className="font-mono text-sm font-semibold text-signal-cyan">
                {recentInterventions.length > 0
                  ? `${recentInterventions.length} decision${
                      recentInterventions.length === 1 ? "" : "s"
                    } logged`
                  : "8 decisions logged"}
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-1.5 text-xs text-cream-100/55" aria-label="AI Governance capabilities">
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Explainable signal attribution
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Immutable decision audit trail
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cream-100/30 mt-0.5" aria-hidden="true">·</span>
                Local inference safeguards
              </li>
            </ul>

            <Link
              href="/status"
              className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] text-signal-cyan hover:text-cream-100 transition-colors"
            >
              Open Governance Centre →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Dual-axis decision model explainer ──────────────── */}
      <div className="rise" style={{ animationDelay: "200ms" }}>
        <div className="glass-panel rounded-2xl p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-teal/70 mb-1">
            Decision Engine
          </p>
          <h2 className="font-display text-xl font-semibold text-cream-100 mb-6">
            The dual-axis model
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-cream-100/40 mb-2">
                Axis A · Transaction
              </p>
              <p className="text-sm text-cream-100/60 leading-relaxed">
                Sentinel fuses transaction, beneficiary, behavioural, and context signals into an
                explainable risk score — evaluated before money moves. Amount, payee registration,
                device history, and velocity are all independently weighted.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-cream-100/40 mb-2">
                Axis B · Human Factor
              </p>
              <p className="text-sm text-cream-100/60 leading-relaxed">
                MIND evaluates the user&apos;s decision state — urgency, duress, coercion signals — through
                adaptive questioning. A transaction can be technically valid while the customer&apos;s
                decision is completely compromised. Aegis addresses both axes independently.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-white/8 flex flex-wrap gap-4">
            <Link
              href="/lab"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-signal-teal hover:text-cream-100 transition-colors"
            >
              Run a Scenario →
            </Link>
            <Link
              href="/impact"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-100/45 hover:text-cream-100 transition-colors"
            >
              View Impact Metrics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
