import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guard";
import { listIncidents } from "@/lib/queries/incidents";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { RiskLevelBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDateTime, formatINR } from "@/lib/format";
import type { RiskLevelName } from "@/lib/risk/types";

export default async function IncidentsPage() {
  const { session } = await requireCustomer();
  const incidents = await listIncidents(session.sub);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Incident Memory</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Incidents</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm">Every intervention leaves an auditable trail here — Scam DNA, timeline, and outcome.</p>
      </div>

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        <PanelHeader eyebrow="History" title={`${incidents.length} incident${incidents.length === 1 ? "" : "s"}`} />
        {incidents.length === 0 ? (
          <p className="text-sm text-cream-100/45 py-8 text-center">
            No incidents yet. Run a scenario in the{" "}
            <Link href="/lab" className="text-signal-teal hover:underline">
              Scenario Lab
            </Link>{" "}
            to see one form.
          </p>
        ) : (
          <ul className="divide-y divide-white/6">
            {incidents.map((incident) => (
              <li key={incident.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-cream-100">{incident.title}</p>
                    <span className="font-mono text-[11px] text-cream-100/40">{incident.signature}</span>
                  </div>
                  <p className="text-xs text-cream-100/45 mt-1">
                    {formatDateTime(incident.createdAt)}
                    {incident.transaction && ` · ${formatINR(incident.transaction.amount)} to ${incident.transaction.beneficiary.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RiskLevelBadge level={incident.severity as RiskLevelName} size="sm" />
                  <StatusBadge status={incident.status} />
                  <Link href={`/incidents/${incident.id}`} className="text-signal-teal text-sm hover:underline ml-2">
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
