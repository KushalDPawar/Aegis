import { requireCustomer } from "@/lib/auth/guard";
import { listBeneficiaries } from "@/lib/queries/beneficiaries";
import { NewPaymentForm } from "./NewPaymentForm";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Alert } from "@/components/ui/Form";

export default async function NewPaymentPage() {
  const { account } = await requireCustomer();
  const beneficiaries = await listBeneficiaries(account.id);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Send Money</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">New payment</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm">
          Every payment is screened by Sentinel before it can complete. Nothing here touches a real bank account.
        </p>
      </div>

      {account.status === "PROTECTED" && (
        <Alert tone="warn">
          This account is under protective restriction. Payments to existing, trusted beneficiaries remain available;
          new or unverified beneficiaries will be paused for review.
        </Alert>
      )}

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        <PanelHeader eyebrow="Payment Details" title="Who are you paying?" />
        <NewPaymentForm beneficiaries={beneficiaries} accountBalance={account.balance} />
      </Panel>
    </div>
  );
}
