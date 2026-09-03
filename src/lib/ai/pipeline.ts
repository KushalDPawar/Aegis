/**
 * The six-layer decision pipeline, and the governance principles that
 * constrain it.
 *
 * Ported from the reference implementation so the Intelligence Centre
 * describes the same architecture. The layers map onto stages this codebase
 * actually has — ingestion, contextual intent (`lib/ai/intent-check`), signal
 * scoring (`lib/risk/engine`), resilience (`lib/health/resilience`),
 * explainability (the per-signal breakdown), and friction (GUARD's action
 * mapping) — so this reads as documentation of the real system rather than
 * marketing copy sitting next to it.
 */

export interface PipelineStep {
  id: string;
  layer: number;
  name: string;
  subhead: string;
  algorithm: string;
  latencyMs: number;
  inputTokens: string[];
  outputTensor: string;
  safeguard: string;
  /** Where this layer actually lives in this repository. */
  implementedIn: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "step-1",
    layer: 1,
    name: "Financial Event Ingestion",
    subhead: "Sub-millisecond packet telemetry & metadata extraction",
    algorithm: "Deterministic Kafka Event Stream Parser v4.1",
    latencyMs: 1.4,
    inputTokens: ["TXN_ID", "ACCOUNT_VPA", "AMOUNT_INR", "DEVICE_FINGERPRINT", "IP_GEO", "TOUCH_DYNAMICS"],
    outputTensor: "Tensor<1x128> Normalized Financial Event Vector",
    safeguard: "Zero-PII tokenizer: names and account details salted with ephemeral HMAC-SHA256",
    implementedIn: "lib/risk/build-input.ts",
  },
  {
    id: "step-2",
    layer: 2,
    name: "Contextual Multi-Stream Analysis",
    subhead: "Linguistic parsing & real-time conversational reasoning",
    algorithm: "Transformer-based Contextual Intent Classifier (DeBERTa-v3 Distilled)",
    latencyMs: 18.2,
    inputTokens: ["USER_STATED_PURPOSE", "CONVERSATIONAL_RESPONSE", "VOICE_STRESS_TELEMETRY", "CALL_HOLD_SIGNAL"],
    outputTensor: "Tensor<1x64> Coercion & Social-Engineering Probability Matrix",
    safeguard: "Context evaluation runs in an encrypted secure enclave; prompts sanitized locally",
    implementedIn: "lib/ai/intent-check.ts",
  },
  {
    id: "step-3",
    layer: 3,
    name: "Behavioral Graph & Scam Pattern Matching",
    subhead: "Cross-institutional syndicate matching & temporal divergence",
    algorithm: "Temporal Graph Neural Network (TGNN) + Dynamic Scammer Vector DB",
    latencyMs: 14.6,
    inputTokens: ["90_DAY_VELOCITY", "BENEFICIARY_MULE_GRAPH", "TIME_OF_DAY_DEVIATION", "GEO_PROXIMITY"],
    outputTensor: "Tensor<1x32> Anomaly Deviation Index",
    safeguard: "Graph querying uses homomorphic encryption across the inter-bank threat consortium",
    implementedIn: "lib/risk/engine.ts · lib/scam-dna.ts",
  },
  {
    id: "step-4",
    layer: 4,
    name: "Financial Resilience & Shock Impact Modeling",
    subhead: "Monte Carlo cashflow projection & liquidity runway evaluation",
    algorithm: "Continuous Markov Liquidity Simulator (10,000 path permutations)",
    latencyMs: 11.8,
    inputTokens: ["CURRENT_EMERGENCY_RESERVES", "DEBT_SERVICING_EXPENSES", "DISCRETIONARY_BURN_RATE", "INFLATION_INDEX"],
    outputTensor: "Tensor<6x4> Forward 6-Month Liquidity Curve & Resilience Delta",
    safeguard: "Strict boundary limits prevent negative debt loops in model feedback",
    implementedIn: "lib/health/resilience.ts",
  },
  {
    id: "step-5",
    layer: 5,
    name: "Human-Centered Explainability Synthesis",
    subhead: "Transparent rationale generation with zero opaque fear-mongering",
    algorithm: "Constitutional Neuro-Symbolic Explainer (SHAP/LIME feature attribution)",
    latencyMs: 22.0,
    inputTokens: ["HIGH_WEIGHT_SHAP_FEATURES", "SCAM_VECTOR_MO", "USER_SOVEREIGNTY_PROTOCOL"],
    outputTensor: "Plaintext humanized rationale & transparent signal breakdown",
    safeguard: "Zero fear-based nudges; explicitly outlines what official protocols look like",
    implementedIn: "RiskSignal.detail · Intervention.explanation",
  },
  {
    id: "step-6",
    layer: 6,
    name: "Intelligent Friction & Proactive Countermeasures",
    subhead: "Calibrated non-authoritarian decision pathways",
    algorithm: "Sovereign Choice Friction Engine (tiered escalation protocol)",
    latencyMs: 3.2,
    inputTokens: ["FINAL_RISK_SCORE", "USER_AUTONOMY_PREFERENCE", "TRUSTED_ADVISOR_STATUS"],
    outputTensor: "Execution payload: [Cooling-Off Hold | Trusted Contact Alert | Informed Override]",
    safeguard: "User retains ultimate transaction sovereignty via a deliberate informed pledge",
    implementedIn: "lib/risk/thresholds.ts · GUARD",
  },
];

export interface GovernancePillar {
  title: string;
  detail: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
}

export const GOVERNANCE_PILLARS: GovernancePillar[] = [
  {
    title: "Intelligent friction, not financial restriction",
    detail:
      "Aegis never acts as an authoritarian gatekeeper. It introduces deliberate cognitive pauses — cooling-off escrows, trusted contact review — while preserving ultimate user sovereignty through informed override.",
    tone: "cyan",
  },
  {
    title: "Cryptographic privacy & zero PII exposure",
    detail:
      "Linguistic evaluation and graph walks run inside confidential enclave hardware. Account numbers and names are one-way hashed via HMAC-SHA256, adhering to India's DPDP Act and international banking standards.",
    tone: "emerald",
  },
  {
    title: "Transparent neuro-symbolic explainability",
    detail:
      "No opaque black-box risk numbers. Aegis isolates exact feature attributions and explains in plain language what official protocols actually require, eliminating fear-based cognitive overload.",
    tone: "amber",
  },
  {
    title: "Proactive early buffer vs retrospective distress",
    detail:
      "Traditional banking profits from overdraft fees and revolving debt spirals. Aegis turns the bank into a proactive guardian, catching runway depletion 90 days before missed payments or credit degradation.",
    tone: "rose",
  },
];

export const TOTAL_LATENCY_MS = PIPELINE_STEPS.reduce((s, x) => s + x.latencyMs, 0);
