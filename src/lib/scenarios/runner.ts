import "server-only";
import { prisma } from "@/lib/db";
import { runRiskEngine } from "@/lib/risk/engine";
import { persistRiskAssessment } from "@/lib/risk/persist";
import { buildBeneficiarySignals, buildContextSignals, buildTransactionSignals } from "@/lib/risk/build-input";
import { getScenario, type ScenarioCode } from "./definitions";

/**
 * Materializes a Lab scenario into real database rows for the given account:
 * a beneficiary, a session/transaction timeline, a transaction, and an
 * initial deterministic risk assessment. Nothing here is faked in the UI
 * layer — every screen downstream (TRACE, GUARD, Scam DNA, Replay) reads
 * from these same rows.
 */
export async function materializeScenario(params: { userId: string; accountId: string; code: ScenarioCode }) {
  const scenario = getScenario(params.code);

  const account = await prisma.account.findUniqueOrThrow({ where: { id: params.accountId } });
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: params.userId } });

  const beneficiary = scenario.beneficiary.isNew
    ? await prisma.beneficiary.create({
        data: {
          accountId: account.id,
          name: scenario.beneficiary.name,
          bankAccountNumber: String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999)),
          ifsc: "SIML0" + Math.floor(100000 + Math.random() * 899999),
          relationship: scenario.beneficiary.relationship,
          isFirstTime: true,
          trustScore: scenario.beneficiary.trustScore,
          suspiciousFlag: scenario.beneficiary.suspiciousFlag,
          category: scenario.beneficiary.category,
        },
      })
    : await (async () => {
        const existing = await prisma.beneficiary.findFirst({
          where: { accountId: account.id, name: scenario.beneficiary.name },
        });
        if (existing) return existing;
        return prisma.beneficiary.create({
          data: {
            accountId: account.id,
            name: scenario.beneficiary.name,
            bankAccountNumber: String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999)),
            ifsc: "SIML0" + Math.floor(100000 + Math.random() * 899999),
            relationship: scenario.beneficiary.relationship,
            isFirstTime: false,
            trustScore: scenario.beneficiary.trustScore,
            suspiciousFlag: false,
            category: scenario.beneficiary.category,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
          },
        });
      })();

  const now = Date.now();
  const transaction = await prisma.transaction.create({
    data: {
      accountId: account.id,
      beneficiaryId: beneficiary.id,
      amount: scenario.amount,
      purpose: scenario.purpose,
      status: "PENDING",
      scenarioCode: scenario.code,
    },
  });

  for (const step of scenario.timeline) {
    await prisma.transactionEvent.create({
      data: {
        transactionId: transaction.id,
        type: step.type,
        label: step.label,
        description: step.description,
        metadata: JSON.stringify({ severity: step.severity, sourceType: step.sourceType }),
        createdAt: new Date(now - step.offsetMinutesAgo * 60 * 1000),
      },
    });
    if (step.sourceType === "SESSION") {
      await prisma.sessionEvent.create({
        data: {
          userId: params.userId,
          type: step.type,
          label: step.label,
          severity: step.severity,
          metadata: JSON.stringify({ scenario: scenario.code }),
          createdAt: new Date(now - step.offsetMinutesAgo * 60 * 1000),
        },
      });
    }
  }

  const transactionsLast24h = await prisma.transaction.count({
    where: { accountId: account.id, createdAt: { gte: new Date(now - 1000 * 60 * 60 * 24) } },
  });

  const riskInput = {
    transaction: buildTransactionSignals({
      amount: scenario.amount,
      account,
      transactionsLast24h,
      forceUnusualTime: scenario.transaction.unusualTime,
    }),
    beneficiary: buildBeneficiarySignals(beneficiary),
    behavioral: scenario.behavioral,
    context: buildContextSignals({
      profile,
      urgencyIndicator: scenario.context.urgencyIndicator,
      suspiciousCallReported: scenario.context.suspiciousCallReported,
      knownScamPatternCode: scenario.scamCategory,
      activeScamSimulation: true,
    }),
    socialEngineering: null,
  };

  const breakdown = runRiskEngine(riskInput);
  await persistRiskAssessment(transaction.id, breakdown);
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { riskInputSnapshot: JSON.stringify({ transaction: riskInput.transaction, beneficiary: riskInput.beneficiary, behavioral: riskInput.behavioral, context: riskInput.context }) },
  });

  return { transactionId: transaction.id, needsIntentCheck: breakdown.needsIntentCheck, scenario };
}
