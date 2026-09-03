import "server-only";
import { prisma } from "@/lib/db";
import { isBeneficiaryEssential } from "@/lib/continuity";
import {
  computeResilienceScore,
  ratingForScore,
  shockNarrative,
  type ResilienceSummary,
  type TimelinePoint,
} from "@/lib/health/resilience";

/**
 * Income is not modelled anywhere in this schema — there are no credit rows,
 * only outgoing payments. Rather than invent a number and present it as
 * observed, the model assumes a monthly income and every surface that uses it
 * is required to say so. `incomeIsAssumed` on the summary carries that flag.
 */
const ASSUMED_MONTHLY_INCOME_MULTIPLE = 1.35;
const MIN_ASSUMED_INCOME = 45000;

export interface CustomerResilience {
  userId: string;
  accountId: string;
  name: string;
  vulnerabilityProfile: string;
  summary: ResilienceSummary;
  history: TimelinePoint[];
}

function monthKey(d: Date) {
  return d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
}

/**
 * Builds a resilience picture per customer from real rows.
 *
 * Essential vs discretionary is decided by the beneficiary predicate that
 * Financial Continuity Mode already uses, so the split here and the payees who
 * stay reachable under protection can never disagree.
 */
export async function getCustomerResilience(): Promise<CustomerResilience[]> {
  const accounts = await prisma.account.findMany({
    where: { user: { role: "CUSTOMER" } },
    include: {
      user: { include: { profile: true } },
      transactions: { include: { beneficiary: true }, orderBy: { createdAt: "asc" } },
    },
  });

  return accounts.map((account) => {
    const outgoing = account.transactions.filter((t) => t.status !== "CANCELLED");

    // Group real payments into calendar months.
    const byMonth = new Map<string, { essential: number; discretionary: number; at: Date }>();
    for (const t of outgoing) {
      const key = monthKey(t.createdAt);
      const bucket = byMonth.get(key) ?? { essential: 0, discretionary: 0, at: t.createdAt };
      const essential = isBeneficiaryEssential({
        isFirstTime: t.beneficiary.isFirstTime,
        suspiciousFlag: t.beneficiary.suspiciousFlag,
        trustScore: t.beneficiary.trustScore,
      });
      if (essential) bucket.essential += t.amount;
      else bucket.discretionary += t.amount;
      byMonth.set(key, bucket);
    }

    const months = [...byMonth.entries()].sort((a, b) => a[1].at.getTime() - b[1].at.getTime());
    const essentialAvg =
      months.length === 0 ? 0 : months.reduce((s, [, m]) => s + m.essential, 0) / months.length;
    const discretionaryAvg =
      months.length === 0 ? 0 : months.reduce((s, [, m]) => s + m.discretionary, 0) / months.length;

    const monthlyOutflow = essentialAvg + discretionaryAvg;
    const monthlyIncome = Math.max(MIN_ASSUMED_INCOME, Math.round(monthlyOutflow * ASSUMED_MONTHLY_INCOME_MULTIPLE));

    const buffer = account.balance;
    const runwayMonths = essentialAvg > 0 ? buffer / essentialAvg : buffer > 0 ? 12 : 0;
    const netCashflow = monthlyIncome - monthlyOutflow;
    const savingsRatio = monthlyIncome > 0 ? netCashflow / monthlyIncome : 0;

    const score = computeResilienceScore({ runwayMonths, savingsRatio, incomeShockPct: 0 });

    // Reconstruct the observed months so the chart shows real history rather
    // than a straight line: buffer is walked backwards from today's balance.
    let running = buffer;
    const history: TimelinePoint[] = months
      .slice()
      .reverse()
      .map(([month, m]) => {
        const point: TimelinePoint = {
          month,
          essential: Math.round(m.essential),
          discretionary: Math.round(m.discretionary),
          savingsBuffer: Math.round(running),
          resilienceScore: computeResilienceScore({
            runwayMonths: m.essential > 0 ? running / m.essential : running > 0 ? 12 : 0,
            savingsRatio,
            incomeShockPct: 0,
          }),
        };
        running += m.essential + m.discretionary; // walking back in time
        return point;
      })
      .reverse();

    const first = history[0]?.resilienceScore ?? score;

    return {
      userId: account.userId,
      accountId: account.id,
      name: account.user.profile?.fullName ?? "Unknown",
      vulnerabilityProfile: account.user.profile?.vulnerabilityProfile ?? "STANDARD",
      summary: {
        resilienceScore: score,
        rating: ratingForScore(score),
        scoreChange: score - first,
        monthlyIncome,
        essentialExpenses: Math.round(essentialAvg),
        discretionaryExpenses: Math.round(discretionaryAvg),
        liquidEmergencyBuffer: Math.round(buffer),
        bufferRunwayMonths: Number(runwayMonths.toFixed(2)),
        savingsRate: Number((savingsRatio * 100).toFixed(1)),
        incomeIsAssumed: true,
        shockAbsorption: shockNarrative(buffer, essentialAvg),
      },
      history,
    };
  });
}
