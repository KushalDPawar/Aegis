import Link from "next/link";
import { requireTrustedContact } from "@/lib/auth/guard";
import { listPausedTransactionsForContact } from "@/lib/queries/trusted";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { RiskLevelBadge } from "@/components/ui/Badge";
import { formatINR, formatDateTime } from "@/lib/format";
import type { RiskLevelName } from "@/lib/risk/types";
import { Button } from "@/components/ui/Button";

export default async function TrustedDashboardPage() {
  const session = await requireTrustedContact();
  const transactions = await listPausedTransactionsForContact(session.sub);

  return (
    <div className="space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Trusted Circle</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Payments awaiting your review</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm">
          These payments were paused by Aegis for critical decision-integrity risk. Your review is one layer of
          protection — the backend still enforces every rule deterministically.
        </p>
      </div>

      {transactions.length === 0 ? (
        <Panel className="rise" style={{ animationDelay: "80ms" }}>
          <p className="text-sm text-cream-100/45 py-6 text-center">Nothing needs your attention right now.</p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {transactions.map((t, i) => {
            const risk = t.riskAssessments[0];
            const incident = t.incidents.find((inc) => inc.status === "ACTIVE") ?? t.incidents[0];
            return (
              <Panel key={t.id} className="rise" style={{ animationDelay: `${100 + i * 60}ms` }}>
                <PanelHeader
                  eyebrow={t.account.user.profile?.fullName ?? "Customer"}
                  title={`${formatINR(t.amount)} to ${t.beneficiary.name}`}
                  action={risk && <RiskLevelBadge level={risk.overallLevel as RiskLevelName} />}
                />
                <p className="text-sm text-cream-100/60 mb-1">
                  {incident?.scamPattern ? `Possible ${incident.scamPattern.name}` : "Suspicious transaction pattern"}
                </p>
                <p className="text-xs text-cream-100/40 mb-4">{formatDateTime(t.createdAt)} · {t.purpose}</p>
                <Link href={`/trusted/review/${t.id}`}>
                  <Button>Review payment</Button>
                </Link>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
