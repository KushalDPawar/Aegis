import type {
  BehavioralSignals,
  BeneficiarySignals,
  ContextSignals,
  RiskBreakdown,
  RiskInput,
  SocialEngineeringSignals,
  TransactionSignals,
  WeightedSignal,
} from "./types";
import { actionForLevel, levelForScore, worseLevel } from "./thresholds";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * VIVEK's Decision Insight — Aegis — Sentinel scoring engine.
 *
 * Deliberately NOT machine-learned: every point awarded here is traceable to
 * a named signal so the risk breakdown shown to a customer or bank analyst
 * is fully explainable. The AI Intent Check contributes *inputs* to the
 * social-engineering axis; it never sets a score directly.
 */

function scoreTransaction(t: TransactionSignals, signals: WeightedSignal[]): number {
  let score = 0;
  const deviation = t.avgHistoricalAmount > 0 ? t.amount / t.avgHistoricalAmount : t.amount > 20000 ? 4 : 1;

  if (deviation >= 5) {
    score += 38;
    signals.push({
      category: "TRANSACTION",
      code: "AMOUNT_DEVIATION_EXTREME",
      label: "Extreme amount deviation",
      weight: 38,
      contribution: 38,
      detail: `Payment is ${deviation.toFixed(1)}x this customer's typical transaction amount.`,
      confidence: "DETECTED",
    });
  } else if (deviation >= 3) {
    score += 26;
    signals.push({
      category: "TRANSACTION",
      code: "AMOUNT_DEVIATION_HIGH",
      label: "High amount deviation",
      weight: 26,
      contribution: 26,
      detail: `Payment is ${deviation.toFixed(1)}x this customer's typical transaction amount.`,
      confidence: "DETECTED",
    });
  } else if (deviation >= 1.5) {
    score += 12;
    signals.push({
      category: "TRANSACTION",
      code: "AMOUNT_DEVIATION_MODERATE",
      label: "Above-average amount",
      weight: 12,
      contribution: 12,
      detail: `Payment is ${deviation.toFixed(1)}x this customer's average transaction.`,
      confidence: "DETECTED",
    });
  }

  if (t.amount >= 200_000) {
    score += 18;
    signals.push({
      category: "TRANSACTION",
      code: "HIGH_ABSOLUTE_VALUE",
      label: "High absolute value",
      weight: 18,
      contribution: 18,
      detail: "Transaction amount exceeds ₹2,00,000.",
      confidence: "DETECTED",
    });
  } else if (t.amount >= 50_000) {
    score += 8;
    signals.push({
      category: "TRANSACTION",
      code: "ELEVATED_ABSOLUTE_VALUE",
      label: "Elevated value",
      weight: 8,
      contribution: 8,
      detail: "Transaction amount exceeds ₹50,000.",
      confidence: "DETECTED",
    });
  }

  if (t.transactionsLast24h >= 3) {
    score += 14;
    signals.push({
      category: "TRANSACTION",
      code: "HIGH_FREQUENCY",
      label: "Unusual transaction frequency",
      weight: 14,
      contribution: 14,
      detail: `${t.transactionsLast24h} outgoing transactions in the last 24 hours.`,
      confidence: "DETECTED",
    });
  }

  if (t.unusualTime) {
    score += 10;
    signals.push({
      category: "TRANSACTION",
      code: "UNUSUAL_TIME",
      label: "Unusual transaction time",
      weight: 10,
      contribution: 10,
      detail: "Payment initiated outside this customer's normal active hours.",
      confidence: "INFERRED",
    });
  }

  return clamp(score);
}

function scoreBeneficiary(b: BeneficiarySignals, signals: WeightedSignal[]): number {
  let score = Math.max(0, 100 - b.trustScore) * 0.55;

  if (b.isFirstTime) {
    score += 20;
    signals.push({
      category: "BENEFICIARY",
      code: "FIRST_TIME_BENEFICIARY",
      label: "First-time beneficiary",
      weight: 20,
      contribution: 20,
      detail: "No prior successful payments to this beneficiary.",
      confidence: "DETECTED",
    });
  }

  if (b.suspiciousFlag) {
    score += 34;
    signals.push({
      category: "BENEFICIARY",
      code: "SUSPICIOUS_BENEFICIARY",
      label: "Suspicious beneficiary classification",
      weight: 34,
      contribution: 34,
      detail: "This beneficiary matches synthetic risk indicators associated with mule-account patterns.",
      confidence: "INFERRED",
    });
  }

  if (b.accountAgeDays < 1 / 24) {
    score += 16;
    signals.push({
      category: "BENEFICIARY",
      code: "BENEFICIARY_JUST_ADDED",
      label: "Beneficiary added minutes ago",
      weight: 16,
      contribution: 16,
      detail: "This beneficiary was added to the account just before this payment.",
      confidence: "DETECTED",
    });
  } else if (b.accountAgeDays < 2) {
    score += 8;
    signals.push({
      category: "BENEFICIARY",
      code: "BENEFICIARY_RECENT",
      label: "Recently added beneficiary",
      weight: 8,
      contribution: 8,
      detail: "This beneficiary was added within the last two days.",
      confidence: "DETECTED",
    });
  }

  if (b.trustScore < 40) {
    signals.push({
      category: "BENEFICIARY",
      code: "LOW_TRUST_SCORE",
      label: "Low beneficiary trust score",
      weight: Math.round(Math.max(0, 100 - b.trustScore) * 0.55),
      contribution: Math.round(Math.max(0, 100 - b.trustScore) * 0.55),
      detail: `Beneficiary trust score is ${b.trustScore}/100, based on network history and verification signals.`,
      confidence: "INFERRED",
    });
  }

  return clamp(score);
}

function scoreBehavioral(beh: BehavioralSignals, signals: WeightedSignal[]): number {
  let score = 0;
  const add = (flag: boolean, code: string, label: string, weight: number, detail: string) => {
    if (flag) {
      score += weight;
      signals.push({ category: "BEHAVIORAL", code, label, weight, contribution: weight, detail, confidence: "DETECTED" });
    }
  };

  add(beh.unusualLogin, "UNUSUAL_LOGIN", "Unusual login pattern", 16, "Login location or time deviates from this customer's usual pattern.");
  add(beh.unusualDevice, "UNUSUAL_DEVICE", "Unrecognized device", 16, "This session originates from a device not previously associated with this account.");
  add(beh.remoteAccessContext, "REMOTE_ACCESS_CONTEXT", "Remote-access session context", 30, "Session signals consistent with a remote-access or screen-sharing tool being active.");
  add(beh.rapidAppSwitching, "RAPID_APP_SWITCHING", "Rapid app switching", 12, "Customer switched rapidly between the banking app and other apps during this session.");
  add(beh.unusualSessionDuration, "UNUSUAL_SESSION_DURATION", "Unusually rushed session", 10, "Time between login and payment initiation is far shorter than this customer's norm.");
  add(beh.suspiciousNavigationSequence, "SUSPICIOUS_NAVIGATION", "Suspicious navigation sequence", 13, "Navigation path (e.g. straight to beneficiary add → payment) skips usual review steps.");

  return clamp(score);
}

function scoreContext(ctx: ContextSignals, signals: WeightedSignal[]): number {
  let score = 0;

  if (ctx.suspiciousCallReported) {
    score += 22;
    signals.push({
      category: "CONTEXT",
      code: "SUSPICIOUS_CALL",
      label: "Suspicious incoming call reported",
      weight: 22,
      contribution: 22,
      detail: "An incoming call was logged immediately before this banking session began.",
      confidence: "DETECTED",
    });
  }

  if (ctx.urgencyIndicator) {
    score += 22;
    signals.push({
      category: "CONTEXT",
      code: "URGENCY_INDICATOR",
      label: "Urgency indicator",
      weight: 22,
      contribution: 22,
      detail: "Session context suggests time pressure was placed on the customer.",
      confidence: "INFERRED",
    });
  }

  if (ctx.knownScamPatternCode) {
    score += 28;
    signals.push({
      category: "CONTEXT",
      code: "KNOWN_SCAM_PATTERN",
      label: "Matches known Scam DNA",
      weight: 28,
      contribution: 28,
      detail: `Behavioral fingerprint matches known scam pattern ${ctx.knownScamPatternCode}.`,
      confidence: "INFERRED",
    });
  }

  if (ctx.vulnerabilityProfile === "VULNERABLE") {
    score += 12;
    signals.push({
      category: "CONTEXT",
      code: "VULNERABILITY_PROFILE",
      label: "Customer vulnerability profile",
      weight: 12,
      contribution: 12,
      detail: "Customer profile indicates elevated susceptibility to social engineering (age, digital experience). This raises scrutiny, not automatic denial.",
      confidence: "SIMULATED",
    });
  } else if (ctx.vulnerabilityProfile === "ELEVATED") {
    score += 6;
    signals.push({
      category: "CONTEXT",
      code: "VULNERABILITY_PROFILE_ELEVATED",
      label: "Elevated vulnerability indicators",
      weight: 6,
      contribution: 6,
      detail: "Some profile indicators suggest moderately elevated susceptibility to social engineering.",
      confidence: "SIMULATED",
    });
  }

  return clamp(score);
}

function scoreSocialEngineering(se: SocialEngineeringSignals | null | undefined, signals: WeightedSignal[]): number {
  if (!se) return 0;
  let score = 0;
  const add = (flag: boolean, code: string, label: string, weight: number, detail: string) => {
    if (flag) {
      score += weight;
      signals.push({
        category: "SOCIAL_ENGINEERING",
        code,
        label,
        weight,
        contribution: weight,
        detail,
        confidence: "CONFIRMED",
      });
    }
  };

  add(se.authorityImpersonation, "AUTHORITY_IMPERSONATION", "Authority impersonation language", 20, "Customer's account of events describes someone claiming official/bank authority.");
  add(se.kycImpersonation, "KYC_IMPERSONATION", "KYC impersonation language", 16, "Response references KYC update/verification framed as urgent and account-threatening.");
  add(se.accountSuspensionThreat, "ACCOUNT_SUSPENSION_THREAT", "Account suspension threat", 18, "Customer was told their account would be frozen, blocked, or closed.");
  add(se.fear, "FEAR_LANGUAGE", "Fear-based language", 16, "Response contains language consistent with fear of legal or financial consequence.");
  add(se.urgency, "URGENCY_LANGUAGE", "Urgency language", 10, "Response indicates the customer was pressured to act immediately.");
  add(se.instructionFollowing, "INSTRUCTION_FOLLOWING", "Following third-party instructions", 14, "Customer describes acting on direct instructions from the caller, not independent judgment.");
  add(se.remoteAccessRequest, "REMOTE_ACCESS_REQUEST", "Remote-access request", 22, "Caller reportedly asked the customer to install or use remote-access software.");
  add(se.otpOrSafeAccountRequest, "OTP_SAFE_ACCOUNT_REQUEST", "OTP / 'safe account' request", 22, "Caller reportedly asked for an OTP or told the customer to move funds to a 'safe account'.");

  return clamp(score);
}

export function runRiskEngine(input: RiskInput): RiskBreakdown {
  const signals: WeightedSignal[] = [];

  const transactionRisk = scoreTransaction(input.transaction, signals);
  const beneficiaryRisk = scoreBeneficiary(input.beneficiary, signals);
  const behavioralRisk = scoreBehavioral(input.behavioral, signals);
  const contextRisk = scoreContext(input.context, signals);
  const socialEngineeringRisk = scoreSocialEngineering(input.socialEngineering, signals);

  const transactionSideScore = clamp(transactionRisk * 0.55 + beneficiaryRisk * 0.45);
  const transactionLegitimacy = clamp(100 - transactionSideScore);

  const decisionIntegrityRisk = clamp(
    beneficiaryRisk * 0.25 + behavioralRisk * 0.1 + socialEngineeringRisk * 0.5 + contextRisk * 0.15
  );
  const decisionIntegrity = clamp(100 - decisionIntegrityRisk);
  const decisionIntegrityLabel = levelForScore(decisionIntegrityRisk);

  const overallRiskScore = Math.max(transactionSideScore, decisionIntegrityRisk);
  const overallLevel = worseLevel(levelForScore(transactionSideScore), decisionIntegrityLabel);
  void overallRiskScore;

  const recommendedAction = actionForLevel(overallLevel);

  // Preliminary human-factor trigger, evaluated BEFORE any intent check has
  // run: if context+behavioral signals alone look concerning, VIVEK asks.
  const preliminaryHumanFactor = clamp(behavioralRisk * 0.4 + contextRisk * 0.6);
  const needsIntentCheck = !input.socialEngineering && preliminaryHumanFactor >= 35;

  return {
    transactionRisk,
    beneficiaryRisk,
    behavioralRisk,
    contextRisk,
    socialEngineeringRisk,
    transactionLegitimacy,
    decisionIntegrity,
    decisionIntegrityLabel,
    overallLevel,
    recommendedAction,
    needsIntentCheck,
    signals,
  };
}
