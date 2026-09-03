import Link from "next/link";
import { getTransactionStream, getTransactionInspection, getIncidentQueue, getRiskPosture } from "@/lib/queries/console";
import { COP_REGISTRY, PAYMENT_RAILS, NINETY_DAY_AVERAGE } from "@/lib/fraud/registry";
import { SafetyCheckPanel } from "@/components/console/SafetyCheckPanel";
import { InspectionDrawer } from "@/components/console/InspectionDrawer";
import { Panel, RiskBadge, StatusBadge, Money, EmptyState } from "@/components/console/primitives";
import { formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FraudIntelligencePage({ searchParams }: { searchParams: { tx?: string } }) {
  const [stream, inspection, incidents, posture] = await Promise.all([
    getTransactionStream(25),
    searchParams.tx ? getTransactionInspection(searchParams.tx) : Promise.resolve(null),
    getIncidentQueue(8),
    getRiskPosture(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70">Sector 01 · Protect</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100 mt-1.5">Fraud Intelligence</h1>
        <p className="text-sm text-cream-100/50 mt-1.5 max-w-2xl">
          Detect and understand suspicious financial situations before vulnerable users lose money. Beneficiary
          mismatches, mule accounts, and coercive syndicate playbooks — checked before the money moves.
        </p>
      </header>

      {/* ---------------- Safety check ---------------- */}
      <SafetyCheckPanel registry={COP_REGISTRY} rails={PAYMENT_RAILS} averageAmount={NINETY_DAY_AVERAGE} />

      {/* ---------------- Live stream ---------------- */}
      <Panel
        eyebrow="Live stream"
        title="Payments across the estate"
        action={
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/40">
            {posture.elevated} of {posture.total} elevated
          </span>
        }
      >
        {stream.length === 0 ? (
          <EmptyState title="No payments yet" />
        ) : (
          <ul className="divide-y divide-white/6">
            {stream.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/console/fraud?tx=${t.id}`}
                  className="flex items-center gap-4 py-3 hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-cream-100 truncate">
                      {t.customerName} <span className="text-cream-100/35">→</span> {t.beneficiaryName}
                    </p>
                    <p className="font-mono text-[11px] text-cream-100/40 mt-0.5">
                      {formatTime(t.createdAt)} · {t.purpose}
                      {t.beneficiaryIsNew && <span className="text-signal-amber/80"> · first-time payee</span>}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-cream-100/80 shrink-0">
                    <Money value={t.amount} />
                  </span>
                  <span className="shrink-0 hidden sm:block">
                    <RiskBadge level={t.overallLevel} />
                  </span>
                  <span className="shrink-0">
                    <StatusBadge status={t.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ---------------- Cases ---------------- */}
      <Panel eyebrow="Intercepted" title="Open cases">
        {incidents.length === 0 ? (
          <EmptyState title="No cases" hint="Nothing has escalated." />
        ) : (
          <ul className="divide-y divide-white/6">
            {incidents.map((i) => (
              <li key={i.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm text-cream-100">{i.title}</h3>
                    <RiskBadge level={i.severity} />
                  </div>
                  <p className="font-mono text-[11px] text-cream-100/40 mt-1">
                    {i.customerName} · {i.status.toLowerCase()}
                  </p>
                </div>
                <p className="font-mono text-sm text-signal-jade shrink-0 tabular-nums">
                  <Money value={i.amountSaved} /> held
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {inspection && <InspectionDrawer inspection={inspection} backHref="/console/fraud" />}
    </div>
  );
}
