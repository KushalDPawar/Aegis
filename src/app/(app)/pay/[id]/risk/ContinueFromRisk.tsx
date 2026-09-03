"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Form";
import { proceedFromRiskAction } from "@/lib/actions/payments";

export function ContinueFromRisk({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rise" style={{ animationDelay: "260ms" }}>
      {error && (
        <div className="mb-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <Button
        size="lg"
        className="w-full"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          const result = await proceedFromRiskAction(transactionId);
          if (!result.ok) {
            setError(result.error);
            setLoading(false);
            return;
          }
          router.push(result.data.next === "intent-check" ? `/pay/${transactionId}/intent-check` : `/pay/${transactionId}/guard`);
        }}
      >
        Continue
      </Button>
    </div>
  );
}
