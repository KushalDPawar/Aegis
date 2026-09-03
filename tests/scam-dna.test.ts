import { describe, expect, it } from "vitest";
import { generateScamSignature } from "@/lib/scam-dna";

describe("Scam DNA signature generation", () => {
  it("is deterministic for the same category and incident seed", () => {
    const a = generateScamSignature("KYC_IMPERSONATION", "incident-123");
    const b = generateScamSignature("KYC_IMPERSONATION", "incident-123");
    expect(a).toBe(b);
  });

  it("encodes the category abbreviation in the signature", () => {
    expect(generateScamSignature("KYC_IMPERSONATION", "incident-abc")).toMatch(/^AEGIS-KYC-/);
    expect(generateScamSignature("DIGITAL_ARREST", "incident-abc")).toMatch(/^AEGIS-DAR-/);
  });

  it("differs across incidents even for the same category", () => {
    const a = generateScamSignature("FAKE_INVESTMENT", "incident-1");
    const b = generateScamSignature("FAKE_INVESTMENT", "incident-2");
    expect(a).not.toBe(b);
  });
});
