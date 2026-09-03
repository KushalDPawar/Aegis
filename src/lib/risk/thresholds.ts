import type { GuardAction, RiskLevelName } from "./types";

/**
 * Score buckets (0-100, higher = riskier). Shared by every risk axis so the
 * dashboard, GUARD, and incident replay all agree on what "HIGH" means.
 */
export function levelForScore(score: number): RiskLevelName {
  if (score >= 90) return "CRITICAL";
  if (score >= 75) return "VERY_HIGH";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MODERATE";
  return "LOW";
}

/**
 * Deterministic backend authorization mapping. The AI layer never chooses
 * this — it only contributes signals that feed the score above.
 */
export function actionForLevel(level: RiskLevelName): GuardAction {
  switch (level) {
    case "LOW":
      return "ALLOW";
    case "MODERATE":
      return "VERIFY";
    case "HIGH":
      return "WARN";
    case "VERY_HIGH":
      return "COOLING_PERIOD";
    case "CRITICAL":
      return "PAUSE";
  }
}

export const LEVEL_RANK: Record<RiskLevelName, number> = {
  LOW: 0,
  MODERATE: 1,
  HIGH: 2,
  VERY_HIGH: 3,
  CRITICAL: 4,
};

export function worseLevel(a: RiskLevelName, b: RiskLevelName): RiskLevelName {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}
