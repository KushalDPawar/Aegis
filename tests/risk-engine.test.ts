import { describe, expect, it } from "vitest";
import { runRiskEngine } from "@/lib/risk/engine";
import { actionForLevel, levelForScore, worseLevel } from "@/lib/risk/thresholds";
import type { RiskInput } from "@/lib/risk/types";

const baseInput: RiskInput = {
  transaction: { amount: 5_000, avgHistoricalAmount: 8_000, transactionsLast24h: 1, unusualTime: false },
  beneficiary: { isFirstTime: false, trustScore: 85, historicalTransactionCount: 4, suspiciousFlag: false, accountAgeDays: 120 },
  behavioral: {
    unusualLogin: false,
    unusualDevice: false,
    remoteAccessContext: false,
    rapidAppSwitching: false,
    unusualSessionDuration: false,
    suspiciousNavigationSequence: false,
  },
  context: { activeScamSimulation: false, urgencyIndicator: false, knownScamPatternCode: null, vulnerabilityProfile: "STANDARD", suspiciousCallReported: false },
  socialEngineering: null,
};

describe("thresholds", () => {
  it("buckets scores into risk levels in order", () => {
    expect(levelForScore(10)).toBe("LOW");
    expect(levelForScore(30)).toBe("MODERATE");
    expect(levelForScore(55)).toBe("HIGH");
    expect(levelForScore(75)).toBe("VERY_HIGH");
    expect(levelForScore(90)).toBe("CRITICAL");
  });

  it("maps every risk level to the correct deterministic GUARD action", () => {
    expect(actionForLevel("LOW")).toBe("ALLOW");
    expect(actionForLevel("MODERATE")).toBe("VERIFY");
    expect(actionForLevel("HIGH")).toBe("WARN");
    expect(actionForLevel("VERY_HIGH")).toBe("COOLING_PERIOD");
    expect(actionForLevel("CRITICAL")).toBe("PAUSE");
  });

  it("worseLevel always returns the higher-severity level", () => {
    expect(worseLevel("LOW", "CRITICAL")).toBe("CRITICAL");
    expect(worseLevel("HIGH", "MODERATE")).toBe("HIGH");
    expect(worseLevel("LOW", "LOW")).toBe("LOW");
  });
});

describe("risk engine — low risk / routine payment", () => {
  it("scores a small payment to a trusted, established beneficiary as LOW and recommends ALLOW", () => {
    const result = runRiskEngine(baseInput);
    expect(result.overallLevel).toBe("LOW");
    expect(result.recommendedAction).toBe("ALLOW");
    expect(result.needsIntentCheck).toBe(false);
  });
});

describe("risk engine — legitimate high-value payment (financial inclusion)", () => {
  it("does NOT escalate a large payment purely for being large, when beneficiary and session are trusted/normal", () => {
    const result = runRiskEngine({
      ...baseInput,
      transaction: { amount: 85_000, avgHistoricalAmount: 9_500, transactionsLast24h: 1, unusualTime: false },
      beneficiary: { isFirstTime: false, trustScore: 88, historicalTransactionCount: 3, suspiciousFlag: false, accountAgeDays: 150 },
      context: { ...baseInput.context, vulnerabilityProfile: "VULNERABLE" },
    });
    // Elderly customer + large payment must NOT automatically mean blocked.
    expect(result.overallLevel).not.toBe("CRITICAL");
    expect(result.recommendedAction).not.toBe("PAUSE");
    expect(["ALLOW", "VERIFY"]).toContain(result.recommendedAction);
  });
});

describe("risk engine — first-time beneficiary", () => {
  it("raises beneficiary risk for a first-time beneficiary with no history", () => {
    const result = runRiskEngine({
      ...baseInput,
      beneficiary: { isFirstTime: true, trustScore: 35, historicalTransactionCount: 0, suspiciousFlag: false, accountAgeDays: 3 },
    });
    expect(result.beneficiaryRisk).toBeGreaterThan(runRiskEngine(baseInput).beneficiaryRisk);
    expect(result.signals.some((s) => s.code === "FIRST_TIME_BENEFICIARY")).toBe(true);
  });
});

describe("risk engine — suspicious beneficiary", () => {
  it("flags a suspicious, freshly-created beneficiary with high beneficiary risk", () => {
    const result = runRiskEngine({
      ...baseInput,
      beneficiary: { isFirstTime: true, trustScore: 20, historicalTransactionCount: 0, suspiciousFlag: true, accountAgeDays: 0 },
    });
    expect(result.beneficiaryRisk).toBeGreaterThanOrEqual(70);
    expect(result.signals.some((s) => s.code === "SUSPICIOUS_BENEFICIARY")).toBe(true);
  });
});

describe("risk engine — unusual session / behavioral signals", () => {
  it("raises behavioral risk when remote-access context and rapid switching are present", () => {
    const result = runRiskEngine({
      ...baseInput,
      behavioral: {
        unusualLogin: true,
        unusualDevice: true,
        remoteAccessContext: true,
        rapidAppSwitching: true,
        unusualSessionDuration: true,
        suspiciousNavigationSequence: true,
      },
    });
    expect(result.behavioralRisk).toBeGreaterThanOrEqual(75);
  });
});

describe("risk engine — social engineering / decision integrity", () => {
  it("keeps transaction legitimacy separate from decision integrity: a technically normal transaction can still show critical decision-integrity risk", () => {
    const result = runRiskEngine({
      ...baseInput,
      transaction: { amount: 85_000, avgHistoricalAmount: 9_500, transactionsLast24h: 1, unusualTime: true },
      beneficiary: { isFirstTime: true, trustScore: 22, historicalTransactionCount: 0, suspiciousFlag: true, accountAgeDays: 0 },
      behavioral: {
        unusualLogin: true,
        unusualDevice: false,
        remoteAccessContext: false,
        rapidAppSwitching: true,
        unusualSessionDuration: true,
        suspiciousNavigationSequence: true,
      },
      context: { activeScamSimulation: true, urgencyIndicator: true, knownScamPatternCode: "KYC_IMPERSONATION", vulnerabilityProfile: "VULNERABLE", suspiciousCallReported: true },
      socialEngineering: {
        authorityImpersonation: true,
        urgency: true,
        fear: true,
        accountSuspensionThreat: true,
        kycImpersonation: true,
        instructionFollowing: true,
        remoteAccessRequest: false,
        otpOrSafeAccountRequest: true,
        aiConfidence: 0.9,
      },
    });

    expect(result.socialEngineeringRisk).toBeGreaterThanOrEqual(90);
    expect(result.decisionIntegrityLabel).toBe("CRITICAL");
    expect(result.overallLevel).toBe("CRITICAL");
    expect(result.recommendedAction).toBe("PAUSE");
  });

  it("triggers needsIntentCheck before any social-engineering signal exists, when context/behavioral risk alone is elevated", () => {
    const result = runRiskEngine({
      ...baseInput,
      behavioral: { ...baseInput.behavioral, unusualLogin: true, suspiciousNavigationSequence: true },
      context: { activeScamSimulation: true, urgencyIndicator: true, knownScamPatternCode: null, vulnerabilityProfile: "VULNERABLE", suspiciousCallReported: true },
    });
    expect(result.needsIntentCheck).toBe(true);
  });
});

describe("risk engine — intervention thresholds are monotonic", () => {
  it("never assigns a less severe action to a strictly riskier input", () => {
    const low = runRiskEngine(baseInput);
    const high = runRiskEngine({
      ...baseInput,
      beneficiary: { isFirstTime: true, trustScore: 15, historicalTransactionCount: 0, suspiciousFlag: true, accountAgeDays: 0 },
    });
    const RANK = { ALLOW: 0, VERIFY: 1, WARN: 2, COOLING_PERIOD: 3, PAUSE: 4 };
    expect(RANK[high.recommendedAction]).toBeGreaterThanOrEqual(RANK[low.recommendedAction]);
  });
});
