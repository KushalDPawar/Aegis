import Link from "next/link";
import { getConsoleTelemetry, getRiskPosture, getIncidentQueue } from "@/lib/queries/console";
import { getCustomerResilience } from "@/lib/queries/health";
import { prisma } from "@/lib/db";
import { RiskBadge, Money } from "@/components/console/primitives";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

const SECTORS = [
  {
    href: "/console/fraud",
    sector: "Sector 01 · Protect",
    title: "Fraud Intelligence",
    blurb:
      "Detect and understand suspicious financial situations before vulnerable users lose money. Scans beneficiary mismatches, mule accounts, and coercive syndicate playbooks.",
    capabilities: [
      "Transaction intercept simulation",
      "Confirmation of Payee registry",
      "Digital arrest & phishing deconstruction",
    ],
    cta: "Enter Fraud Intelligence",
    accent: "teal" as const,
  },
  {
    href: "/console/health",
    sector: "Sector 02 · Stabilize",
    title: "Financial Health",
    blurb:
      "Identify early financial stress signals and help users understand their resilience before problems become crises. Balances essential burn against discretionary outflow.",
    capabilities: [
      "Financial resilience score (0–100)",
      "Emergency runway velocity modelling",
      "Autonomous buffer sweep actions",
    ],
    cta: "Explore Financial Health",
    accent: "cyan" as const,
  },
  {
    href: "/console/governance",
    sector: "Sector 03 · Govern",
    title: "AI Governance & Audit",
    blurb:
      "Explainability, decision history, and transparency around every AI-assisted recommendation. A complete audit trail with no private banking data leaving the customer.",
    capabilities: [
      "Explainable signal attribution",
      "Immutable decision audit trail",
      "Local inference safeguards",
    ],
    cta: "Open Governance Centre",
    accent: "amber" as const,
  },
];

const ACCENT: Record<string, { text: string; border: string; glow: string }> = {
  teal: { text: "text-signal-teal", border: "border-signal-teal/30", glow: "hover:border-signal-teal/60" },
  cyan: { text: "text-signal-cyan", border: "border-signal-cyan/30", glow: "hover:border-signal-cyan/60" },
  amber: { text: "text-signal-amber", border: "border-signal-amber/30", glow: "hover:border-signal-amber/60" },
};

export default async function ConsoleHubPage() {
  const [telemetry, posture, incidents, resilience, liquidity] = await Promise.all([
    getConsoleTelemetry(),
    getRiskPosture(),
    getIncidentQueue(3),
    getCustomerResilience(),
    prisma.account.aggregate({ _sum: { balance: true } }),
  ]);

  const latestCase = incidents.find((i) => i.status === "ACTIVE") ?? incidents[0] ?? null;
  const avgRunway =
    resilience.length === 0
      ? 0
      : resilience.reduce((s, r) => s + r.summary.bufferRunwayMonths, 0) / resilience.length;

  // Live figures per sector, so each card states its own current reading
  // rather than a decorative constant.
  const sectorStat: Record<string, { label: string; value: string }> = {
    "/console/fraud": {
      label: "Real-time shield",
      value: `${telemetry.fraudPreventionRate}% intervened`,
    },
    "/console/health": {
      label: "Runway velocity",
      value: `${avgRunway.toFixed(1)} mo average`,
    },
    "/console/governance": {
      label: "Explainability",
      value: `${telemetry.sampleSize} decisions logged`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ---------------- Posture banner ---------------- */}
      <section className="glass-panel rounded-2xl p-6 lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70">
              Aegis intelligence platform · active
            </p>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold text-cream-100 mt-2">
              Capital shielded. Decisions explained.
            </h1>
            <p className="text-sm text-cream-100/50 mt-2 max-w-xl leading-relaxed">
              Every payment across the estate is vetted on two independent axes — whether the transaction is legitimate,
              and whether the decision behind it was genuinely the customer&apos;s.
            </p>
          </div>

          <div className="shrink-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40">
              Total liquidity under protection
            </p>
            <p className="value-in font-display text-3xl font-semibold text-cream-100 mt-1.5 tabular-nums">
              {formatINR(liquidity._sum.balance ?? 0)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-6 pt-6 border-t border-white/8">
          <Reading label="Estate posture" value={posture.worstLevel ? undefined : "All clear"}>
            {posture.worstLevel && <RiskBadge level={posture.worstLevel} />}
            <span className="block text-xs text-cream-100/50 mt-1.5">
              {posture.elevated} of {posture.total} scored HIGH or worse
            </span>
          </Reading>
          <Reading label="Value protected" value={formatINR(telemetry.amountProtected)}>
            <span className="block text-xs text-cream-100/50 mt-1.5">Held before it left an account</span>
          </Reading>
          <Reading label="Awaiting a decision" value={String(telemetry.activeHolds)}>
            <span className="block text-xs text-cream-100/50 mt-1.5">Payments currently on hold</span>
          </Reading>
        </div>

        {latestCase && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-signal-crimson/25 bg-signal-crimson/[0.06] px-4 py-3">
            <RiskBadge level={latestCase.severity} />
            <span className="text-sm text-cream-100/80">{latestCase.title}</span>
            <span className="font-mono text-[11px] text-cream-100/45">
              {latestCase.customerName} · <Money value={latestCase.amountAtRisk} /> intercepted
            </span>
          </div>
        )}
      </section>

      {/* ---------------- The three sectors ---------------- */}
      <section>
        <div className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70">Platform sectors</p>
          <h2 className="font-display text-lg font-medium text-cream-100 mt-1">Core intelligence engines</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {SECTORS.map((s) => {
            const a = ACCENT[s.accent];
            const stat = sectorStat[s.href];
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`group glass-panel rounded-2xl p-6 flex flex-col border ${a.border} ${a.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${a.text}`}>{s.sector}</p>
                <h3 className="font-display text-xl font-semibold text-cream-100 mt-2">{s.title}</h3>
                <p className="text-sm text-cream-100/55 mt-3 leading-relaxed flex-1">{s.blurb}</p>

                {stat && (
                  <div className="mt-5 rounded-xl border border-white/8 px-3.5 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/35">{stat.label}</p>
                    <p className={`font-mono text-sm mt-0.5 ${a.text}`}>{stat.value}</p>
                  </div>
                )}

                <ul className="mt-4 space-y-1.5">
                  {s.capabilities.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs text-cream-100/55">
                      <span className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${a.text.replace("text-", "bg-")}`} aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>

                <span className={`mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] ${a.text}`}>
                  {s.cta}
                  <svg
                    width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M3.5 8h9M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Reading({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40">{label}</p>
      {value && <p className="font-display text-xl font-semibold text-cream-100 mt-1.5 tabular-nums">{value}</p>}
      {children}
    </div>
  );
}
