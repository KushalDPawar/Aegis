import "server-only";
import { prisma } from "@/lib/db";
import type { GuardAction, RiskLevelName } from "@/lib/risk/types";
import { LEVEL_RANK } from "@/lib/risk/thresholds";

/**
 * Read layer for the bank operations console.
 *
 * Everything here is estate-wide — the console's whole job is to look across
 * customers — so these queries deliberately do not take an account filter. The
 * `requireBankOps` guard is what keeps them privileged; nothing in this module
 * should ever be called from a customer-facing route.
 */

export interface ConsoleTelemetry {
  /** Mean decision integrity across recent assessments, 0-100. */
  decisionIntegrityIndex: number;
  /** Share of risky payments that Aegis intervened on rather than let through. */
  fraudPreventionRate: number;
  /** Payments currently held awaiting a decision. */
  activeHolds: number;
  /** Interventions applied in the window. */
  interventions: number;
  /** Money held back from reaching a beneficiary. */
  amountProtected: number;
  /** Assessments in the sample, so the UI can be honest about small samples. */
  sampleSize: number;
}

/** Statuses that mean Aegis stepped in rather than letting the payment run. */
const INTERVENED_STATUSES = ["VERIFY_REQUIRED", "WARNED", "COOLING_PERIOD", "PAUSED", "ESCALATED"];
/** Statuses where money is still held and a human decision is outstanding. */
const HOLD_STATUSES = ["PAUSED", "ESCALATED", "COOLING_PERIOD"];

export async function getConsoleTelemetry(): Promise<ConsoleTelemetry> {
  const [assessmentAgg, assessmentCount, holds, interventions, incidentAgg] = await Promise.all([
    prisma.riskAssessment.aggregate({ _avg: { decisionIntegrity: true } }),
    prisma.riskAssessment.count(),
    prisma.transaction.count({ where: { status: { in: HOLD_STATUSES } } }),
    prisma.intervention.count(),
    prisma.incident.aggregate({ _sum: { amountAtRisk: true, amountSaved: true } }),
  ]);

  // "Prevention rate" is only meaningful against payments that actually
  // carried risk. Measuring it against all traffic would flatter the number
  // by counting every ordinary payment as a success.
  const [riskyTotal, riskyIntervened] = await Promise.all([
    prisma.transaction.count({ where: { riskAssessments: { some: { overallLevel: { in: ["HIGH", "VERY_HIGH", "CRITICAL"] } } } } }),
    prisma.transaction.count({
      where: {
        status: { in: INTERVENED_STATUSES },
        riskAssessments: { some: { overallLevel: { in: ["HIGH", "VERY_HIGH", "CRITICAL"] } } },
      },
    }),
  ]);

  return {
    decisionIntegrityIndex: Math.round(assessmentAgg._avg.decisionIntegrity ?? 0),
    fraudPreventionRate: riskyTotal === 0 ? 0 : Math.round((riskyIntervened / riskyTotal) * 100),
    activeHolds: holds,
    interventions,
    amountProtected: incidentAgg._sum.amountSaved ?? 0,
    sampleSize: assessmentCount,
  };
}

export interface StreamRow {
  id: string;
  createdAt: Date;
  amount: number;
  purpose: string;
  status: string;
  scenarioCode: string | null;
  customerName: string;
  vulnerabilityProfile: string;
  beneficiaryName: string;
  beneficiaryIsNew: boolean;
  overallLevel: RiskLevelName | null;
  decisionIntegrity: number | null;
  recommendedAction: GuardAction | null;
}

/** Newest-first payment stream across every account. */
export async function getTransactionStream(limit = 40): Promise<StreamRow[]> {
  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      beneficiary: true,
      account: { include: { user: { include: { profile: true } } } },
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return rows.map((t) => {
    const latest = t.riskAssessments[0];
    return {
      id: t.id,
      createdAt: t.createdAt,
      amount: t.amount,
      purpose: t.purpose,
      status: t.status,
      scenarioCode: t.scenarioCode,
      customerName: t.account.user.profile?.fullName ?? "Unknown",
      vulnerabilityProfile: t.account.user.profile?.vulnerabilityProfile ?? "STANDARD",
      beneficiaryName: t.beneficiary.name,
      beneficiaryIsNew: t.beneficiary.isFirstTime,
      overallLevel: (latest?.overallLevel as RiskLevelName) ?? null,
      decisionIntegrity: latest?.decisionIntegrity ?? null,
      recommendedAction: (latest?.recommendedAction as GuardAction) ?? null,
    };
  });
}

/** Everything the inspection drawer shows for one payment. */
export async function getTransactionInspection(transactionId: string) {
  const t = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      beneficiary: true,
      account: { include: { user: { include: { profile: true } } } },
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 1, include: { signals: true } },
      intentChecks: { orderBy: { createdAt: "desc" } },
      interventions: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!t) return null;

  const assessment = t.riskAssessments[0] ?? null;
  return {
    id: t.id,
    amount: t.amount,
    purpose: t.purpose,
    status: t.status,
    scenarioCode: t.scenarioCode,
    createdAt: t.createdAt,
    customer: {
      name: t.account.user.profile?.fullName ?? "Unknown",
      vulnerabilityProfile: t.account.user.profile?.vulnerabilityProfile ?? "STANDARD",
      age: t.account.user.profile?.age ?? null,
    },
    beneficiary: {
      name: t.beneficiary.name,
      isFirstTime: t.beneficiary.isFirstTime,
      trustScore: t.beneficiary.trustScore,
      suspiciousFlag: t.beneficiary.suspiciousFlag,
      relationship: t.beneficiary.relationship,
    },
    assessment: assessment
      ? {
          transactionRisk: assessment.transactionRisk,
          beneficiaryRisk: assessment.beneficiaryRisk,
          behavioralRisk: assessment.behavioralRisk,
          contextRisk: assessment.contextRisk,
          socialEngineeringRisk: assessment.socialEngineeringRisk,
          decisionIntegrity: assessment.decisionIntegrity,
          decisionIntegrityLabel: assessment.decisionIntegrityLabel as RiskLevelName,
          overallLevel: assessment.overallLevel as RiskLevelName,
          recommendedAction: assessment.recommendedAction as GuardAction,
          signals: assessment.signals.map((s) => ({
            category: s.category,
            code: s.code,
            label: s.label,
            weight: s.weight,
            contribution: s.contribution,
            detail: s.detail,
            confidence: s.confidence,
          })),
        }
      : null,
    intentChecks: t.intentChecks.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
    })),
    interventions: t.interventions.map((i) => ({
      action: i.action,
      reason: i.reason,
      explanation: i.explanation,
      customerChoice: i.customerChoice,
      createdAt: i.createdAt,
    })),
    events: t.events.map((e) => ({
      type: e.type,
      label: e.label,
      description: e.description,
      createdAt: e.createdAt,
    })),
  };
}

export type TransactionInspection = NonNullable<Awaited<ReturnType<typeof getTransactionInspection>>>;

/** Estate-wide incident queue, worst and newest first. */
export async function getIncidentQueue(limit = 30) {
  const rows = await prisma.incident.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      transaction: { include: { account: { include: { user: { include: { profile: true } } } } } },
      recoveryCase: true,
      _count: { select: { interventions: true, events: true } },
    },
  });

  return rows.map((i) => ({
    id: i.id,
    title: i.title,
    status: i.status,
    severity: i.severity as RiskLevelName,
    amountAtRisk: i.amountAtRisk,
    amountSaved: i.amountSaved,
    createdAt: i.createdAt,
    resolvedAt: i.resolvedAt,
    customerName: i.transaction?.account.user.profile?.fullName ?? "—",
    recoveryStatus: i.recoveryCase?.status ?? null,
    interventionCount: i._count.interventions,
    eventCount: i._count.events,
  }));
}

/** Chronological audit trail for the developer/logs view. */
export async function getAuditTrail(limit = 60) {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { include: { profile: true } } },
  });
  return rows.map((a) => ({
    id: a.id,
    actorRole: a.actorRole,
    actorName: a.user?.profile?.fullName ?? "system",
    action: a.action,
    target: a.target,
    metadata: a.metadata,
    createdAt: a.createdAt,
  }));
}

/** Counts by GUARD action, for the rule-tuning view's live distribution. */
export async function getActionDistribution() {
  const rows = await prisma.riskAssessment.groupBy({
    by: ["recommendedAction"],
    _count: { _all: true },
  });
  const total = rows.reduce((s, r) => s + r._count._all, 0);
  return { total, rows: rows.map((r) => ({ action: r.recommendedAction as GuardAction, count: r._count._all })) };
}

/** Counts by risk band, for the estate risk mix. */
export async function getLevelDistribution() {
  const rows = await prisma.riskAssessment.groupBy({
    by: ["overallLevel"],
    _count: { _all: true },
  });
  const total = rows.reduce((s, r) => s + r._count._all, 0);
  return { total, rows: rows.map((r) => ({ level: r.overallLevel as RiskLevelName, count: r._count._all })) };
}

/**
 * Mean contribution per signal category across all assessments.
 *
 * This is the closest thing the engine has to "which dimensions are actually
 * carrying the decisions", which is what makes it worth surfacing on the rule
 * tuning screen: it shows an operator where the score is really coming from
 * before they change a threshold.
 */
export async function getSignalCategoryWeights() {
  const rows = await prisma.riskSignal.groupBy({
    by: ["category"],
    _sum: { contribution: true },
    _count: { _all: true },
  });
  const total = rows.reduce((s, r) => s + (r._sum.contribution ?? 0), 0);
  return rows
    .map((r) => ({
      category: r.category,
      totalContribution: r._sum.contribution ?? 0,
      occurrences: r._count._all,
      share: total === 0 ? 0 : Math.round(((r._sum.contribution ?? 0) / total) * 100),
    }))
    .sort((a, b) => b.totalContribution - a.totalContribution);
}

export interface RiskPosture {
  /** Worst overall level currently on record, or null if nothing is scored. */
  worstLevel: RiskLevelName | null;
  /** Assessments scored HIGH or worse. */
  elevated: number;
  /** Assessments where the customer's decision itself looked compromised. */
  compromisedDecisions: number;
  total: number;
}

/**
 * The estate's actual risk posture.
 *
 * Mean decision integrity on its own is a misleading headline: it averages a
 * bimodal population (sound payments score in the 90s, coerced ones in the
 * 50s) into a comfortable-looking middle, and it ignores the transaction axis
 * entirely — so an estate with two VERY_HIGH cases open can still present as
 * "healthy". This returns the tail, which is what an operator actually needs.
 */
export async function getRiskPosture(): Promise<RiskPosture> {
  const rows = await prisma.riskAssessment.findMany({
    select: { overallLevel: true, decisionIntegrity: true },
  });
  if (rows.length === 0) {
    return { worstLevel: null, elevated: 0, compromisedDecisions: 0, total: 0 };
  }
  const worstLevel = rows
    .map((r) => r.overallLevel as RiskLevelName)
    .reduce((a, b) => (LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b));
  return {
    worstLevel,
    elevated: rows.filter((r) => LEVEL_RANK[r.overallLevel as RiskLevelName] >= LEVEL_RANK.HIGH).length,
    // integrity is 100 - risk, so anything at or below 70 sits at MODERATE
    // decision-integrity risk or worse on the engine's own bands.
    compromisedDecisions: rows.filter((r) => r.decisionIntegrity <= 70).length,
    total: rows.length,
  };
}
