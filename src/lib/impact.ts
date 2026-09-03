import "server-only";
import { prisma } from "@/lib/db";

export interface ImpactSummary {
  potentialLossesPrevented: number;
  customersProtected: number;
  scamAttemptsInterrupted: number;
  accountsSafelyRecovered: number;
  accountsCurrentlyProtected: number;
  essentialPaymentsPreserved: number;
  baselineNetworkMetrics: { label: string; value: number; unit: string }[];
}

/**
 * Blends real, locally-generated activity (from Lab runs and live incidents)
 * with a small set of clearly-labeled synthetic baseline metrics that
 * represent the "network-wide" story for demo purposes. Nothing here is a
 * real-world claim.
 */
export async function getImpactSummary(): Promise<ImpactSummary> {
  const [incidents, protectedAccounts, recoveredCases, continuityPayments, distinctProtectedUsers, baseline] =
    await Promise.all([
      prisma.incident.findMany({ select: { amountSaved: true, status: true } }),
      prisma.account.count({ where: { status: "PROTECTED" } }),
      prisma.recoveryCase.count({ where: { status: "RESOLVED" } }),
      prisma.transactionEvent.count({ where: { type: "PAYMENT_COMPLETED", description: { contains: "essential" } } }),
      prisma.incident.findMany({ distinct: ["userId"], select: { userId: true } }),
      prisma.impactMetric.findMany(),
    ]);

  const potentialLossesPrevented = incidents.reduce((sum, i) => sum + i.amountSaved, 0);

  return {
    potentialLossesPrevented,
    customersProtected: distinctProtectedUsers.length,
    scamAttemptsInterrupted: incidents.length,
    accountsSafelyRecovered: recoveredCases,
    accountsCurrentlyProtected: protectedAccounts,
    essentialPaymentsPreserved: continuityPayments,
    baselineNetworkMetrics: baseline.map((m) => ({ label: m.label, value: m.value, unit: m.unit })),
  };
}
