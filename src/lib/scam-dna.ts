import type { ScamCategory } from "./ai/schema";

const CATEGORY_ABBR: Record<ScamCategory, string> = {
  KYC_IMPERSONATION: "KYC",
  DIGITAL_ARREST: "DAR",
  FAKE_INVESTMENT: "INV",
  ELECTRICITY_DISCONNECTION: "PWR",
  FAMILY_EMERGENCY: "FAM",
  FAKE_BANK_OFFICER: "OFC",
  FAKE_CUSTOMER_SUPPORT: "SUP",
  TASK_INVESTMENT_SCAM: "TSK",
  REMOTE_ACCESS_SCAM: "RAT",
  NONE: "GEN",
};

/** Small stable hash so the same incident always yields the same signature. */
function stableTag(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(4, "0").slice(-4);
}

export function generateScamSignature(category: ScamCategory, incidentSeed: string): string {
  return `AEGIS-${CATEGORY_ABBR[category] ?? "GEN"}-${stableTag(incidentSeed)}`;
}

export const SCAM_PATTERN_LIBRARY: Record<
  ScamCategory,
  { vector: string; psychology: string; description: string }
> = {
  KYC_IMPERSONATION: {
    vector: "Phone call / SMS impersonating bank KYC team",
    psychology: "Fear of account loss + authority + urgency",
    description: "Caller claims the customer's KYC has lapsed and the account will be frozen unless they act immediately, then directs funds to a 'verification' or 'safe' account.",
  },
  DIGITAL_ARREST: {
    vector: "Video call impersonating police / government agency",
    psychology: "Fear of arrest/legal action + isolation + authority",
    description: "Caller impersonates a law-enforcement or government official, alleges the customer is implicated in a crime, and keeps them on a call while directing large transfers to 'clear' the case.",
  },
  FAKE_INVESTMENT: {
    vector: "Social media / messaging-app investment group",
    psychology: "Greed + false urgency + social proof",
    description: "Customer is invited into a trading or investment group promising guaranteed high returns, then asked to deposit increasing amounts.",
  },
  ELECTRICITY_DISCONNECTION: {
    vector: "SMS / call impersonating electricity board",
    psychology: "Fear of service loss + urgency",
    description: "Customer is told their electricity connection will be disconnected within hours unless an overdue bill is paid immediately to a personal account.",
  },
  FAMILY_EMERGENCY: {
    vector: "Phone call impersonating a family member or hospital",
    psychology: "Panic + protective instinct + urgency",
    description: "Caller claims a family member is in an accident, in custody, or hospitalized and needs money transferred immediately, discouraging the customer from verifying independently.",
  },
  FAKE_BANK_OFFICER: {
    vector: "Phone call impersonating bank staff",
    psychology: "Trust in institutional authority + urgency",
    description: "Caller claims to be a bank representative reporting suspicious activity, then talks the customer through 'securing' their funds by moving them out.",
  },
  FAKE_CUSTOMER_SUPPORT: {
    vector: "Fake helpline / search-engine ad",
    psychology: "Trust in customer support + technical confusion",
    description: "Customer calls a fraudulent 'customer care' number found online, which then requests remote access or payment to 'resolve' a fabricated issue.",
  },
  TASK_INVESTMENT_SCAM: {
    vector: "Messaging-app 'task' or part-time job offer",
    psychology: "Greed + reciprocity (small early payouts) + sunk cost",
    description: "Customer is offered payment for simple online tasks, receives small real payouts to build trust, then is asked to deposit larger sums to 'unlock' further earnings.",
  },
  REMOTE_ACCESS_SCAM: {
    vector: "Remote-access software (AnyDesk / TeamViewer)",
    psychology: "Trust + technical authority + loss of independent control",
    description: "Customer is talked into installing remote-access software, after which the scammer can see or control the banking session directly.",
  },
  NONE: {
    vector: "Not applicable",
    psychology: "Not applicable",
    description: "No scam pattern matched for this interaction.",
  },
};
