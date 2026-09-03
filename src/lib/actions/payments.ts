"use server";

import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/auth/guard";
import { paymentSchema, intentAnswerSchema, guardChoiceSchema } from "@/lib/validation";
import { runRiskEngine } from "@/lib/risk/engine";
import { persistRiskAssessment } from "@/lib/risk/persist";
import { buildBeneficiarySignals, buildContextSignals, buildTransactionSignals } from "@/lib/risk/build-input";
import type { GuardAction, RiskInput, RiskLevelName, SocialEngineeringSignals } from "@/lib/risk/types";
import { runIntentCheck } from "@/lib/ai/intent-check";
import { INTENT_CHECK_INITIAL_QUESTION, mergeIndicators, pickDominantCategory } from "@/lib/ai/schema";
import { openIncidentForCriticalTransaction, cancelIncidentByCustomer, resolveIncidentAsFalsePositive } from "@/lib/incidents";
import { logAudit } from "@/lib/audit";
import { isBeneficiaryEssential } from "@/lib/continuity";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

import { COOLING_PERIOD_MS, MAX_INTENT_QUESTIONS } from "@/lib/constants";

type SnapshotInput = Omit<RiskInput, "socialEngineering">;

export async function createPaymentAction(
  input: unknown
): Promise<ActionResult<{ transactionId: string }>> {
  const { session, account, profile } = await requireCustomer();
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payment details." };
  }
  const { beneficiaryId, amount, purpose } = parsed.data;

  const beneficiary = await prisma.beneficiary.findUnique({ where: { id: beneficiaryId } });
  if (!beneficiary || beneficiary.accountId !== account.id) {
    return { ok: false, error: "Beneficiary not found." };
  }

  // Financial Continuity Mode: a PROTECTED account keeps essential banking
  // alive but blocks new/unverified beneficiaries at the business-logic
  // layer — deterministically, before the risk engine even runs.
  if (account.status === "PROTECTED") {
    if (!isBeneficiaryEssential(beneficiary)) {
      return {
        ok: false,
        error:
          "This account is under protective restriction following a recent incident. New or unverified beneficiaries are paused pending review — existing trusted payments remain available.",
      };
    }
  }
  if (account.status === "RESTRICTED") {
    return { ok: false, error: "This account is fully restricted. Contact the Recovery Center for next steps." };
  }
  if (amount > account.balance) {
    return { ok: false, error: "Insufficient balance for this payment." };
  }

  const transactionsLast24h = await prisma.transaction.count({
    where: { accountId: account.id, createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
  });

  const riskInput: SnapshotInput = {
    transaction: buildTransactionSignals({ amount, account, transactionsLast24h }),
    beneficiary: buildBeneficiarySignals(beneficiary),
    behavioral: {
      unusualLogin: false,
      unusualDevice: false,
      remoteAccessContext: false,
      rapidAppSwitching: false,
      unusualSessionDuration: false,
      suspiciousNavigationSequence: false,
    },
    context: buildContextSignals({ profile }),
  };

  const breakdown = runRiskEngine(riskInput);

  const transaction = await prisma.transaction.create({
    data: {
      accountId: account.id,
      beneficiaryId,
      amount,
      purpose,
      status: "PENDING",
      riskInputSnapshot: JSON.stringify(riskInput),
    },
  });

  await prisma.transactionEvent.create({
    data: {
      transactionId: transaction.id,
      type: "PAYMENT_INITIATED",
      label: `₹${amount.toLocaleString("en-IN")} payment initiated`,
      description: `Payment to ${beneficiary.name} for "${purpose}".`,
    },
  });

  await persistRiskAssessment(transaction.id, breakdown);
  await logAudit({
    userId: session.sub,
    actorRole: session.role,
    action: "PAYMENT_INITIATED",
    target: `transaction:${transaction.id}`,
    metadata: { amount },
  });

  revalidatePath("/dashboard");
  return { ok: true, data: { transactionId: transaction.id } };
}

/** Called from the Risk Analysis screen's "Continue" action. */
export async function proceedFromRiskAction(transactionId: string): Promise<ActionResult<{ next: "intent-check" | "guard" }>> {
  const { session } = await requireCustomer();
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true, riskAssessments: { orderBy: { createdAt: "desc" }, take: 1 }, intentChecks: true },
  });
  if (!transaction || transaction.account.userId !== session.sub) {
    return { ok: false, error: "Transaction not found." };
  }
  const latest = transaction.riskAssessments[0];
  if (!latest) return { ok: false, error: "Risk assessment missing." };

  if (latest.overallLevel !== "LOW" && latest.overallLevel !== "MODERATE" && transaction.intentChecks.length === 0) {
    // Recompute needsIntentCheck deterministically from the stored breakdown
    // rather than trusting client input.
    const needsCheck =
      latest.behavioralRisk * 0.4 + latest.contextRisk * 0.6 >= 35 && transaction.intentChecks.length === 0;
    if (needsCheck) return { ok: true, data: { next: "intent-check" } };
  }

  await finalizeGuardDecision(transactionId);
  return { ok: true, data: { next: "guard" } };
}

function classificationToSocialEngineering(indicators: {
  authorityImpersonation: boolean;
  urgency: boolean;
  fear: boolean;
  accountSuspensionThreat: boolean;
  kycImpersonation: boolean;
  instructionFollowing: boolean;
  remoteAccessRequest: boolean;
  otpOrSafeAccountRequest: boolean;
}, confidence: number): SocialEngineeringSignals {
  return { ...indicators, aiConfidence: confidence };
}

export async function submitIntentAnswerAction(
  input: unknown
): Promise<ActionResult<{ followUpQuestion: string | null; finalized: boolean }>> {
  const { session } = await requireCustomer();
  const parsed = intentAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please share a short answer." };
  }
  const { transactionId, answer } = parsed.data;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true, intentChecks: { orderBy: { sequence: "asc" } } },
  });
  if (!transaction || transaction.account.userId !== session.sub) {
    return { ok: false, error: "Transaction not found." };
  }
  if (transaction.status !== "PENDING") {
    return { ok: false, error: "This payment has already been decided." };
  }

  const questionCount = transaction.intentChecks.length;
  const question =
    questionCount === 0
      ? INTENT_CHECK_INITIAL_QUESTION
      : transaction.intentChecks[questionCount - 1].followUpQuestion ?? INTENT_CHECK_INITIAL_QUESTION;
  const priorAnswers = transaction.intentChecks.map((c) => c.response);

  const { result, source } = await runIntentCheck({ question, answer, priorAnswers, questionCount });

  await prisma.intentCheck.create({
    data: {
      transactionId,
      sequence: questionCount + 1,
      question,
      response: answer,
      classification: JSON.stringify(result),
      indicators: JSON.stringify(result.indicators),
      scamCategory: result.scamCategory,
      confidence: result.confidence,
      source,
      followUpQuestion: result.followUpQuestion,
    },
  });

  // Recompute the full breakdown with social-engineering signals ACCUMULATED
  // across every answer given so far in this conversation — a later answer
  // must never cause an earlier turn's indicators (e.g. authority
  // impersonation) to be silently dropped. Transaction/beneficiary/
  // behavioral/context inputs are reused from submission time so those axes
  // stay stable.
  if (!transaction.riskInputSnapshot) {
    return { ok: false, error: "Risk snapshot missing for this transaction." };
  }
  const snapshot = JSON.parse(transaction.riskInputSnapshot) as SnapshotInput;
  const allIndicatorSets = [...transaction.intentChecks.map((c) => JSON.parse(c.indicators)), result.indicators];
  const mergedIndicators = mergeIndicators(allIndicatorSets);
  const maxConfidence = Math.max(result.confidence, ...transaction.intentChecks.map((c) => c.confidence));
  const socialEngineering = classificationToSocialEngineering(mergedIndicators, maxConfidence);
  const breakdown = runRiskEngine({ ...snapshot, socialEngineering });
  await persistRiskAssessment(transactionId, breakdown);

  const shouldAskAgain =
    result.followUpQuestion &&
    questionCount + 1 < MAX_INTENT_QUESTIONS &&
    (breakdown.overallLevel === "HIGH" || breakdown.overallLevel === "VERY_HIGH" || breakdown.overallLevel === "CRITICAL");

  await logAudit({
    userId: session.sub,
    actorRole: session.role,
    action: "INTENT_CHECK_ANSWERED",
    target: `transaction:${transactionId}`,
    metadata: { source, scamCategory: result.scamCategory },
  });

  if (shouldAskAgain) {
    return { ok: true, data: { followUpQuestion: result.followUpQuestion, finalized: false } };
  }

  await finalizeGuardDecision(transactionId);
  return { ok: true, data: { followUpQuestion: null, finalized: true } };
}

async function finalizeGuardDecision(transactionId: string) {
  const transaction = await prisma.transaction.findUniqueOrThrow({
    where: { id: transactionId },
    include: {
      account: true,
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 1, include: { signals: true } },
      intentChecks: { orderBy: { sequence: "asc" } },
    },
  });
  const latest = transaction.riskAssessments[0];
  if (!latest) throw new Error("No risk assessment to finalize against.");

  const topSignals = [...latest.signals].sort((a, b) => b.contribution - a.contribution).slice(0, 3);
  const reason = topSignals.map((s) => s.label).join(", ") || "Standard verification checks";

  const scamCategory = pickDominantCategory(
    transaction.intentChecks.map((c) => ({ scamCategory: c.scamCategory ?? "NONE", confidence: c.confidence }))
  );
  const categoryLabel = scamCategory && scamCategory !== "NONE" ? scamCategory.replace(/_/g, " ").toLowerCase() : null;

  const explanationByAction: Record<string, string> = {
    ALLOW: "No unusual characteristics detected. Standard verification applies.",
    VERIFY: "Some characteristics warrant a quick additional verification step before this payment proceeds.",
    WARN: categoryLabel
      ? `We detected characteristics commonly associated with ${categoryLabel} scams. Please review before continuing.`
      : "We detected behavioral characteristics associated with social-engineering scams. Please review before continuing.",
    COOLING_PERIOD: "This payment shows a strong scam signature. We're applying a short cooling period before it can proceed.",
    PAUSE: categoryLabel
      ? `We detected multiple characteristics commonly associated with ${categoryLabel} scams. This payment has been paused for your protection.`
      : "We detected multiple characteristics commonly associated with scam activity. This payment has been paused for your protection.",
  };

  let newStatus: "ALLOWED" | "VERIFY_REQUIRED" | "WARNED" | "COOLING_PERIOD" | "PAUSED";
  switch (latest.recommendedAction as GuardAction) {
    case "ALLOW":
      newStatus = "ALLOWED";
      break;
    case "VERIFY":
      newStatus = "VERIFY_REQUIRED";
      break;
    case "WARN":
      newStatus = "WARNED";
      break;
    case "COOLING_PERIOD":
      newStatus = "COOLING_PERIOD";
      break;
    case "PAUSE":
      newStatus = "PAUSED";
      break;
  }

  let incidentId: string | undefined;
  if (newStatus === "PAUSED") {
    const { incident } = await openIncidentForCriticalTransaction({
      transactionId,
      userId: transaction.account.userId,
      accountId: transaction.accountId,
      amount: transaction.amount,
      severity: latest.overallLevel as RiskLevelName,
      scamCategory,
    });
    incidentId = incident.id;

    await prisma.incidentEvent.createMany({
      data: [
        {
          incidentId: incident.id,
          timestamp: new Date(),
          label: "Social-engineering pattern identified",
          description: reason,
          sourceType: "RISK_ENGINE",
          severity: latest.socialEngineeringRisk,
        },
        {
          incidentId: incident.id,
          timestamp: new Date(),
          label: "Payment paused",
          description: explanationByAction.PAUSE,
          sourceType: "GUARD",
          severity: 100,
        },
      ],
    });
  }

  await prisma.intervention.create({
    data: {
      transactionId,
      incidentId,
      action: latest.recommendedAction,
      reason,
      explanation: explanationByAction[latest.recommendedAction],
    },
  });

  await prisma.transaction.update({ where: { id: transactionId }, data: { status: newStatus } });
  await prisma.transactionEvent.create({
    data: {
      transactionId,
      type: "INTERVENTION",
      label: `Guard decision: ${latest.recommendedAction}`,
      description: explanationByAction[latest.recommendedAction],
    },
  });

  revalidatePath("/dashboard");
}

async function completeTransaction(transactionId: string, overrideNote?: string) {
  const transaction = await prisma.transaction.findUniqueOrThrow({
    where: { id: transactionId },
    include: { account: true, beneficiary: true },
  });

  const newAvg =
    transaction.account.avgTxnAmount > 0
      ? transaction.account.avgTxnAmount * 0.8 + transaction.amount * 0.2
      : transaction.amount;

  await prisma.account.update({
    where: { id: transaction.accountId },
    data: { balance: { decrement: transaction.amount }, avgTxnAmount: newAvg },
  });
  await prisma.beneficiary.update({
    where: { id: transaction.beneficiaryId },
    data: { isFirstTime: false, trustScore: Math.min(90, transaction.beneficiary.trustScore + 5) },
  });
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  await prisma.transactionEvent.create({
    data: {
      transactionId,
      type: "PAYMENT_COMPLETED",
      label: "Payment completed",
      description: overrideNote ?? "Payment completed successfully.",
    },
  });
}

export async function applyGuardChoiceAction(input: unknown): Promise<ActionResult<{ status: string }>> {
  const { session } = await requireCustomer();
  const parsed = guardChoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid choice." };
  const { transactionId, choice } = parsed.data;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true, incidents: { where: { status: "ACTIVE" } }, interventions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!transaction || transaction.account.userId !== session.sub) {
    return { ok: false, error: "Transaction not found." };
  }

  const logChoice = (note: string) =>
    logAudit({ userId: session.sub, actorRole: session.role, action: `GUARD_${choice.toUpperCase()}`, target: `transaction:${transactionId}`, metadata: { note } });

  switch (choice) {
    case "confirm_verification": {
      if (transaction.status !== "ALLOWED" && transaction.status !== "VERIFY_REQUIRED") {
        return { ok: false, error: "This payment is not awaiting verification." };
      }
      await completeTransaction(transactionId);
      await logChoice("Verification confirmed.");
      break;
    }
    case "acknowledge_warning_continue": {
      if (transaction.status !== "WARNED") {
        return { ok: false, error: "This payment is not in a warned state." };
      }
      await completeTransaction(transactionId, "Customer reviewed the warning and chose to continue.");
      await prisma.intervention.updateMany({
        where: { transactionId },
        data: { customerChoice: "acknowledged_and_continued" },
      });
      await logChoice("Customer overrode warning after review.");
      break;
    }
    case "continue_after_cooling": {
      if (transaction.status !== "COOLING_PERIOD" && transaction.status !== "PAUSED") {
        return { ok: false, error: "This payment is not in a cooling period." };
      }
      const intervention = transaction.interventions[0];
      const elapsed = intervention ? Date.now() - new Date(intervention.createdAt).getTime() : 0;
      if (elapsed < COOLING_PERIOD_MS) {
        return { ok: false, error: "The cooling period is still active. Please wait before continuing." };
      }
      await completeTransaction(transactionId, "Customer continued after the cooling period elapsed.");
      await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: "continued_after_cooling" } });
      for (const incident of transaction.incidents) {
        await resolveIncidentAsFalsePositive(incident.id, "the customer (self-override after cooling period)");
      }
      await logChoice("Continued after cooling period.");
      break;
    }
    case "cancel": {
      if (transaction.status === "COMPLETED" || transaction.status === "CANCELLED") {
        return { ok: false, error: "This payment can no longer be cancelled." };
      }
      await prisma.transaction.update({ where: { id: transactionId }, data: { status: "CANCELLED" } });
      await prisma.transactionEvent.create({
        data: { transactionId, type: "PAYMENT_CANCELLED", label: "Payment cancelled", description: "Customer cancelled the payment." },
      });
      await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: "cancelled" } });
      for (const incident of transaction.incidents) {
        await cancelIncidentByCustomer(incident.id);
      }
      await logChoice("Customer cancelled the payment.");
      break;
    }
    case "keep_paused": {
      if (transaction.status !== "PAUSED") return { ok: false, error: "This payment is not paused." };
      await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: "kept_paused" } });
      await logChoice("Customer chose to keep the payment paused.");
      break;
    }
    case "contact_trusted": {
      if (transaction.status !== "PAUSED") return { ok: false, error: "This payment is not paused." };
      await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: "opened_trusted_circle" } });
      await logChoice("Customer opened Trusted Circle for help.");
      break;
    }
  }

  revalidatePath("/dashboard");
  const updated = await prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } });
  return { ok: true, data: { status: updated.status } };
}
