"use server";

import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/auth/guard";
import { beneficiarySchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function addBeneficiaryAction(input: unknown): Promise<ActionResult<{ beneficiaryId: string }>> {
  const { session, account } = await requireCustomer();
  const parsed = beneficiarySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid beneficiary details." };
  }

  const beneficiary = await prisma.beneficiary.create({
    data: {
      accountId: account.id,
      name: parsed.data.name,
      bankAccountNumber: parsed.data.bankAccountNumber,
      ifsc: parsed.data.ifsc,
      relationship: parsed.data.relationship,
      category: parsed.data.category,
      isFirstTime: true,
      trustScore: 35,
      suspiciousFlag: false,
    },
  });

  await logAudit({
    userId: session.sub,
    actorRole: session.role,
    action: "BENEFICIARY_ADDED",
    target: `beneficiary:${beneficiary.id}`,
    metadata: { accountId: account.id },
  });

  revalidatePath("/pay");
  return { ok: true, data: { beneficiaryId: beneficiary.id } };
}
