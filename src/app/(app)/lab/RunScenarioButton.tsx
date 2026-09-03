"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Form";
import { runScenarioAction } from "@/lib/actions/lab";
import type { ScenarioCode } from "@/lib/scenarios/definitions";

export function RunScenarioButton({ code, isLegitimate }: { code: ScenarioCode; isLegitimate: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && (
        <div className="mb-2">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <Button
        variant={isLegitimate ? "outline" : "primary"}
        className="w-full"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          const result = await runScenarioAction(code);
          if (!result.ok) {
            setError(result.error);
            setLoading(false);
            return;
          }
          router.push(`/pay/${result.data.transactionId}/risk`);
        }}
      >
        Run scenario
      </Button>
    </div>
  );
}
