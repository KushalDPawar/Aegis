import { TimelineDataPoint, FinancialResilienceData, ScenarioSimulationInputs } from '../types';

export const HISTORICAL_HEALTH_DATA: TimelineDataPoint[] = [
  { month: 'Oct 25', income: 165000, essential: 82000, discretionary: 28000, savingsBuffer: 480000, resilienceScore: 91 },
  { month: 'Nov 25', income: 165000, essential: 83500, discretionary: 31000, savingsBuffer: 475000, resilienceScore: 89 },
  { month: 'Dec 25', income: 185000, essential: 85000, discretionary: 48000, savingsBuffer: 460000, resilienceScore: 87 },
  { month: 'Jan 26', income: 165000, essential: 84000, discretionary: 38000, savingsBuffer: 440000, resilienceScore: 85 },
  { month: 'Feb 26', income: 165000, essential: 86000, discretionary: 42000, savingsBuffer: 410000, resilienceScore: 82 },
  { month: 'Mar 26', income: 165000, essential: 88000, discretionary: 46000, savingsBuffer: 380000, resilienceScore: 78 },
  { month: 'Apr 26', income: 165000, essential: 87500, discretionary: 49000, savingsBuffer: 345000, resilienceScore: 74 },
  { month: 'May 26', income: 165000, essential: 89000, discretionary: 52000, savingsBuffer: 310000, resilienceScore: 71 },
  { month: 'Jun 26', income: 165000, essential: 90000, discretionary: 55000, savingsBuffer: 270000, resilienceScore: 68 },
  { month: 'Jul 26', income: 165000, essential: 91500, discretionary: 57000, savingsBuffer: 225000, resilienceScore: 65 },
  { month: 'Aug 26', income: 165000, essential: 92000, discretionary: 59000, savingsBuffer: 180000, resilienceScore: 62 },
  { month: 'Sep 26', income: 165000, essential: 93000, discretionary: 61000, savingsBuffer: 145000, resilienceScore: 59 }
];

export const CURRENT_RESILIENCE_SUMMARY: FinancialResilienceData = {
  resilienceScore: 59,
  scoreChange3M: -15.7,
  rating: 'Vulnerable',
  monthlyIncome: 165000,
  essentialExpenses: 93000,
  discretionaryExpenses: 61000,
  liquidEmergencyBuffer: 145000,
  bufferRunwayMonths: 1.56, // 145000 / 93000
  debtToIncomeRatio: 37.8,
  savingsRate: 6.6,
  shockAbsorptionCapacity: 'A ₹40,000 unexpected medical or household shock would exhaust 28% of all remaining liquid liquidity.'
};

/**
 * Computes forward 6-month projections dynamically based on interactive slider inputs.
 */
export function calculateFutureProjections(
  inputs: ScenarioSimulationInputs,
  baseData: TimelineDataPoint = HISTORICAL_HEALTH_DATA[HISTORICAL_HEALTH_DATA.length - 1]
): TimelineDataPoint[] {
  const futureMonths = ['Oct 26', 'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27'];
  const projections: TimelineDataPoint[] = [];

  let currentBuffer = baseData.savingsBuffer;
  const baseIncome = baseData.income * (1 - inputs.incomeShock / 100);
  const adjustedDiscretionary = baseData.discretionary * (1 - inputs.discretionaryReduction / 100);
  const essential = baseData.essential;

  futureMonths.forEach((month, idx) => {
    const netCashflow = baseIncome - essential - adjustedDiscretionary - inputs.debtPrepayment + inputs.emergencyAutoSweep;
    currentBuffer = Math.max(0, currentBuffer + netCashflow);

    // Compute composite resilience score
    const runwayMonths = essential > 0 ? currentBuffer / essential : 0;
    const savingsRatio = baseIncome > 0 ? Math.max(0, netCashflow / baseIncome) : 0;

    let score = Math.round(
      Math.min(100, Math.max(15, 
        runwayMonths * 14 + 
        savingsRatio * 120 + 
        (100 - (inputs.incomeShock * 0.8)) * 0.4
      ))
    );

    projections.push({
      month,
      income: Math.round(baseIncome),
      essential: Math.round(essential),
      discretionary: Math.round(adjustedDiscretionary),
      savingsBuffer: Math.round(currentBuffer),
      resilienceScore: Math.min(100, Math.max(10, score)),
      projected: true
    });
  });

  return projections;
}
