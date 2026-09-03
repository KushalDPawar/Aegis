export type RiskTier = 'low' | 'moderate' | 'critical';

export type TransactionStatus = 
  | 'cleared'
  | 'flagged'
  | 'interviewing'
  | 'intercepted'
  | 'cooling_off'
  | 'overridden';

export interface Transaction {
  id: string;
  timestamp: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  bankName: string;
  amount: number;
  currency: string;
  paymentType: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS';
  category: 'Personal' | 'Vendor' | 'Investment' | 'Government / Legal' | 'Emergency' | 'Utility';
  status: TransactionStatus;
  riskTier: RiskTier;
  riskScore: number; // 0 - 100
  statedPurpose: string;
  flags: string[];
  contextReasoning?: string;
  coolingOffUntil?: string;
}

export interface RiskAnalysisStage {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  status: 'pending' | 'processing' | 'completed' | 'flagged';
  durationMs: number;
  telemetryKey: string;
  telemetryValue: string;
  detail: string;
}

export interface ContextualDialogueMessage {
  id: string;
  sender: 'sentinel' | 'user';
  timestamp: string;
  text: string;
  highlightTokens?: string[];
  urgencyLevel?: 'normal' | 'caution' | 'critical';
  options?: string[];
}

export interface ScamVectorDetails {
  patternId: string;
  patternName: string;
  category: 'digital_arrest' | 'kyc_phishing' | 'investment_ponzi' | 'job_escrow' | 'remote_access';
  confidence: number;
  threatLevel: 'High' | 'Severe' | 'Critical';
  psychologicalTriggers: string[];
  modusOperandi: string;
  officialProtocolDiscrepancy: string;
  immediateSafetyGuidance: string[];
  historicalInterceptsCount: number;
}

export interface FinancialResilienceData {
  resilienceScore: number; // 0 - 100 (e.g. 81)
  scoreChange3M: number; // e.g. -14
  rating: 'Robust' | 'Resilient' | 'Vulnerable' | 'Critical';
  monthlyIncome: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  liquidEmergencyBuffer: number;
  bufferRunwayMonths: number;
  debtToIncomeRatio: number; // percentage e.g. 34%
  savingsRate: number; // percentage e.g. 18%
  shockAbsorptionCapacity: string;
}

export interface TimelineDataPoint {
  month: string;
  income: number;
  essential: number;
  discretionary: number;
  savingsBuffer: number;
  resilienceScore: number;
  projected?: boolean;
}

export interface ScenarioSimulationInputs {
  discretionaryReduction: number; // 0 to 40%
  incomeShock: number; // 0 to 50%
  debtPrepayment: number; // 0 to 20000
  emergencyAutoSweep: number; // 0 to 15000
}

export interface AIActionItem {
  id: string;
  title: string;
  category: 'fraud_safeguard' | 'distress_prevention' | 'liquidity_buffer' | 'debt_optimization';
  urgency: 'critical' | 'elevated' | 'routine';
  impactSummary: string;
  detailExplanation: string;
  recommendedAction: string;
  actionButtonLabel: string;
  completed: boolean;
}

export interface ActiveIntelligenceSignal {
  id: string;
  timestamp: string;
  domain: 'fraud' | 'health' | 'behavior' | 'compliance';
  level: 'info' | 'warning' | 'alert';
  title: string;
  summary: string;
  metricDelta?: string;
  actionSuggested?: string;
}

export type ScenarioId = 'legitimate_vendor' | 'digital_arrest' | 'financial_distress' | 'fake_kyc';

export interface DemoScenarioConfig {
  id: ScenarioId;
  name: string;
  shortLabel: string;
  badge: string;
  description: string;
  simulatedTransaction: Partial<Transaction>;
  contextResponse: string;
  expectedRiskTier: RiskTier;
  expectedRiskScore: number;
  scamVector?: ScamVectorDetails;
}

export interface AIPipelineStep {
  id: string;
  layer: number;
  name: string;
  subhead: string;
  algorithm: string;
  latencyMs: number;
  inputTokens: string[];
  outputTensor: string;
  safeguard: string;
}
