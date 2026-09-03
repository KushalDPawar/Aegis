import { notFound, redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth/guard";
import { getTransactionDetail } from "@/lib/queries/transaction";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { formatINR } from "@/lib/format";
import { IntentCheckChat } from "./IntentCheckChat";
import { INTENT_CHECK_INITIAL_QUESTION } from "@/lib/ai/schema";

export default async function IntentCheckPage({ params }: { params: { id: string } }) {
  const { session } = await requireCustomer();
  const transaction = await getTransactionDetail(params.id);
  if (!transaction || transaction.account.userId !== session.sub) notFound();
  if (transaction.status !== "PENDING") redirect(`/pay/${transaction.id}/guard`);

  const history = transaction.intentChecks.map((c) => ({
    question: c.question,
    answer: c.response,
  }));
  const currentQuestion =
    transaction.intentChecks.length > 0
      ? transaction.intentChecks[transaction.intentChecks.length - 1].followUpQuestion
      : INTENT_CHECK_INITIAL_QUESTION;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">MIND · AI Intent Check</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">A few quick questions</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm">
          Sentinel flagged elevated human-factor risk on your {formatINR(transaction.amount)} payment to{" "}
          {transaction.beneficiary.name}. These short questions help Aegis tell a legitimate decision apart from a
          manipulated one. Your answers are classified — not judged.
        </p>
      </div>

      <Panel className="rise" style={{ animationDelay: "100ms" }}>
        <PanelHeader eyebrow="Adaptive Interview" title="Why are you making this payment?" />
        <IntentCheckChat transactionId={transaction.id} history={history} initialQuestion={currentQuestion ?? null} />
      </Panel>
    </div>
  );
}
