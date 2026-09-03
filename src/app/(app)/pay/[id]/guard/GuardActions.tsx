"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Form";
import { applyGuardChoiceAction } from "@/lib/actions/payments";
import { COOLING_PERIOD_MS } from "@/lib/constants";

function useCooldown(interventionCreatedAt: string | null, active: boolean) {
  const [remaining, setRemaining] = useState(() => {
    if (!interventionCreatedAt) return 0;
    return Math.max(0, COOLING_PERIOD_MS - (Date.now() - new Date(interventionCreatedAt).getTime()));
  });

  useEffect(() => {
    if (!active || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [active, remaining]);

  return remaining;
}

export function GuardActions({
  transactionId,
  status,
  interventionCreatedAt,
}: {
  transactionId: string;
  status: string;
  interventionCreatedAt: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const needsCooldown = status === "COOLING_PERIOD" || status === "PAUSED";
  const remaining = useCooldown(interventionCreatedAt, needsCooldown);
  const cooldownDone = !needsCooldown || remaining <= 0;

  async function act(choice: string) {
    setLoading(choice);
    setError(null);
    const result = await applyGuardChoiceAction({ transactionId, choice });
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (choice === "contact_trusted") {
      router.push("/trusted-circle");
      return;
    }
    router.refresh();
  }

  if (status === "COMPLETED") {
    return <Alert tone="success">Payment completed. Funds have moved in this simulation.</Alert>;
  }
  if (status === "CANCELLED") {
    return <Alert tone="info">Payment cancelled — no funds moved.</Alert>;
  }

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      {(status === "ALLOWED" || status === "VERIFY_REQUIRED") && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1" loading={loading === "confirm_verification"} onClick={() => act("confirm_verification")}>
            {status === "VERIFY_REQUIRED" ? "Confirm identity & pay" : "Confirm & pay"}
          </Button>
          <Button size="lg" variant="outline" loading={loading === "cancel"} onClick={() => act("cancel")}>
            Cancel
          </Button>
        </div>
      )}

      {status === "WARNED" && (
        <div className="space-y-3">
          <Alert tone="warn">Please review the warning above carefully before deciding.</Alert>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1" loading={loading === "cancel"} onClick={() => act("cancel")}>
              Cancel payment
            </Button>
            <Button size="lg" variant="outline" loading={loading === "acknowledge_warning_continue"} onClick={() => act("acknowledge_warning_continue")}>
              I understand — continue anyway
            </Button>
          </div>
        </div>
      )}

      {status === "COOLING_PERIOD" && (
        <div className="space-y-3">
          <Alert tone="warn">
            This payment shows a strong scam signature. A short cooling period is required before it can proceed.
          </Alert>
          <CooldownDisplay remaining={remaining} />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={!cooldownDone}
              loading={loading === "continue_after_cooling"}
              onClick={() => act("continue_after_cooling")}
            >
              Continue after cooling period
            </Button>
            <Button size="lg" variant="outline" loading={loading === "cancel"} onClick={() => act("cancel")}>
              Cancel payment
            </Button>
          </div>
        </div>
      )}

      {status === "PAUSED" && (
        <div className="space-y-3">
          <Alert tone="error">This payment has been paused for your protection.</Alert>
          <CooldownDisplay remaining={remaining} label="Minimum reflection period" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Button size="lg" loading={loading === "keep_paused"} onClick={() => act("keep_paused")}>
              Keep payment paused
            </Button>
            <Button size="lg" variant="secondary" loading={loading === "contact_trusted"} onClick={() => act("contact_trusted")}>
              Talk to trusted contact
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={!cooldownDone}
              loading={loading === "continue_after_cooling"}
              onClick={() => act("continue_after_cooling")}
            >
              Continue after cooling period
            </Button>
            <Button size="lg" variant="ghost" loading={loading === "cancel"} onClick={() => act("cancel")}>
              Cancel payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CooldownDisplay({ remaining, label = "Cooling period" }: { remaining: number; label?: string }) {
  if (remaining <= 0) {
    return <p className="text-sm text-signal-jade font-mono">Cooling period complete — you may continue.</p>;
  }
  const seconds = Math.ceil(remaining / 1000);
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-signal-amber transition-[width] duration-1000 linear"
          style={{ width: `${100 - (seconds / (COOLING_PERIOD_MS / 1000)) * 100}%` }}
        />
      </div>
      <span className="font-mono text-sm text-signal-amber shrink-0">
        {label}: {seconds}s
      </span>
    </div>
  );
}
