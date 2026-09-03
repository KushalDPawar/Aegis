export type RiskLevelName = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "CRITICAL";

export type GuardAction = "ALLOW" | "VERIFY" | "WARN" | "COOLING_PERIOD" | "PAUSE";

export interface TransactionSignals {
  amount: number;
  avgHistoricalAmount: number;
  transactionsLast24h: number;
  unusualTime: boolean;
}

export interface BeneficiarySignals {
  isFirstTime: boolean;
  trustScore: number; // 0-100, higher = more trusted
  historicalTransactionCount: number;
  suspiciousFlag: boolean;
  accountAgeDays: number;
}

export interface BehavioralSignals {
  unusualLogin: boolean;
  unusualDevice: boolean;
  remoteAccessContext: boolean;
  rapidAppSwitching: boolean;
  unusualSessionDuration: boolean;
  suspiciousNavigationSequence: boolean;
}

export interface ContextSignals {
  activeScamSimulation: boolean;
  urgencyIndicator: boolean;
  knownScamPatternCode: string | null;
  vulnerabilityProfile: "STANDARD" | "ELEVATED" | "VULNERABLE";
  suspiciousCallReported: boolean;
}

export interface SocialEngineeringSignals {
  authorityImpersonation: boolean;
  urgency: boolean;
  fear: boolean;
  accountSuspensionThreat: boolean;
  kycImpersonation: boolean;
  instructionFollowing: boolean;
  remoteAccessRequest: boolean;
  otpOrSafeAccountRequest: boolean;
  aiConfidence: number; // 0-1
}

export interface RiskInput {
  transaction: TransactionSignals;
  beneficiary: BeneficiarySignals;
  behavioral: BehavioralSignals;
  context: ContextSignals;
  socialEngineering?: SocialEngineeringSignals | null;
}

export interface WeightedSignal {
  category: "TRANSACTION" | "BENEFICIARY" | "BEHAVIORAL" | "CONTEXT" | "SOCIAL_ENGINEERING";
  code: string;
  label: string;
  weight: number;
  contribution: number;
  detail: string;
  confidence: "DETECTED" | "INFERRED" | "SIMULATED" | "CONFIRMED";
}

export interface RiskBreakdown {
  transactionRisk: number;
  beneficiaryRisk: number;
  behavioralRisk: number;
  contextRisk: number;
  socialEngineeringRisk: number;
  transactionLegitimacy: number;
  decisionIntegrity: number;
  decisionIntegrityLabel: RiskLevelName;
  overallLevel: RiskLevelName;
  recommendedAction: GuardAction;
  needsIntentCheck: boolean;
  signals: WeightedSignal[];
}
