/**
 * Financial resilience model.
 *
 * Ported from the reference implementation's health predictor, but wired to
 * this project's real data instead of a fixture: the emergency buffer is the
 * account balance, and the essential/discretionary split comes from actual
 * outgoing payments classified with `isBeneficiaryEssential` — the same
 * predicate Financial Continuity Mode uses to decide who stays payable.
 *
 * Why this belongs next to fraud detection: a customer with under two months
 * of runway is not just financially fragile, they are a materially better
 * target. Urgency lands harder when there is no cushion, which is exactly the
 * lever "your account will be frozen" scams pull. Resilience is therefore a
 * risk input, not a separate wellness feature.
 */

export type ResilienceRating = "Robust" | "Resilient" | "Vulnerable" | "Critical";

export interface TimelinePoint {
  month: string;
  essential: number;
  discretionary: number;
  savingsBuffer: number;
  resilienceScore: number;
  projected?: boolean;
}

export interface ResilienceSummary {
  resilienceScore: number;
  rating: ResilienceRating;
  /** Change over the observed window, in points. */
  scoreChange: number;
  monthlyIncome: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  liquidEmergencyBuffer: number;
  bufferRunwayMonths: number;
  savingsRate: number;
  /** True when income is an assumption rather than observed data. */
  incomeIsAssumed: boolean;
  shockAbsorption: string;
}

export interface ScenarioInputs {
  /** Percentage drop in income, 0-60. */
  incomeShock: number;
  /** Percentage cut to discretionary spending, 0-60. */
  discretionaryReduction: number;
  /** Extra monthly debt prepayment, rupees. */
  debtPrepayment: number;
  /** Monthly automatic sweep into the emergency buffer, rupees. */
  emergencyAutoSweep: number;
}

export const NEUTRAL_INPUTS: ScenarioInputs = {
  incomeShock: 0,
  discretionaryReduction: 0,
  debtPrepayment: 0,
  emergencyAutoSweep: 0,
};

export function ratingForScore(score: number): ResilienceRating {
  if (score >= 80) return "Robust";
  if (score >= 60) return "Resilient";
  if (score >= 40) return "Vulnerable";
  return "Critical";
}

/**
 * Composite resilience score.
 *
 * Runway dominates because months-of-cover is what actually determines whether
 * a household survives a shock; savings rate and income stability adjust it.
 * Clamped to 10-100 so an empty buffer still produces a usable figure rather
 * than collapsing to zero.
 */
export function computeResilienceScore(params: {
  runwayMonths: number;
  savingsRatio: number;
  incomeShockPct: number;
}): number {
  const { runwayMonths, savingsRatio, incomeShockPct } = params;
  const raw =
    runwayMonths * 14 + Math.max(0, savingsRatio) * 120 + (100 - incomeShockPct * 0.8) * 0.4;
  return Math.round(Math.min(100, Math.max(10, raw)));
}

/** Six months forward from the latest observed point, under the given levers. */
export function projectForward(
  latest: TimelinePoint,
  monthlyIncome: number,
  inputs: ScenarioInputs,
  months: string[]
): TimelinePoint[] {
  const income = monthlyIncome * (1 - inputs.incomeShock / 100);
  const discretionary = latest.discretionary * (1 - inputs.discretionaryReduction / 100);
  const essential = latest.essential;

  let buffer = latest.savingsBuffer;
  return months.map((month) => {
    const netCashflow = income - essential - discretionary - inputs.debtPrepayment + inputs.emergencyAutoSweep;
    buffer = Math.max(0, buffer + netCashflow);
    const runwayMonths = essential > 0 ? buffer / essential : 0;
    const savingsRatio = income > 0 ? netCashflow / income : 0;
    return {
      month,
      essential: Math.round(essential),
      discretionary: Math.round(discretionary),
      savingsBuffer: Math.round(buffer),
      resilienceScore: computeResilienceScore({
        runwayMonths,
        savingsRatio,
        incomeShockPct: inputs.incomeShock,
      }),
      projected: true,
    };
  });
}

/** Month labels for the six months following `from`. */
export function nextMonths(from: Date, count = 6): string[] {
  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    out.push(d.toLocaleString("en-IN", { month: "short", year: "2-digit" }));
  }
  return out;
}

export function shockNarrative(buffer: number, essential: number): string {
  const shock = 40000;
  if (buffer <= 0) return "There is no liquid buffer left to absorb an unexpected cost.";
  const pct = Math.round((shock / buffer) * 100);
  const runway = essential > 0 ? buffer / essential : 0;
  if (pct >= 100) {
    return `A ₹40,000 unexpected cost would wipe out the entire remaining buffer, with ${runway.toFixed(1)} months of essentials currently covered.`;
  }
  return `A ₹40,000 unexpected medical or household cost would consume ${pct}% of all remaining liquidity, leaving roughly ${((buffer - shock) / Math.max(1, essential)).toFixed(1)} months of essentials covered.`;
}
