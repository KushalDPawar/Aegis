import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guard";
import { getDashboardData } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/ui/StatCard";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatusBadge, RiskLevelBadge } from "@/components/ui/Badge";
import { formatINR, formatDateTime, maskAccountNumber } from "@/lib/format";
import { nextStepPath } from "@/lib/transaction-routing";
import type { RiskLevelName } from "@/lib/risk/types";

export default async function DashboardPage() {
  const { session, profile, account } = await requireCustomer();
  const { transactions, activeIncidents, recentInterventions, trustedContacts, pendingTransactions } =
    await getDashboardData(session.sub, account.id);

  const currentRisk: RiskLevelName =
    (pendingTransactions[0]?.riskAssessments[0]?.overallLevel as RiskLevelName) ?? "LOW";

  return (
    <div className="space-y-8">
      <div className="rise" style={{ animationDelay: "0ms" }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Aegis Core</p>
        <h1 className="font-display text-3xl font-semibold text-cream-100">Welcome back, {profile.fullName.split(" ")[0]}.</h1>
        <p className="text-cream-100/55 mt-1.5 max-w-2xl">
          Decision-security command center. This is a self-contained simulation — no real bank accounts are connected.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rise" style={{ animationDelay: "80ms" }}>
        <StatCard label="Available Balance" value={formatINR(account.balance)} sublabel={maskAccountNumber(account.accountNumber)} />
        <StatCard
          label="Account Status"
          value={account.status === "ACTIVE" ? "Active" : account.status === "PROTECTED" ? "Protected" : "Restricted"}
          tone={account.status === "ACTIVE" ? "good" : account.status === "PROTECTED" ? "warn" : "bad"}
          sublabel={account.status === "PROTECTED" ? "Essential banking preserved" : "Full access"}
        />
        <StatCard
          label="Current Risk"
          value={currentRisk.replace("_", " ")}
          tone={currentRisk === "LOW" ? "good" : currentRisk === "MODERATE" ? "neutral" : currentRisk === "HIGH" ? "warn" : "bad"}
          sublabel={pendingTransactions.length ? "Payment awaiting decision" : "No active payments"}
        />
        <StatCard label="Trusted Circle" value={String(trustedContacts)} sublabel="Contacts configured" />
      </div>

      {activeIncidents.length > 0 && (
        <Panel className="border-signal-crimson/30 rise" style={{ animationDelay: "140ms" }}>
          <PanelHeader
            eyebrow="Active Protection"
            title={`${activeIncidents.length} incident${activeIncidents.length > 1 ? "s" : ""} ${activeIncidents.length > 1 ? "require" : "requires"} attention`}
            action={
              <Link href="/incidents">
                <Button variant="outline" size="sm">
                  View incidents
                </Button>
              </Link>
            }
          />
          <ul className="space-y-3">
            {activeIncidents.map((incident) => (
              <li key={incident.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div>
                  <p className="font-medium text-cream-100">{incident.title}</p>
                  <p className="text-xs text-cream-100/45 font-mono mt-0.5">{incident.signature}</p>
                </div>
                <div className="flex items-center gap-3">
                  <RiskLevelBadge level={incident.severity as RiskLevelName} size="sm" />
                  <Link href={`/incidents/${incident.id}`}>
                    <Button size="sm" variant="secondary">
                      Review
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 rise" style={{ animationDelay: "200ms" }}>
          <PanelHeader
            eyebrow="Transaction Activity"
            title="Recent payments"
            action={
              <Link href="/pay">
                <Button size="sm">New payment</Button>
              </Link>
            }
          />
          {transactions.length === 0 ? (
            <p className="text-sm text-cream-100/45 py-8 text-center">No payments yet. Start your first one, or run a scenario in the Lab.</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {transactions.map((t) => (
                <li key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-cream-100 truncate">{t.beneficiary.name}</p>
                    <p className="text-xs text-cream-100/45">{formatDateTime(t.createdAt)} · {t.purpose}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm text-cream-100/80">{formatINR(t.amount)}</span>
                    <StatusBadge status={t.status} />
                    <Link href={nextStepPath(t.id, t.status)} className="text-signal-teal text-sm hover:underline">
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="rise" style={{ animationDelay: "260ms" }}>
          <PanelHeader eyebrow="Guard" title="Recent interventions" />
          {recentInterventions.length === 0 ? (
            <p className="text-sm text-cream-100/45 py-6 text-center">No interventions yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentInterventions.map((i) => (
                <li key={i.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-signal-teal/70">{i.action}</p>
                  <p className="text-sm text-cream-100 mt-1">{i.transaction.beneficiary.name}</p>
                  <p className="text-xs text-cream-100/45 mt-0.5">{formatDateTime(i.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
