import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guard";
import { getTransactionDetail } from "@/lib/queries/transaction";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Timeline, type TimelineItem } from "@/components/ui/Timeline";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export default async function TracePage({ params }: { params: { id: string } }) {
  const { session } = await requireCustomer();
  const transaction = await getTransactionDetail(params.id);
  if (!transaction || transaction.account.userId !== session.sub) notFound();

  const items: TimelineItem[] = transaction.events.map((e) => {
    let severity = 0;
    if (e.metadata) {
      try {
        severity = JSON.parse(e.metadata).severity ?? 0;
      } catch {
        severity = 0;
      }
    }
    return {
      id: e.id,
      timestamp: e.createdAt,
      label: e.label,
      description: e.description,
      severity,
      tag: e.type.replace(/_/g, " "),
    };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rise flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">TRACE · Scam Journey Reconstruction</p>
          <h1 className="font-display text-2xl font-semibold text-cream-100">
            Event timeline — {formatINR(transaction.amount)} to {transaction.beneficiary.name}
          </h1>
          <p className="text-cream-100/55 mt-1.5 text-sm max-w-xl">
            Every marker below is a real, stored event from this session — nothing here is decorative.
          </p>
        </div>
        <Link href={`/pay/${transaction.id}/guard`}>
          <Button variant="outline" size="sm">
            View decision
          </Button>
        </Link>
      </div>

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        <PanelHeader eyebrow="Reconstructed" title="Chain of events" />
        <Timeline items={items} />
      </Panel>
    </div>
  );
}
