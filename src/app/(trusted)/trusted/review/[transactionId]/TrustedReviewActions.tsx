"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Form";
import { trustedContactActionOnTransaction } from "@/lib/actions/trusted";

export function TrustedReviewActions({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function act(action: "keep_paused" | "contact_customer" | "approve") {
    setLoading(action);
    setError(null);
    const result = await trustedContactActionOnTransaction({ transactionId, action });
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (action === "keep_paused") setDone("You chose to keep this payment paused.");
    if (action === "contact_customer") setDone("Logged — you're reaching out to the customer directly (simulated).");
    if (action === "approve") {
      setDone("Approved. The payment has been completed.");
      router.refresh();
    }
  }

  if (done) return <Alert tone="success">{done}</Alert>;

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid sm:grid-cols-3 gap-3">
        <Button loading={loading === "keep_paused"} onClick={() => act("keep_paused")}>
          Keep paused
        </Button>
        <Button variant="secondary" loading={loading === "contact_customer"} onClick={() => act("contact_customer")}>
          Contact customer
        </Button>
        <Button variant="outline" loading={loading === "approve"} onClick={() => act("approve")}>
          Approve payment
        </Button>
      </div>
    </div>
  );
}
