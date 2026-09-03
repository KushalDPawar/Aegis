import { COP_REGISTRY, confirmPayee, NINETY_DAY_AVERAGE, type PaymentRail, type PayeeMatch } from "./registry";
import { runRiskEngine } from "@/lib/risk/engine";
import type { RiskBreakdown } from "@/lib/risk/types";

/**
 * The Safety Check that runs before a transfer leaves.
 *
 * Five visible stages, but the score is not invented for the UI — the stages
 * are a narration of `runRiskEngine`, the same deterministic engine the
 * operator console and the customer payment flow both use. If this screen and
 * a real payment ever disagreed about the same transfer, the demo would be
 * lying about the product.
 *
 * Note the scale is deliberately inverted relative to `decisionIntegrity`:
 * here 100 means *maximum danger*, because the number is being shown to
 * someone deciding whether to send money, and "high number = bad" is the only
 * reading that survives being glanced at under pressure.
 */

export interface SafetyCheckInput {
  amount: number;
  rail: PaymentRail;
  registryId: string;
  /** The name the customer believes they are paying. */
  enteredName: string;
  purpose: string;
  /** Free-text context, scanned for pressure language. */
  notes?: string;
}

export type StageStatus = "pending" | "running" | "clear" | "flagged";

export interface StageResult {
  step: number;
  title: string;
  subtitle: string;
  detail: string;
  finding: string;
  status: StageStatus;
}

export interface SafetyCheckResult {
  /** 0 = safe, 100 = maximum danger. */
  dangerScore: number;
  verdict: "SAFE" | "CAUTION" | "HIGH_RISK";
  headline: string;
  summary: string;
  payee: PayeeMatch;
  stages: StageResult[];
  breakdown: RiskBreakdown;
}

/** Pressure vocabulary that shows up in coercion scripts. */
const PRESSURE_TERMS = [
  "urgent", "immediately", "arrest", "warrant", "cbi", "police", "clearance",
  "freeze", "frozen", "penalty", "fine", "verify", "verification", "escrow",
  "confidential", "do not tell", "don't tell", "within", "expire", "last chance",
  "legal action", "case", "summon", "custody",
];

function detectPressure(text: string): string[] {
  const lower = text.toLowerCase();
  return PRESSURE_TERMS.filter((t) => lower.includes(t));
}

export function runSafetyCheck(input: SafetyCheckInput): SafetyCheckResult {
  const entry = COP_REGISTRY.find((e) => e.id === input.registryId) ?? COP_REGISTRY[0];
  const payee = confirmPayee(input.enteredName || entry.legalName, entry);

  const haystack = `${input.purpose} ${input.notes ?? ""} ${input.enteredName}`;
  const pressureHits = detectPressure(haystack);
  const multiple = input.amount / NINETY_DAY_AVERAGE;

  // --- Feed the real engine -------------------------------------------------
  const breakdown = runRiskEngine({
    transaction: {
      amount: input.amount,
      avgHistoricalAmount: NINETY_DAY_AVERAGE,
      transactionsLast24h: 1,
      unusualTime: false,
    },
    beneficiary: {
      isFirstTime: !entry.trusted,
      trustScore: entry.knownMule ? 0 : entry.trusted ? 90 : 45,
      historicalTransactionCount: entry.trusted ? 6 : 0,
      suspiciousFlag: entry.knownMule,
      accountAgeDays: entry.knownMule ? 11 : entry.trusted ? 900 : 200,
    },
    behavioral: {
      unusualLogin: false,
      unusualDevice: false,
      remoteAccessContext: pressureHits.includes("verify") || pressureHits.includes("verification"),
      rapidAppSwitching: pressureHits.length > 2,
      unusualSessionDuration: false,
      suspiciousNavigationSequence: !entry.trusted && multiple > 5,
    },
    context: {
      activeScamSimulation: true,
      urgencyIndicator: pressureHits.length > 0,
      knownScamPatternCode: entry.knownMule ? "MULE_ACCOUNT" : null,
      vulnerabilityProfile: "STANDARD",
      suspiciousCallReported: pressureHits.some((t) => ["arrest", "police", "cbi", "warrant"].includes(t)),
    },
    socialEngineering: null,
  });

  // Danger is the inverse of transaction legitimacy, floored by the mismatch:
  // a confirmed name mismatch on a known mule is decisive on its own, whatever
  // the amount looks like.
  let dangerScore = 100 - breakdown.transactionLegitimacy;
  if (payee.verdict === "MISMATCH" && entry.knownMule) dangerScore = Math.max(dangerScore, 95);
  else if (payee.verdict === "MISMATCH") dangerScore = Math.max(dangerScore, 72);
  else if (entry.knownMule) dangerScore = Math.max(dangerScore, 88);
  dangerScore = Math.max(0, Math.min(100, Math.round(dangerScore)));

  const verdict = dangerScore >= 70 ? "HIGH_RISK" : dangerScore >= 40 ? "CAUTION" : "SAFE";

  const stages: StageResult[] = [
    {
      step: 1,
      title: "Checking transfer amount",
      subtitle: "Comparing this amount to your typical payment history",
      detail: `Compared against a 90-day average of ₹${NINETY_DAY_AVERAGE.toLocaleString("en-IN")} to spot unusual spikes.`,
      finding:
        multiple >= 3
          ? `${multiple.toFixed(1)}× your average — very high`
          : multiple >= 1.5
            ? `${multiple.toFixed(1)}× your average — elevated`
            : "In line with your normal payments",
      status: multiple >= 3 ? "flagged" : "clear",
    },
    {
      step: 2,
      title: "Looking up the recipient",
      subtitle: "Checking who this account legally belongs to",
      detail: "The name you entered is compared against the bank's KYC record for this account.",
      finding:
        payee.verdict === "MISMATCH"
          ? `Name mismatch — account belongs to ${entry.legalName}`
          : payee.verdict === "PARTIAL"
            ? `Partial match — verify against ${entry.legalName}`
            : `Confirmed: ${entry.legalName}`,
      status: payee.verdict === "MATCH" ? "clear" : "flagged",
    },
    {
      step: 3,
      title: "Reviewing your payment behaviour",
      subtitle: "Checking if this fits your normal habits",
      detail: "Looks for unusual patterns in how and when this transfer is being made.",
      finding:
        breakdown.behavioralRisk >= 40
          ? "Unusual pattern for this account"
          : pressureHits.length > 0
            ? "Some pressure language present"
            : "Consistent with your history",
      status: breakdown.behavioralRisk >= 40 ? "flagged" : "clear",
    },
    {
      step: 4,
      title: "Scanning for scam patterns",
      subtitle: "Looking for pressure tactics or suspicious language",
      detail: entry.knownMule
        ? "This destination matches a known syndicate playbook."
        : "Checked against known coercion and impersonation playbooks.",
      finding: entry.knownMule
        ? "Known mule account — active syndicate use"
        : pressureHits.length > 0
          ? `Pressure language: ${pressureHits.slice(0, 3).join(", ")}`
          : "No known pattern matched",
      status: entry.knownMule || pressureHits.length > 1 ? "flagged" : "clear",
    },
    {
      step: 5,
      title: "Generating your safety result",
      subtitle: "Putting everything together for a clear answer",
      detail: "All signals are combined into one score and a plain-language recommendation.",
      finding: `Score ${dangerScore}/100 — ${verdict.replace("_", " ")}`,
      status: verdict === "SAFE" ? "clear" : "flagged",
    },
  ];

  return {
    dangerScore,
    verdict,
    headline:
      verdict === "HIGH_RISK"
        ? "High risk — do not send"
        : verdict === "CAUTION"
          ? "Check this before you send"
          : "This looks safe to send",
    summary:
      verdict === "HIGH_RISK"
        ? "We found serious warning signs with this transfer."
        : verdict === "CAUTION"
          ? "Some signals here are worth a second look before the money moves."
          : "Nothing here matches a known fraud pattern.",
    payee,
    stages,
    breakdown,
  };
}
