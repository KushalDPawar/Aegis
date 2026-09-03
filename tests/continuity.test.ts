import { describe, expect, it } from "vitest";
import { isBeneficiaryEssential } from "@/lib/continuity";

describe("Financial Continuity Mode eligibility", () => {
  it("treats an established, trusted, non-suspicious beneficiary as essential", () => {
    expect(isBeneficiaryEssential({ isFirstTime: false, suspiciousFlag: false, trustScore: 88 })).toBe(true);
  });

  it("does not treat a first-time beneficiary as essential, even with a decent trust score", () => {
    expect(isBeneficiaryEssential({ isFirstTime: true, suspiciousFlag: false, trustScore: 70 })).toBe(false);
  });

  it("never treats a suspicious beneficiary as essential", () => {
    expect(isBeneficiaryEssential({ isFirstTime: false, suspiciousFlag: true, trustScore: 90 })).toBe(false);
  });

  it("does not treat a low-trust established beneficiary as essential", () => {
    expect(isBeneficiaryEssential({ isFirstTime: false, suspiciousFlag: false, trustScore: 45 })).toBe(false);
  });
});
