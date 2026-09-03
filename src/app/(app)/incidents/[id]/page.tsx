import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/auth/guard";
import { getIncidentDetail } from "@/lib/queries/incidents";
import { formatINR, formatDateTime } from "@/lib/format";
import { RiskLevelBadge, StatusBadge } from "@/components/ui/Badge";
import type { RiskLevelName } from "@/lib/risk/types";
import { IncidentTabs } from "./IncidentTabs";

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const { session } = await requireCustomer();
  const incident = await getIncidentDetail(params.id);
  if (!incident || incident.userId !== session.sub) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rise flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Incident</p>
          <h1 className="font-display text-2xl font-semibold text-cream-100">{incident.title}</h1>
          <p className="font-mono text-sm text-cream-100/45 mt-1">{incident.signature}</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskLevelBadge level={incident.severity as RiskLevelName} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rise" style={{ animationDelay: "60ms" }}>
        <MiniStat label="Amount at risk" value={formatINR(incident.amountAtRisk)} />
        <MiniStat label="Amount protected" value={formatINR(incident.amountSaved)} tone="good" />
        <MiniStat label="Opened" value={formatDateTime(incident.createdAt)} />
        <MiniStat label="Status" value={incident.status} />
      </div>

      <IncidentTabs incident={incident} />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "good" }) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-cream-100/40 mb-1">{label}</p>
      <p className={`font-display text-lg font-semibold ${tone === "good" ? "text-signal-jade" : "text-cream-100"}`}>{value}</p>
    </div>
  );
}
