import { z } from "zod";

export const SCAM_CATEGORIES = [
  "KYC_IMPERSONATION",
  "DIGITAL_ARREST",
  "FAKE_INVESTMENT",
  "ELECTRICITY_DISCONNECTION",
  "FAMILY_EMERGENCY",
  "FAKE_BANK_OFFICER",
  "FAKE_CUSTOMER_SUPPORT",
  "TASK_INVESTMENT_SCAM",
  "REMOTE_ACCESS_SCAM",
  "NONE",
] as const;

export type ScamCategory = (typeof SCAM_CATEGORIES)[number];

export const SCAM_CATEGORY_LABELS: Record<ScamCategory, string> = {
  KYC_IMPERSONATION: "KYC Impersonation",
  DIGITAL_ARREST: "Digital Arrest",
  FAKE_INVESTMENT: "Fake Investment",
  ELECTRICITY_DISCONNECTION: "Electricity Disconnection Scam",
  FAMILY_EMERGENCY: "Family Emergency Scam",
  FAKE_BANK_OFFICER: "Fake Bank Officer",
  FAKE_CUSTOMER_SUPPORT: "Fake Customer Support",
  TASK_INVESTMENT_SCAM: "Task / Investment Scam",
  REMOTE_ACCESS_SCAM: "Remote-Access Scam",
  NONE: "No Scam Pattern Detected",
};

export const indicatorSchema = z.object({
  authorityImpersonation: z.boolean(),
  urgency: z.boolean(),
  fear: z.boolean(),
  accountSuspensionThreat: z.boolean(),
  kycImpersonation: z.boolean(),
  instructionFollowing: z.boolean(),
  remoteAccessRequest: z.boolean(),
  otpOrSafeAccountRequest: z.boolean(),
});

export type IntentIndicators = z.infer<typeof indicatorSchema>;

/**
 * Strict output contract for both the real AI path and the deterministic
 * fallback. Anything that doesn't validate against this is discarded and
 * treated as "no classification" rather than trusted.
 */
export const intentClassificationSchema = z.object({
  scamCategory: z.enum(SCAM_CATEGORIES),
  confidence: z.number().min(0).max(1),
  indicators: indicatorSchema,
  explanation: z.string().min(1).max(400),
  followUpQuestion: z.string().max(300).nullable(),
});

export type IntentClassification = z.infer<typeof intentClassificationSchema>;

export const INTENT_CHECK_INITIAL_QUESTION = "Why are you making this payment?";

/**
 * A multi-turn Intent Check must not lose a signal just because the
 * customer's LATEST answer didn't happen to repeat it — e.g. "the officer
 * said my account would be frozen" (turn 1) followed by "he asked for an
 * OTP" (turn 2) should keep BOTH authority-impersonation and the OTP
 * request. Indicators only ever accumulate across a conversation.
 */
export function mergeIndicators(entries: IntentIndicators[]): IntentIndicators {
  const merged: IntentIndicators = {
    authorityImpersonation: false,
    urgency: false,
    fear: false,
    accountSuspensionThreat: false,
    kycImpersonation: false,
    instructionFollowing: false,
    remoteAccessRequest: false,
    otpOrSafeAccountRequest: false,
  };
  for (const entry of entries) {
    (Object.keys(merged) as (keyof IntentIndicators)[]).forEach((key) => {
      merged[key] = merged[key] || entry[key];
    });
  }
  return merged;
}

/** Prefers the first confidently-classified category across the conversation. */
export function pickDominantCategory(
  entries: { scamCategory: string; confidence: number }[]
): ScamCategory | null {
  const nonNone = entries.filter((e) => e.scamCategory !== "NONE" && SCAM_CATEGORIES.includes(e.scamCategory as ScamCategory));
  if (nonNone.length === 0) return null;
  return nonNone.reduce((best, e) => (e.confidence > best.confidence ? e : best)).scamCategory as ScamCategory;
}
