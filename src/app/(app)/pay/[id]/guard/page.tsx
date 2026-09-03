import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guard";
import { getTransactionDetail } from "@/lib/queries/transaction";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import { GUARD_ACTION_META } from "@/lib/risk/colors";
import { GuardActions } from "./GuardActions";
import { Button } from "@/components/ui/Button";

export default async function GuardPage({ params }: { params: { id: string } }) {
  const { session } = await requireCustomer();
  const transaction = await getTransactionDetail(params.id);
  if (!transaction || transaction.account.userId !== session.sub) notFound();
  if (transaction.status === "PENDING") redirect(`/pay/${transaction.id}/risk`);

  const intervention = transaction.interventions[0];
  const activeIncident = transaction.incidents.find((i) => i.status === "ACTIVE");
  const actionMeta = intervention ? GUARD_ACTION_META[intervention.action] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rise flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">GUARD · Adaptive Friction</p>
          <h1 className="font-display text-2xl font-semibold text-cream-100">
            {formatINR(transaction.amount)} to {transaction.beneficiary.name}
          </h1>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        {actionMeta && (
          <PanelHeader eyebrow={`Recommended action: ${actionMeta.label}`} title={actionMeta.description} />
        )}
        {intervention && (
          <p className="text-sm text-cream-100/75 leading-relaxed bg-white/[0.03] border border-white/8 rounded-xl p-4">
            {intervention.explanation}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <Link href={`/pay/${transaction.id}/trace`} className="text-signal-teal hover:underline">
            View scam journey (TRACE) →
          </Link>
          {activeIncident && (
            <Link href={`/incidents/${activeIncident.id}`} className="text-signal-teal hover:underline">
              View Scam DNA & Incident →
            </Link>
          )}
        </div>
      </Panel>

      <Panel className="rise" style={{ animationDelay: "140ms" }}>
        <PanelHeader eyebrow="Your decision" title="What would you like to do?" />
        <GuardActions
          transactionId={transaction.id}
          status={transaction.status}
          interventionCreatedAt={intervention?.createdAt.toISOString() ?? null}
        />
      </Panel>

      {(transaction.status === "COMPLETED" || transaction.status === "CANCELLED") && (
        <div className="rise flex justify-end" style={{ animationDelay: "200ms" }}>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Aegis Core</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
