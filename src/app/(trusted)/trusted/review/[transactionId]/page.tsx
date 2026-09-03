import { notFound } from "next/navigation";
import { requireTrustedContact } from "@/lib/auth/guard";
import { getPausedTransactionForContact } from "@/lib/queries/trusted";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { RiskLevelBadge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/risk/ScoreBar";
import { Timeline, type TimelineItem } from "@/components/ui/Timeline";
import { formatINR, formatDateTime } from "@/lib/format";
import type { RiskLevelName } from "@/lib/risk/types";
import { TrustedReviewActions } from "./TrustedReviewActions";

export default async function TrustedReviewPage({ params }: { params: { transactionId: string } }) {
  const session = await requireTrustedContact();
  const transaction = await getPausedTransactionForContact(session.sub, params.transactionId);
  if (!transaction) notFound();

  const risk = transaction.riskAssessments[0];
  const incident = transaction.incidents.find((i) => i.status === "ACTIVE") ?? transaction.incidents[0];
  const items: TimelineItem[] = transaction.events.map((e) => {
    let severity = 0;
    if (e.metadata) {
      try {
        severity = JSON.parse(e.metadata).severity ?? 0;
      } catch {
        severity = 0;
      }
    }
    return { id: e.id, timestamp: e.createdAt, label: e.label, description: e.description, severity };
  });

  return (
    <div className="space-y-6">
      <div className="rise flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">
            {transaction.account.user.profile?.fullName ?? "Customer"}
          </p>
          <h1 className="font-display text-2xl font-semibold text-cream-100">
            {formatINR(transaction.amount)} payment
          </h1>
          <p className="text-cream-100/55 text-sm mt-1">{formatDateTime(transaction.createdAt)} · to {transaction.beneficiary.name}</p>
        </div>
        {risk && <RiskLevelBadge level={risk.overallLevel as RiskLevelName} size="lg" />}
      </div>

      {incident && (
        <Panel className="border-signal-crimson/30 rise" style={{ animationDelay: "80ms" }}>
          <PanelHeader eyebrow="Aegis Assessment" title={incident.scamPattern ? `Possible ${incident.scamPattern.name}` : "Suspicious pattern"} />
          <p className="text-sm text-cream-100/70 leading-relaxed">{incident.scamPattern?.description}</p>
        </Panel>
      )}

      {transaction.intentChecks.length > 0 && (
        <Panel className="rise" style={{ animationDelay: "120ms" }}>
          <PanelHeader eyebrow="Customer's own words" title="Intent check responses" />
          <ul className="space-y-3">
            {transaction.intentChecks.map((c) => (
              <li key={c.id} className="text-sm">
                <p className="text-cream-100/50">{c.question}</p>
                <p className="text-cream-100">&ldquo;{c.response}&rdquo;</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {risk && (
        <Panel className="rise" style={{ animationDelay: "160ms" }}>
          <PanelHeader eyebrow="Risk" title="Breakdown" />
          <div className="space-y-4">
            <ScoreBar label="Decision Integrity" score={risk.decisionIntegrity} invert />
            <ScoreBar label="Social Engineering Risk" score={risk.socialEngineeringRisk} />
            <ScoreBar label="Beneficiary Risk" score={risk.beneficiaryRisk} />
          </div>
        </Panel>
      )}

      <Panel className="rise" style={{ animationDelay: "200ms" }}>
        <PanelHeader eyebrow="Sequence" title="What happened" />
        <Timeline items={items} dense />
      </Panel>

      <Panel className="rise" style={{ animationDelay: "240ms" }}>
        <PanelHeader eyebrow="Your decision" title="How would you like to respond?" />
        <TrustedReviewActions transactionId={transaction.id} />
      </Panel>
    </div>
  );
}
