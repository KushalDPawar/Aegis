"use server";

import { requireCustomer } from "@/lib/auth/guard";
import { materializeScenario } from "@/lib/scenarios/runner";
import type { ScenarioCode } from "@/lib/scenarios/definitions";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "./auth";

export async function runScenarioAction(code: ScenarioCode): Promise<ActionResult<{ transactionId: string }>> {
  const { session, account } = await requireCustomer();
  const { transactionId } = await materializeScenario({ userId: session.sub, accountId: account.id, code });
  await logAudit({
    userId: session.sub,
    actorRole: session.role,
    action: "LAB_SCENARIO_RUN",
    target: `transaction:${transactionId}`,
    metadata: { code },
  });
  return { ok: true, data: { transactionId } };
}
