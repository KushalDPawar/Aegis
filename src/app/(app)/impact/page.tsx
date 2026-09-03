import { getImpactSummary } from "@/lib/impact";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { formatINR } from "@/lib/format";
import { ImpactChart } from "./ImpactChart";

export default async function ImpactPage() {
  const summary = await getImpactSummary();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Impact Engine</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Protection impact</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm max-w-2xl">
          The four cards below reflect real activity generated in this session (Lab runs and live incidents). The
          chart beneath is clearly-labeled synthetic network-wide data for demo purposes only — not a real-world claim.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rise" style={{ animationDelay: "80ms" }}>
        <StatCard label="Losses prevented (this session)" value={formatINR(summary.potentialLossesPrevented)} tone="good" />
        <StatCard label="Scam attempts interrupted" value={String(summary.scamAttemptsInterrupted)} />
        <StatCard label="Accounts safely recovered" value={String(summary.accountsSafelyRecovered)} />
        <StatCard label="Accounts currently protected" value={String(summary.accountsCurrentlyProtected)} tone={summary.accountsCurrentlyProtected > 0 ? "warn" : "neutral"} />
      </div>

      <Panel className="rise" style={{ animationDelay: "140ms" }}>
        <PanelHeader eyebrow="Simulated · Network-wide" title="Illustrative demo metrics (trailing 12 months)" />
        <ImpactChart data={summary.baselineNetworkMetrics} />
        <p className="text-[11px] text-cream-100/35 font-mono uppercase tracking-wider mt-4">
          Synthetic data for demonstration only.
        </p>
      </Panel>
    </div>
  );
}
