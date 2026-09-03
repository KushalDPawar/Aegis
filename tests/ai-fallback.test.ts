import { describe, expect, it } from "vitest";
import { classifyWithFallback } from "@/lib/ai/fallback";
import { mergeIndicators, pickDominantCategory } from "@/lib/ai/schema";

describe("deterministic AI fallback classifier", () => {
  it("identifies KYC impersonation with authority, suspension threat, and fear language", () => {
    const result = classifyWithFallback("The bank officer told me my account will be frozen.", 0);
    expect(result.scamCategory).toBe("KYC_IMPERSONATION");
    expect(result.indicators.authorityImpersonation).toBe(true);
    expect(result.indicators.accountSuspensionThreat).toBe(true);
    expect(result.indicators.fear).toBe(true);
    expect(result.followUpQuestion).toMatch(/safe account|OTP/i);
  });

  it("identifies a digital-arrest pattern from an impersonated law-enforcement call", () => {
    const result = classifyWithFallback(
      "A police officer said my documents were used in a money laundering case and I need to pay to avoid arrest.",
      0
    );
    expect(result.scamCategory).toBe("DIGITAL_ARREST");
    expect(result.indicators.authorityImpersonation).toBe(true);
    expect(result.indicators.fear).toBe(true);
  });

  it("identifies a remote-access request", () => {
    const result = classifyWithFallback("He asked me to install AnyDesk so he could see my screen.", 0);
    expect(result.scamCategory).toBe("REMOTE_ACCESS_SCAM");
    expect(result.indicators.remoteAccessRequest).toBe(true);
  });

  it("does not classify a benign, specific payment reason as a scam pattern", () => {
    const result = classifyWithFallback("This is the final payment for the renovation work Ramesh completed last month.", 0);
    expect(result.scamCategory).toBe("NONE");
    expect(result.confidence).toBeLessThan(0.5);
    expect(Object.values(result.indicators).every((v) => v === false)).toBe(true);
  });

  it("stops offering follow-up questions once the maximum question count is reached", () => {
    const result = classifyWithFallback("The bank officer told me my account will be frozen.", 3);
    expect(result.followUpQuestion).toBeNull();
  });
});

describe("mergeIndicators", () => {
  it("accumulates true flags across multiple answers instead of overwriting them", () => {
    const turn1 = { authorityImpersonation: true, urgency: false, fear: true, accountSuspensionThreat: true, kycImpersonation: false, instructionFollowing: false, remoteAccessRequest: false, otpOrSafeAccountRequest: false };
    const turn2 = { authorityImpersonation: false, urgency: false, fear: false, accountSuspensionThreat: false, kycImpersonation: true, instructionFollowing: true, remoteAccessRequest: false, otpOrSafeAccountRequest: true };
    const merged = mergeIndicators([turn1, turn2]);
    expect(merged.authorityImpersonation).toBe(true);
    expect(merged.fear).toBe(true);
    expect(merged.accountSuspensionThreat).toBe(true);
    expect(merged.kycImpersonation).toBe(true);
    expect(merged.instructionFollowing).toBe(true);
    expect(merged.otpOrSafeAccountRequest).toBe(true);
    expect(merged.urgency).toBe(false);
    expect(merged.remoteAccessRequest).toBe(false);
  });
});

describe("pickDominantCategory", () => {
  it("picks the highest-confidence non-NONE category across a conversation", () => {
    const category = pickDominantCategory([
      { scamCategory: "NONE", confidence: 0.15 },
      { scamCategory: "KYC_IMPERSONATION", confidence: 0.94 },
    ]);
    expect(category).toBe("KYC_IMPERSONATION");
  });

  it("returns null when nothing was ever classified as a scam pattern", () => {
    expect(pickDominantCategory([{ scamCategory: "NONE", confidence: 0.1 }])).toBeNull();
  });
});
