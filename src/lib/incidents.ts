import "server-only";
import { prisma } from "@/lib/db";
import { generateScamSignature, SCAM_PATTERN_LIBRARY } from "@/lib/scam-dna";
import { SCAM_CATEGORY_LABELS, type ScamCategory } from "@/lib/ai/schema";
import type { RiskLevelName } from "@/lib/risk/types";

async function ensureScamPattern(category: ScamCategory) {
  const lib = SCAM_PATTERN_LIBRARY[category];
  return prisma.scamPattern.upsert({
    where: { code: category },
    update: {},
    create: {
      code: category,
      name: SCAM_CATEGORY_LABELS[category],
      category,
      vector: lib.vector,
      psychology: lib.psychology,
      description: lib.description,
    },
  });
}

/**
 * Opens an incident + recovery case when GUARD escalates a transaction to
 * PAUSE. This is the CRITICAL-severity path only — everything below that is
 * handled purely through VERIFY / WARN / COOLING_PERIOD friction.
 */
export async function openIncidentForCriticalTransaction(params: {
  transactionId: string;
  userId: string;
  accountId: string;
  amount: number;
  severity: RiskLevelName;
  scamCategory: ScamCategory | null;
}) {
  const category = params.scamCategory ?? "NONE";
  const pattern = await ensureScamPattern(category);
  const signature = generateScamSignature(category, params.transactionId);

  const incident = await prisma.incident.create({
    data: {
      userId: params.userId,
      transactionId: params.transactionId,
      scamPatternId: pattern.id,
      title: category === "NONE" ? "Suspicious Transaction Pattern" : SCAM_CATEGORY_LABELS[category],
      status: "ACTIVE",
      severity: params.severity,
      signature,
      amountAtRisk: params.amount,
      amountSaved: params.amount,
    },
  });

  await prisma.account.update({ where: { id: params.accountId }, data: { status: "PROTECTED" } });

  const recoveryCase = await prisma.recoveryCase.create({
    data: {
      incidentId: incident.id,
      accountId: params.accountId,
      status: "OPENED",
      amountUnderReview: params.amount,
      amountProtected: params.amount,
      events: {
        create: [
          { step: "INCIDENT_REPORTED", status: "DONE", label: "Incident reported" },
          { step: "BENEFICIARY_CONTAINED", status: "DONE", label: "Suspicious beneficiary contained" },
          { step: "TRANSACTION_FLAGGED", status: "DONE", label: "Transaction flagged" },
          { step: "BANK_REVIEW", status: "ACTIVE", label: "Bank review" },
          { step: "ACCOUNT_RESTORATION", status: "PENDING", label: "Account restoration" },
          { step: "FINAL_RESOLUTION", status: "PENDING", label: "Final resolution" },
        ],
      },
    },
  });

  return { incident, recoveryCase, pattern };
}

export async function resolveIncidentAsFalsePositive(incidentId: string, resolvedBy: string) {
  const incident = await prisma.incident.update({
    where: { id: incidentId },
    data: { status: "CONTAINED", resolvedAt: new Date() },
    include: { recoveryCase: true, transaction: { include: { account: true } } },
  });

  if (incident.recoveryCase) {
    await prisma.recoveryCase.update({
      where: { id: incident.recoveryCase.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        events: {
          create: [
            { step: "BANK_REVIEW", status: "DONE", label: `Reviewed and cleared by ${resolvedBy}` },
            { step: "ACCOUNT_RESTORATION", status: "DONE", label: "Account restored to full access" },
            { step: "FINAL_RESOLUTION", status: "DONE", label: "Case resolved — funds released" },
          ],
        },
      },
    });
  }

  if (incident.transaction) {
    const otherActive = await prisma.incident.count({
      where: { userId: incident.userId, status: "ACTIVE", id: { not: incident.id } },
    });
    if (otherActive === 0) {
      await prisma.account.update({ where: { id: incident.transaction.accountId }, data: { status: "ACTIVE" } });
    }
  }

  return incident;
}

export async function cancelIncidentByCustomer(incidentId: string) {
  const incident = await prisma.incident.update({
    where: { id: incidentId },
    data: { status: "CONTAINED", resolvedAt: new Date() },
    include: { recoveryCase: true, transaction: true },
  });

  if (incident.recoveryCase) {
    await prisma.recoveryCase.update({
      where: { id: incident.recoveryCase.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        events: {
          create: [
            { step: "FINAL_RESOLUTION", status: "DONE", label: "Customer cancelled the payment — no funds moved" },
          ],
        },
      },
    });
  }

  if (incident.transaction) {
    const otherActive = await prisma.incident.count({
      where: { userId: incident.userId, status: "ACTIVE", id: { not: incident.id } },
    });
    if (otherActive === 0) {
      await prisma.account.update({ where: { id: incident.transaction.accountId }, data: { status: "ACTIVE" } });
    }
  }

  return incident;
}
