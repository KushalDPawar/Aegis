import { AIPipelineStep } from '../types';

export const AI_PIPELINE_STEPS: AIPipelineStep[] = [
  {
    id: 'step-1',
    layer: 1,
    name: 'Financial Event Ingestion',
    subhead: 'Sub-millisecond packet telemetry & metadata extraction',
    algorithm: 'Deterministic Kafka Event Stream Parser v4.1',
    latencyMs: 1.4,
    inputTokens: ['TXN_ID', 'ACCOUNT_VPA', 'AMOUNT_INR', 'DEVICE_FINGERPRINT', 'IP_GEO', 'TOUCH_DYNAMICS'],
    outputTensor: 'Tensor<1x128> Normalized Financial Event Vector',
    safeguard: 'Zero-PII Tokenizer: Names & Account details salted with ephemeral HMAC-SHA256'
  },
  {
    id: 'step-2',
    layer: 2,
    name: 'Contextual Multi-Stream Analysis',
    subhead: 'Linguistic parsing & real-time conversational reasoning',
    algorithm: 'Transformer-based Contextual Intent Classifier (DeBERTa-v3 Distilled)',
    latencyMs: 18.2,
    inputTokens: ['USER_STATED_PURPOSE', 'CONVERSATIONAL_RESPONSE', 'VOICE_STRESS_TELEMETRY', 'CALL_HOLD_SIGNAL'],
    outputTensor: 'Tensor<1x64> Coercion & Social-Engineering Probability Matrix',
    safeguard: 'Context evaluation runs in encrypted secure enclave; prompts sanitized locally'
  },
  {
    id: 'step-3',
    layer: 3,
    name: 'Behavioral Graph & Scam Pattern Matching',
    subhead: 'Cross-institutional syndicate matching & temporal divergence',
    algorithm: 'Temporal Graph Neural Network (TGNN) + Dynamic Scammer Vector DB',
    latencyMs: 14.6,
    inputTokens: ['90_DAY_VELOCITY', 'BENEFICIARY_MULE_GRAPH', 'TIME_OF_DAY_DEVIATION', 'GEO_PROXIMITY'],
    outputTensor: 'Tensor<1x32> Anomaly Deviation Index (Z-Score = +4.81)',
    safeguard: 'Graph querying uses Homomorphic Encryption across inter-bank threat consortium'
  },
  {
    id: 'step-4',
    layer: 4,
    name: 'Financial Resilience & Shock Impact Modeling',
    subhead: 'Monte Carlo cashflow projection & liquidity runway evaluation',
    algorithm: 'Continuous Markov Liquidity Simulator (10,000 Path Permutations)',
    latencyMs: 11.8,
    inputTokens: ['CURRENT_EMERGENCY_RESERVES', 'DEBT_SERVICING_EXPENSES', 'DISCRETIONARY_BURN_RATE', 'INFLATION_INDEX'],
    outputTensor: 'Tensor<6x4> Forward 6-Month Liquidity Curve & Resilience Delta',
    safeguard: 'Strict boundary limits prevent negative debt loops in model feedback'
  },
  {
    id: 'step-5',
    layer: 5,
    name: 'Human-Centered Explainability Synthesis',
    subhead: 'Transparent rationale generation with zero opaque fear-mongering',
    algorithm: 'Constitutional Neuro-Symbolic Explainer (SHAP/LIME Feature Attribution)',
    latencyMs: 22.0,
    inputTokens: ['HIGH_WEIGHT_SHAP_FEATURES', 'SCAM_VECTOR_MO', 'USER_SOVEREIGNTY_PROTOCOL'],
    outputTensor: 'Plaintext Humanized Rationale & Transparent Signal Breakdown',
    safeguard: 'Zero fear-based nudges; explicitly outlines what official protocols look like'
  },
  {
    id: 'step-6',
    layer: 6,
    name: 'Intelligent Friction & Proactive Countermeasures',
    subhead: 'Calibrated non-authoritarian decision pathways',
    algorithm: 'Sovereign Choice Friction Engine (Tiered Escalation Protocol)',
    latencyMs: 3.2,
    inputTokens: ['FINAL_RISK_SCORE', 'USER_AUTONOMY_PREFERENCE', 'TRUSTED_ADVISOR_STATUS'],
    outputTensor: 'Execution Payload: [Cooling-Off-Hold | Trusted Contact Alert | Informed Override]',
    safeguard: 'User maintains ultimate transaction sovereignty via deliberate informed pledge'
  }
];
