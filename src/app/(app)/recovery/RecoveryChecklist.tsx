import type { RecoveryEvent } from "@prisma/client";

const STEP_ORDER = ["INCIDENT_REPORTED", "BENEFICIARY_CONTAINED", "TRANSACTION_FLAGGED", "BANK_REVIEW", "ACCOUNT_RESTORATION", "FINAL_RESOLUTION"];

export function RecoveryChecklist({ events }: { events: RecoveryEvent[] }) {
  const latestByStep = new Map<string, RecoveryEvent>();
  for (const e of events) {
    latestByStep.set(e.step, e);
  }

  return (
    <ol className="space-y-2.5">
      {STEP_ORDER.map((step) => {
        const event = latestByStep.get(step);
        if (!event) return null;
        const icon = event.status === "DONE" ? "✓" : event.status === "ACTIVE" ? "●" : "○";
        const color = event.status === "DONE" ? "text-signal-jade" : event.status === "ACTIVE" ? "text-signal-amber" : "text-cream-100/30";
        return (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span className={`font-mono w-4 ${color}`} aria-hidden="true">
              {icon}
            </span>
            <span className={event.status === "PENDING" ? "text-cream-100/40" : "text-cream-100"}>{event.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
