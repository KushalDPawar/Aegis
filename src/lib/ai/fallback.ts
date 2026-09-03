import type { IntentClassification, IntentIndicators, ScamCategory } from "./schema";

/**
 * Deterministic pattern-matching classifier. This is NOT a stand-in for the
 * real model — it is the guaranteed path the product falls back to whenever
 * no AI provider is configured or the AI call fails/returns invalid JSON.
 * The whole point of VIVEK/Aegis is that protection must not depend on a
 * third-party API being reachable.
 */

interface CategoryRule {
  category: ScamCategory;
  patterns: RegExp[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "DIGITAL_ARREST",
    patterns: [
      /digital arrest/i,
      /(cbi|customs|narcotics|enforcement directorate|\bed\b officer|income tax raid)/i,
      /video call.*(officer|police|uniform)/i,
      /\bwarrant\b/i,
      /\barrest\b/i,
      /parcel.*(illegal|drugs|customs)/i,
    ],
  },
  {
    category: "KYC_IMPERSONATION",
    patterns: [
      /\bkyc\b/i,
      /update.*(kyc|documents|pan)/i,
      /account.*(freeze|frozen|block|suspend|deactivat)/i,
      /re-?verif(y|ication)/i,
    ],
  },
  {
    category: "FAKE_BANK_OFFICER",
    patterns: [/bank officer/i, /bank (representative|official|manager) (called|told|said)/i, /branch manager/i],
  },
  {
    category: "FAKE_CUSTOMER_SUPPORT",
    patterns: [/customer care/i, /customer support/i, /helpline/i, /toll.?free/i],
  },
  {
    category: "FAKE_INVESTMENT",
    patterns: [
      /guaranteed return/i,
      /double (my|your|the)? ?money/i,
      /investment (advisor|scheme|opportunity)/i,
      /trading (group|app|signal)/i,
      /\bcrypto\b/i,
      /high profit/i,
    ],
  },
  {
    category: "TASK_INVESTMENT_SCAM",
    patterns: [/\btask\b/i, /like and earn/i, /part.?time job/i, /telegram (group|channel)/i, /daily (task|earning)/i],
  },
  {
    category: "ELECTRICITY_DISCONNECTION",
    patterns: [/electricity/i, /power.*(disconnect|cut)/i, /(bill).*(due|pending|overdue|unpaid)/i, /\bmeter\b/i],
  },
  {
    category: "FAMILY_EMERGENCY",
    patterns: [
      /(son|daughter|grandson|granddaughter|nephew|niece).{0,20}(accident|hospital|jail|bail|arrested)/i,
      /medical emergency/i,
      /hospital.*(bill|admit)/i,
    ],
  },
  {
    category: "REMOTE_ACCESS_SCAM",
    patterns: [/anydesk/i, /teamviewer/i, /quick support/i, /screen ?share/i, /remote access/i],
  },
];

function detectIndicators(text: string): IntentIndicators {
  return {
    authorityImpersonation: /(officer|police|government|\brbi\b|income tax|bank (representative|official))/i.test(text),
    urgency: /(immediately|urgent|right now|today only|within (\d+\s*)?(minutes|hours)|last chance|before it'?s too late)/i.test(
      text
    ),
    fear: /(frozen|blocked|arrest|jail|legal action|case (will be )?filed|suspended|penalty)/i.test(text),
    accountSuspensionThreat: /account.*(freeze|frozen|block|suspend|clos)/i.test(text),
    kycImpersonation: /\bkyc\b/i.test(text),
    instructionFollowing: /(told me to|asked me to|instructed|said i (should|must|need to|have to))/i.test(text),
    remoteAccessRequest: /(anydesk|teamviewer|quick support|screen ?share|remote access|install.*(app|software))/i.test(
      text
    ),
    otpOrSafeAccountRequest: /(\botp\b|safe account|verification code|share.*(code|pin)|move.*(fund|money).*safe)/i.test(
      text
    ),
  };
}

function scoreIndicators(ind: IntentIndicators): number {
  const weights: Record<keyof IntentIndicators, number> = {
    authorityImpersonation: 20,
    kycImpersonation: 16,
    accountSuspensionThreat: 18,
    fear: 16,
    urgency: 10,
    instructionFollowing: 14,
    remoteAccessRequest: 22,
    otpOrSafeAccountRequest: 22,
  };
  let total = 0;
  (Object.keys(ind) as (keyof IntentIndicators)[]).forEach((k) => {
    if (ind[k]) total += weights[k];
  });
  return Math.min(100, total);
}

function pickFollowUp(category: ScamCategory, indicators: IntentIndicators, questionCount: number): string | null {
  if (questionCount >= 3) return null;

  if (indicators.accountSuspensionThreat || category === "KYC_IMPERSONATION") {
    if (!indicators.otpOrSafeAccountRequest) {
      return "Did they ask you to transfer money to a 'safe account' or share an OTP with you?";
    }
  }
  if (category === "DIGITAL_ARREST") {
    return "Were you asked to stay on a video call with someone claiming to be a police or government officer?";
  }
  if (indicators.remoteAccessRequest || category === "REMOTE_ACCESS_SCAM") {
    return "Did they ask you to install an app like AnyDesk or TeamViewer, or share your screen?";
  }
  if (category === "FAKE_INVESTMENT" || category === "TASK_INVESTMENT_SCAM") {
    return "Did someone promise guaranteed profits or ask you to pay a fee before you could withdraw money?";
  }
  if (category === "FAMILY_EMERGENCY") {
    return "Have you spoken directly with your family member on a number you already had saved, to confirm this?";
  }
  if (indicators.urgency && !indicators.instructionFollowing) {
    return "Is anyone asking you to complete this payment quickly, before you can think it over or ask someone you trust?";
  }
  return null;
}

export function classifyWithFallback(text: string, questionCount: number): IntentClassification {
  const normalized = text.trim();
  const indicators = detectIndicators(normalized);

  let bestCategory: ScamCategory = "NONE";
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(normalized))) {
      bestCategory = rule.category;
      break;
    }
  }

  const indicatorScore = scoreIndicators(indicators);
  const hasAnyIndicator = Object.values(indicators).some(Boolean);

  if (bestCategory === "NONE" && !hasAnyIndicator) {
    return {
      scamCategory: "NONE",
      confidence: 0.15,
      indicators,
      explanation: "Response does not match known scam-language patterns. No social-engineering indicators detected.",
      followUpQuestion: null,
    };
  }

  const confidence = Math.min(0.97, 0.45 + indicatorScore / 160 + (bestCategory !== "NONE" ? 0.15 : 0));

  const categoryPhrase =
    bestCategory === "NONE"
      ? "Response contains social-engineering language without matching a specific scam category."
      : `Response matches language patterns associated with ${bestCategory.replace(/_/g, " ").toLowerCase()}.`;

  return {
    scamCategory: bestCategory,
    confidence: Number(confidence.toFixed(2)),
    indicators,
    explanation: categoryPhrase,
    followUpQuestion: pickFollowUp(bestCategory, indicators, questionCount),
  };
}
