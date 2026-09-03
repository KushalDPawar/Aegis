import { requireCustomer } from "@/lib/auth/guard";
import { getRecoveryData } from "@/lib/queries/recovery";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { formatINR, formatDateTime } from "@/lib/format";
import { RecoveryChecklist } from "./RecoveryChecklist";
import { RecoveryNavigator } from "./RecoveryNavigator";
import { maskAccountNumber } from "@/lib/format";

export default async function RecoveryPage() {
  const { account } = await requireCustomer();
  const { cases, activeCase, essentialBeneficiaries, restrictedBeneficiaries } = await getRecoveryData(account.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Resilience Predictor</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Financial Health</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm max-w-2xl">
          Protection should never mean total exclusion. This is a simulated recovery workflow — essential banking
          stays available while a flagged case is under review.
        </p>
      </div>

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        <PanelHeader
          eyebrow="Financial Continuity Mode"
          title={account.status === "PROTECTED" ? "Your account is protected, not blocked" : "Your account has full access"}
        />
        <p className="text-sm text-cream-100/55 mb-4">{maskAccountNumber(account.accountNumber)} · {formatINR(account.balance)} available</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-signal-jade mb-2">Available</p>
            <ul className="space-y-1.5 text-sm text-cream-100/80">
              <li>✓ Receive incoming funds</li>
              <li>✓ Pay existing verified billers</li>
              {essentialBeneficiaries.map((b) => (
                <li key={b.id}>✓ Pay {b.name}</li>
              ))}
              {essentialBeneficiaries.length === 0 && <li className="text-cream-100/40">No established beneficiaries yet.</li>}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-signal-crimson mb-2">Restricted while under review</p>
            <ul className="space-y-1.5 text-sm text-cream-100/60">
              <li>✕ New or unverified beneficiaries</li>
              <li>✕ Unusually large transfers</li>
              {restrictedBeneficiaries.slice(0, 3).map((b) => (
                <li key={b.id}>✕ {b.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      {activeCase && (
        <Panel className="rise" style={{ animationDelay: "140ms" }}>
          <PanelHeader
            eyebrow={activeCase.incident?.scamPattern?.name ?? "Recovery Case"}
            title={`${formatINR(activeCase.amountProtected)} protected · Status: ${activeCase.status.replace("_", " ")}`}
          />
          <p className="text-xs text-cream-100/40 mb-4">Opened {formatDateTime(activeCase.createdAt)}</p>
          <RecoveryChecklist events={activeCase.events} />
        </Panel>
      )}

      <Panel className="rise" style={{ animationDelay: "200ms" }}>
        <PanelHeader eyebrow="Recovery Navigator" title="Ask Aegis about your case" />
        <RecoveryNavigator
          hasCase={Boolean(activeCase)}
          accountStatus={account.status}
          incidentTitle={activeCase?.incident?.title}
          scamCategory={(activeCase?.incident?.scamPattern?.code as never) ?? null}
          amountAtRisk={activeCase?.amountUnderReview}
          amountProtected={activeCase?.amountProtected}
          recoveryStatus={activeCase?.status}
          createdAtIso={activeCase?.createdAt?.toISOString()}
        />
      </Panel>

      {cases.length > 1 && (
        <Panel className="rise" style={{ animationDelay: "260ms" }}>
          <PanelHeader eyebrow="History" title="Past cases" />
          <ul className="divide-y divide-white/6">
            {cases.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between text-sm">
                <span className="text-cream-100/70">{formatDateTime(c.createdAt)}</span>
                <span className="text-cream-100">{c.status}</span>
                <span className="font-mono text-signal-jade">{formatINR(c.amountProtected)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
