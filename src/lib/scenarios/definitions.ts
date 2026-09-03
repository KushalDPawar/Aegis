import type { ScamCategory } from "@/lib/ai/schema";

export type ScenarioCode =
  | "KYC_IMPERSONATION"
  | "DIGITAL_ARREST"
  | "FAKE_INVESTMENT"
  | "ELECTRICITY_SCAM"
  | "FAMILY_EMERGENCY"
  | "LEGITIMATE_PAYMENT";

export interface ScenarioTimelineStep {
  offsetMinutesAgo: number;
  type: string;
  label: string;
  description: string;
  sourceType: "SESSION" | "TRANSACTION" | "SYSTEM";
  severity: number;
}

export interface ScenarioDefinition {
  code: ScenarioCode;
  title: string;
  subtitle: string;
  description: string;
  scamCategory: ScamCategory | null;
  beneficiary: {
    name: string;
    isNew: boolean;
    trustScore: number;
    suspiciousFlag: boolean;
    relationship: string;
    category: "individual" | "biller" | "merchant";
  };
  amount: number;
  purpose: string;
  transaction: {
    transactionsLast24h: number;
    unusualTime: boolean;
  };
  behavioral: {
    unusualLogin: boolean;
    unusualDevice: boolean;
    remoteAccessContext: boolean;
    rapidAppSwitching: boolean;
    unusualSessionDuration: boolean;
    suspiciousNavigationSequence: boolean;
  };
  context: {
    urgencyIndicator: boolean;
    suspiciousCallReported: boolean;
  };
  timeline: ScenarioTimelineStep[];
  scriptedAnswers: string[];
  expectedOutcome: string;
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    code: "KYC_IMPERSONATION",
    title: "KYC Impersonation",
    subtitle: "₹85,000 · First-time beneficiary · Authority + urgency",
    description:
      "A caller claiming to be a bank officer tells the customer their account will be frozen unless they complete an urgent 'KYC verification' transfer.",
    scamCategory: "KYC_IMPERSONATION",
    beneficiary: { name: "Suresh Verification Services", isNew: true, trustScore: 22, suspiciousFlag: true, relationship: "Unknown", category: "individual" },
    amount: 85_000,
    purpose: "KYC verification transfer",
    transaction: { transactionsLast24h: 1, unusualTime: true },
    behavioral: {
      unusualLogin: true,
      unusualDevice: false,
      remoteAccessContext: false,
      rapidAppSwitching: true,
      unusualSessionDuration: true,
      suspiciousNavigationSequence: true,
    },
    context: { urgencyIndicator: true, suspiciousCallReported: true },
    timeline: [
      { offsetMinutesAgo: 9, type: "CALL", label: "Incoming suspicious call", description: "An unsaved number called the customer for 4 minutes before the banking app was opened.", sourceType: "SESSION", severity: 40 },
      { offsetMinutesAgo: 8, type: "SESSION_START", label: "Banking application opened", description: "Customer opened the app immediately after ending the call.", sourceType: "SESSION", severity: 20 },
      { offsetMinutesAgo: 7, type: "BENEFICIARY_ADDED", label: "New beneficiary created", description: "Beneficiary 'Suresh Verification Services' added with no prior history.", sourceType: "TRANSACTION", severity: 55 },
      { offsetMinutesAgo: 6, type: "SESSION_ANOMALY", label: "Unusual session behavior", description: "Rapid navigation straight from beneficiary creation to payment, skipping usual review screens.", sourceType: "SESSION", severity: 45 },
      { offsetMinutesAgo: 5, type: "PAYMENT_INITIATED", label: "₹85,000 payment initiated", description: "Payment submitted to newly added beneficiary.", sourceType: "TRANSACTION", severity: 60 },
    ],
    scriptedAnswers: [
      "The bank officer told me my account will be frozen.",
      "Yes, he asked me to transfer to a verification account and said an OTP would come to confirm the KYC.",
    ],
    expectedOutcome: "PAUSE — critical decision-integrity risk, KYC impersonation identified.",
  },
  {
    code: "DIGITAL_ARREST",
    title: "Digital Arrest",
    subtitle: "₹1,40,000 · Video call · Fear + isolation",
    description:
      "A caller impersonating a law-enforcement officer keeps the customer on a video call, alleging their identity was used in a crime, demanding funds to 'clear' the case.",
    scamCategory: "DIGITAL_ARREST",
    beneficiary: { name: "Case Settlement Account", isNew: true, trustScore: 14, suspiciousFlag: true, relationship: "Unknown", category: "individual" },
    amount: 140_000,
    purpose: "Case settlement / legal clearance",
    transaction: { transactionsLast24h: 2, unusualTime: true },
    behavioral: {
      unusualLogin: true,
      unusualDevice: true,
      remoteAccessContext: false,
      rapidAppSwitching: true,
      unusualSessionDuration: true,
      suspiciousNavigationSequence: true,
    },
    context: { urgencyIndicator: true, suspiciousCallReported: true },
    timeline: [
      { offsetMinutesAgo: 32, type: "CALL", label: "Video call from 'law-enforcement officer' began", description: "Caller in uniform-like background demanded the customer stay on the call.", sourceType: "SESSION", severity: 65 },
      { offsetMinutesAgo: 20, type: "SESSION_START", label: "Banking application opened while on call", description: "Customer opened the app while remaining on the video call.", sourceType: "SESSION", severity: 50 },
      { offsetMinutesAgo: 15, type: "BENEFICIARY_ADDED", label: "New beneficiary created", description: "Beneficiary 'Case Settlement Account' added under instruction from the caller.", sourceType: "TRANSACTION", severity: 60 },
      { offsetMinutesAgo: 5, type: "PAYMENT_INITIATED", label: "₹1,40,000 payment initiated", description: "Large payment submitted while call remained active.", sourceType: "TRANSACTION", severity: 70 },
    ],
    scriptedAnswers: [
      "A police officer said my documents were used in a money laundering case and I need to pay to avoid arrest.",
      "Yes, he told me to stay on the video call and not tell anyone, and to transfer money to prove my innocence.",
    ],
    expectedOutcome: "PAUSE — critical decision-integrity risk, digital arrest pattern identified.",
  },
  {
    code: "FAKE_INVESTMENT",
    title: "Fake Investment",
    subtitle: "₹60,000 · Trading group · Guaranteed returns",
    description:
      "Customer was added to a messaging-app trading group promising guaranteed daily returns and is now depositing funds to a 'broker' account.",
    scamCategory: "FAKE_INVESTMENT",
    beneficiary: { name: "Zenith Capital Trades", isNew: true, trustScore: 28, suspiciousFlag: true, relationship: "Unknown", category: "individual" },
    amount: 60_000,
    purpose: "Investment deposit",
    transaction: { transactionsLast24h: 2, unusualTime: false },
    behavioral: {
      unusualLogin: false,
      unusualDevice: false,
      remoteAccessContext: false,
      rapidAppSwitching: true,
      unusualSessionDuration: false,
      suspiciousNavigationSequence: false,
    },
    context: { urgencyIndicator: true, suspiciousCallReported: false },
    timeline: [
      { offsetMinutesAgo: 25, type: "MESSAGE", label: "Trading group message with 'limited slot' offer", description: "Group admin posted a time-limited high-return offer.", sourceType: "SESSION", severity: 35 },
      { offsetMinutesAgo: 12, type: "BENEFICIARY_ADDED", label: "New beneficiary created", description: "Beneficiary 'Zenith Capital Trades' added.", sourceType: "TRANSACTION", severity: 45 },
      { offsetMinutesAgo: 4, type: "PAYMENT_INITIATED", label: "₹60,000 payment initiated", description: "Payment submitted to join the 'premium' investment tier.", sourceType: "TRANSACTION", severity: 50 },
    ],
    scriptedAnswers: [
      "My trading group admin said this is a guaranteed profit slot and it closes in 10 minutes.",
    ],
    expectedOutcome: "WARN or COOLING_PERIOD depending on responses — fake investment pattern identified.",
  },
  {
    code: "ELECTRICITY_SCAM",
    title: "Electricity Disconnection Scam",
    subtitle: "₹3,200 · SMS threat · Immediate disconnection",
    description:
      "An SMS claims the customer's electricity will be cut off within hours unless a small 'overdue bill' is paid to a personal account immediately.",
    scamCategory: "ELECTRICITY_DISCONNECTION",
    beneficiary: { name: "Electricity Bill Desk", isNew: true, trustScore: 30, suspiciousFlag: true, relationship: "Unknown", category: "individual" },
    amount: 3_200,
    purpose: "Electricity bill payment",
    transaction: { transactionsLast24h: 1, unusualTime: false },
    behavioral: {
      unusualLogin: false,
      unusualDevice: false,
      remoteAccessContext: false,
      rapidAppSwitching: false,
      unusualSessionDuration: true,
      suspiciousNavigationSequence: false,
    },
    context: { urgencyIndicator: true, suspiciousCallReported: false },
    timeline: [
      { offsetMinutesAgo: 6, type: "SMS", label: "SMS: 'power will be disconnected tonight'", description: "SMS from an unrecognized sender demanding immediate payment.", sourceType: "SESSION", severity: 30 },
      { offsetMinutesAgo: 3, type: "PAYMENT_INITIATED", label: "₹3,200 payment initiated", description: "Small urgent payment submitted to avoid disconnection.", sourceType: "TRANSACTION", severity: 35 },
    ],
    scriptedAnswers: ["I got a message saying my power will be cut off tonight if I don't pay right now."],
    expectedOutcome: "VERIFY or WARN — low absolute amount keeps this from escalating to PAUSE, demonstrating proportionate friction.",
  },
  {
    code: "FAMILY_EMERGENCY",
    title: "Family Emergency Scam",
    subtitle: "₹50,000 · Panic call · \"Don't tell anyone\"",
    description:
      "A caller claims the customer's grandson has been in an accident and needs money immediately, urging secrecy from other family members.",
    scamCategory: "FAMILY_EMERGENCY",
    beneficiary: { name: "Hospital Advance Desk", isNew: true, trustScore: 25, suspiciousFlag: true, relationship: "Unknown", category: "individual" },
    amount: 50_000,
    purpose: "Hospital advance payment",
    transaction: { transactionsLast24h: 1, unusualTime: true },
    behavioral: {
      unusualLogin: true,
      unusualDevice: false,
      remoteAccessContext: false,
      rapidAppSwitching: true,
      unusualSessionDuration: true,
      suspiciousNavigationSequence: true,
    },
    context: { urgencyIndicator: true, suspiciousCallReported: true },
    timeline: [
      { offsetMinutesAgo: 11, type: "CALL", label: "Panic call about a family accident", description: "Caller claimed to be a hospital staff member on behalf of a grandson.", sourceType: "SESSION", severity: 55 },
      { offsetMinutesAgo: 7, type: "BENEFICIARY_ADDED", label: "New beneficiary created", description: "Beneficiary 'Hospital Advance Desk' added.", sourceType: "TRANSACTION", severity: 50 },
      { offsetMinutesAgo: 2, type: "PAYMENT_INITIATED", label: "₹50,000 payment initiated", description: "Urgent payment submitted without confirming with family.", sourceType: "TRANSACTION", severity: 55 },
    ],
    scriptedAnswers: [
      "My grandson was in an accident and the hospital needs money right now for treatment, I haven't been able to reach my son yet.",
    ],
    expectedOutcome: "WARN or PAUSE — family emergency pattern identified, recommend verifying with family directly.",
  },
  {
    code: "LEGITIMATE_PAYMENT",
    title: "Legitimate High-Value Payment",
    subtitle: "₹85,000 · Known contractor · Normal session",
    description:
      "The same customer makes a high-value payment to a contractor they have paid before, during a normal session with no urgency or suspicious behavior.",
    scamCategory: null,
    beneficiary: { name: "Ramesh Home Contractors", isNew: false, trustScore: 88, suspiciousFlag: false, relationship: "Contractor", category: "merchant" },
    amount: 85_000,
    purpose: "Final payment for home renovation work",
    transaction: { transactionsLast24h: 1, unusualTime: false },
    behavioral: {
      unusualLogin: false,
      unusualDevice: false,
      remoteAccessContext: false,
      rapidAppSwitching: false,
      unusualSessionDuration: false,
      suspiciousNavigationSequence: false,
    },
    context: { urgencyIndicator: false, suspiciousCallReported: false },
    timeline: [
      { offsetMinutesAgo: 6, type: "SESSION_START", label: "Banking application opened", description: "Routine login from the customer's usual device.", sourceType: "SESSION", severity: 5 },
      { offsetMinutesAgo: 4, type: "NAVIGATION", label: "Viewed transaction history and contractor invoice", description: "Customer reviewed past payments before proceeding.", sourceType: "SESSION", severity: 0 },
      { offsetMinutesAgo: 1, type: "PAYMENT_INITIATED", label: "₹85,000 payment initiated", description: "Final renovation payment submitted to an existing, trusted beneficiary.", sourceType: "TRANSACTION", severity: 5 },
    ],
    scriptedAnswers: ["This is the final payment for the renovation work Ramesh completed last month."],
    expectedOutcome: "ALLOW after standard verification — demonstrates VIVEK does not block legitimate high-value payments.",
  },
];

export function getScenario(code: ScenarioCode): ScenarioDefinition {
  const found = SCENARIOS.find((s) => s.code === code);
  if (!found) throw new Error(`Unknown scenario: ${code}`);
  return found;
}
