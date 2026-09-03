import "server-only";
import { prisma } from "@/lib/db";
import type { RiskBreakdown } from "./types";

export async function persistRiskAssessment(transactionId: string, breakdown: RiskBreakdown) {
  return prisma.riskAssessment.create({
    data: {
      transactionId,
      transactionRisk: breakdown.transactionRisk,
      beneficiaryRisk: breakdown.beneficiaryRisk,
      behavioralRisk: breakdown.behavioralRisk,
      contextRisk: breakdown.contextRisk,
      socialEngineeringRisk: breakdown.socialEngineeringRisk,
      decisionIntegrity: breakdown.decisionIntegrity,
      decisionIntegrityLabel: breakdown.decisionIntegrityLabel,
      overallLevel: breakdown.overallLevel,
      recommendedAction: breakdown.recommendedAction,
      signals: {
        create: breakdown.signals.map((s) => ({
          category: s.category,
          code: s.code,
          label: s.label,
          weight: s.weight,
          contribution: s.contribution,
          detail: s.detail,
          confidence: s.confidence,
        })),
      },
    },
    include: { signals: true },
  });
}
