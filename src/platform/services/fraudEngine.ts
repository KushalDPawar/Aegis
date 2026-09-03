/**
 * Sentinel Safety Check Engine — Transparent Simulated Banking Intelligence
 *
 * PROTOTYPE NOTICE: This system uses simulated data to show how a real safety
 * check works. It does NOT access any real banking database or fraud registry.
 * All signals are computed directly from the details you enter.
 *
 * Five things we check:
 *   1. Whether we recognise the recipient (simulated registry)
 *   2. Patterns in the recipient name and account number
 *   3. How large this transfer is compared to your usual history
 *   4. Whether your stated reason contains warning signs
 *   5. The payment method you chose
 */

// ---------------------------------------------------------------------------
// Public Types
// ---------------------------------------------------------------------------

import { verifyPayeeCrossCheck, PayeeVerificationResult } from './payeeVerification';

export interface FraudAnalysisRequest {
  beneficiaryName: string;
  beneficiaryAccount: string;
  amount: number;
  statedPurpose: string;
  paymentType: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS';
  category: string;
}

export interface RiskSignal {
  /** Plain-English label shown to the user */
  name: string;
  impact: 'critical' | 'high' | 'medium' | 'low' | 'positive';
  /** Plain-English explanation shown to the user */
  explanation: string;
}

export interface FraudAnalysisResponse {
  riskScore: number;          // 0 – 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskTier: 'low' | 'moderate' | 'critical';
  signals: RiskSignal[];
  flags: string[];
  contextReasoning: string;
  recommendation: string;
  scamCategory?: string;
  /** Plain-English telemetry for the 5 pipeline stages */
  stageTelemetry: [string, string, string, string, string];
  /** Core Banking Confirmation of Payee verification record */
  payeeVerification?: PayeeVerificationResult;
}

// ---------------------------------------------------------------------------
// Simulated Recipient Registry
// ---------------------------------------------------------------------------

interface RegistryEntry {
  type: 'trusted' | 'flagged';
  nameKeywords: string[];
  accountKeywords?: string[];
  trustScore?: number;   // 0–100 for trusted
  riskScore?: number;    // 0–100 for flagged
  scamCategory?: string;
  note: string;
}

const BENEFICIARY_REGISTRY: RegistryEntry[] = [
  // ── Trusted ──────────────────────────────────────────────────────────
  {
    type: 'trusted',
    nameKeywords: ['chroma studios', 'arjun sharma'],
    accountKeywords: ['501004928192', 'hdfc0001249'],
    trustScore: 96,
    note: 'Verified vendor with GSTIN on record. Consistent billing history across 14 months.',
  },
  {
    type: 'trusted',
    nameKeywords: ['tata power', 'electricity bill'],
    accountKeywords: ['billdesk', 'elec-'],
    trustScore: 99,
    note: 'Established utility company. 18+ months of regular billing.',
  },
  {
    type: 'trusted',
    nameKeywords: ['nature fresh', 'organic mart'],
    accountKeywords: ['naturefresh@'],
    trustScore: 98,
    note: 'Regular local merchant with consistent transaction history.',
  },
  {
    type: 'trusted',
    nameKeywords: ['urban cred', 'flexi-loan'],
    accountKeywords: ['8910283719'],
    trustScore: 82,
    note: 'RBI-registered NBFC. Legitimate monthly loan repayment.',
  },

  // ── Flagged / High-Risk ───────────────────────────────────────────────
  {
    type: 'flagged',
    nameKeywords: [
      'govt clearance escrow', 'clearance escrow', 'security escrow',
      'verification escrow', 'clearance verif', 'rbi escrow',
      'clearance - verif', 'escrow verif',
    ],
    accountKeywords: ['30948827110'],
    riskScore: 97,
    scamCategory: 'digital_arrest',
    note: 'Account linked to "Digital Arrest" fraud reports. Real police and government agencies NEVER ask you to transfer money to an escrow account.',
  },
  {
    type: 'flagged',
    nameKeywords: [
      'npci-kyc gateway', 'kyc gateway desk', 'kyc verification desk',
      'pan verification', 'kyc gateway', 'npci kyc',
    ],
    accountKeywords: ['9820192841@paytm', 'paytm0123456'],
    riskScore: 93,
    scamCategory: 'kyc_phishing',
    note: 'Account linked to Fake KYC fraud. Banks never charge fees for KYC or PAN-linking.',
  },
  {
    type: 'flagged',
    nameKeywords: [
      'rbi clearance', 'cyber cell escrow', 'ed clearance',
      'enforcement directorate', 'customs clearance fund',
      'cbi escrow', 'police escrow', 'magistrate fund', 'court clearance',
    ],
    riskScore: 95,
    scamCategory: 'digital_arrest',
    note: 'Government agency impersonation. No legitimate government body collects money from citizens this way.',
  },
  {
    type: 'flagged',
    nameKeywords: [
      'investment doubling', 'guaranteed return', 'sure profit fund',
      'crypto doubler', 'guaranteed 40%', 'triple your money',
    ],
    riskScore: 91,
    scamCategory: 'investment_ponzi',
    note: 'Investment fraud pattern. No legitimate investment offers guaranteed returns upfront.',
  },
];

// ---------------------------------------------------------------------------
// User's Simulated 90-Day Payment History (baseline)
// ---------------------------------------------------------------------------

const BASELINE_MEDIAN    = 18_400;  // ₹18,400 — typical transfer
const BASELINE_HIGH      = 45_000;  // ₹45,000 — upper edge of normal
const BASELINE_EXTREME   = 240_000; // ₹2,40,000 — very high
const EXTREME_LARGE      = 500_000; // ₹5,00,000 — extremely rare / exceptional

// ---------------------------------------------------------------------------
// Name Pattern Watchlist
// ---------------------------------------------------------------------------

const SUSPICIOUS_NAME_PATTERNS: { pattern: RegExp; label: string; category?: string }[] = [
  { pattern: /escrow/i,                label: '"Escrow" in recipient name',       category: 'digital_arrest' },
  { pattern: /clearance/i,             label: '"Clearance" in recipient name',    category: 'digital_arrest' },
  { pattern: /verif[- ]?\d+/i,         label: 'Numbered verification account',   category: 'digital_arrest' },
  { pattern: /\barrest\b/i,            label: '"Arrest" in recipient name',       category: 'digital_arrest' },
  { pattern: /court|magistrate/i,      label: 'Court / Magistrate impersonation', category: 'digital_arrest' },
  { pattern: /kyc.*(gateway|desk)/i,   label: 'Fake KYC gateway name',           category: 'kyc_phishing'   },
  { pattern: /pan.*(suspend|block)/i,  label: 'PAN suspension threat name',      category: 'kyc_phishing'   },
  { pattern: /refund.*fee/i,           label: 'Refund-fee scam name',            category: 'kyc_phishing'   },
  { pattern: /\bfbi\b|\bcbi\b|\bncb\b|\bed\b/i, label: 'Law enforcement acronym impersonation', category: 'digital_arrest' },
  { pattern: /security.*fund|safe.*account|holding.*account/i, label: 'Suspicious "safety" account name', category: 'digital_arrest' },
];

// ---------------------------------------------------------------------------
// Account Format Watchlist
// ---------------------------------------------------------------------------

const SUSPICIOUS_ACCOUNT_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /^[0-9]{8,14}$/, label: 'plain number with no bank code' },
  { pattern: /@paytm$/i,      label: 'unverified Paytm handle' },
  { pattern: /random|temp|test|dummy/i, label: 'throwaway-sounding account' },
];

// ---------------------------------------------------------------------------
// Warning Signs in Stated Reason
// ---------------------------------------------------------------------------

const WARNING_PURPOSE_PATTERNS: { pattern: RegExp; label: string; weight: number }[] = [
  { pattern: /police|cbi|arrest|magistrate|court|ncb|fbi/i,               label: 'Mentions law enforcement',         weight: 40 },
  { pattern: /escrow|clearance fund|security deposit/i,                   label: 'Escrow / clearance language',      weight: 35 },
  { pattern: /security audit|audit.*fund|fund.*audit|fund.*security/i,   label: 'Security audit narrative',         weight: 28 },
  { pattern: /clearance fee|clearance deposit|mandatory.*clearance/i,    label: 'Clearance fee demand',             weight: 32 },
  { pattern: /verification.*deposit|verification.*fee|mandatory.*deposit/i, label: 'Verification deposit demand',  weight: 30 },
  { pattern: /advance.*fee|advance.*deposit/i,                            label: 'Advance fee demand',              weight: 25 },
  { pattern: /processing fee|handling fee/i,                              label: 'Processing / handling fee',       weight: 20 },
  { pattern: /urgent|immediate|within \d+ (hour|minute)/i,               label: 'Deadline pressure',               weight: 25 },
  { pattern: /freeze|block|suspend.*account/i,                            label: 'Account-freeze threat',           weight: 30 },
  { pattern: /kyc|pan.*link|re-kyc/i,                                     label: 'KYC / PAN threat',               weight: 30 },
  { pattern: /verify.*fund|secure.*fund|temporary hold/i,                label: 'Fund-security narrative',         weight: 20 },
  { pattern: /parcel|courier|customs/i,                                   label: 'Parcel / customs coercion',      weight: 25 },
  { pattern: /temporary.*transfer|safe.*custody|safekeeping/i,           label: 'False safe-custody narrative',   weight: 22 },
];

// ---------------------------------------------------------------------------
// Normal / Legitimate Purpose Patterns
// ---------------------------------------------------------------------------

const NORMAL_PURPOSE_PATTERNS: RegExp[] = [
  /invoice|billing|bill/i,
  /vendor|supplier|freelance/i,
  /salary|payroll/i,
  /rent|utility|electricity|water/i,
  /emi|loan repayment|credit card/i,
  /school|tuition|education/i,
  /medical|hospital|clinic/i,
  /grocery|provisions|daily use/i,
  /coffee|lunch|dinner|food/i,
  /shopping|amazon|flipkart|swiggy|zomato/i,
];

// ---------------------------------------------------------------------------
// Payment Method Risk Table
// ---------------------------------------------------------------------------

const PAYMENT_RAIL: Record<string, { weight: number; note: string }> = {
  UPI:  { weight: 8,  note: 'Instant & cannot be recalled once sent.' },
  IMPS: { weight: 6,  note: 'Immediate bank transfer — irreversible.' },
  NEFT: { weight: 3,  note: 'Batch-processed — slightly less urgent.' },
  RTGS: { weight: 10, note: 'Real-time high-value transfer, instantly irrevocable.' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function findRegistryMatch(name: string, account: string): RegistryEntry | null {
  const nl = name.toLowerCase();
  const al = account.toLowerCase();
  for (const entry of BENEFICIARY_REGISTRY) {
    const nm = entry.nameKeywords.some(kw => nl.includes(kw.toLowerCase()));
    const am = entry.accountKeywords?.some(kw => al.includes(kw.toLowerCase())) ?? false;
    if (nm || am) return entry;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main Analysis Function
// ---------------------------------------------------------------------------

export function analyzeTransaction(req: FraudAnalysisRequest): FraudAnalysisResponse {
  const { beneficiaryName, beneficiaryAccount, amount, statedPurpose, paymentType } = req;

  const signals: RiskSignal[] = [];
  const flags: string[]       = [];
  let   score                 = 0;
  let   detectedScam: string | undefined;

  // ── 1. Confirmation of Payee: Cross-check Name vs Account in Core Banking DB ─
  const payeeCheck = verifyPayeeCrossCheck(beneficiaryName, beneficiaryAccount);
  const hit = findRegistryMatch(beneficiaryName, beneficiaryAccount);

  if (payeeCheck.verdict === 'CRITICAL_MISMATCH') {
    score += payeeCheck.riskPenalty;
    detectedScam = payeeCheck.accountRecord?.reportedScamVectors?.[0] || 'digital_arrest';
    signals.push({
      name: payeeCheck.alertHeadline,
      impact: 'critical',
      explanation: payeeCheck.alertDetail,
    });
    flags.push(`Payee Discrepancy: Claims "${beneficiaryName}" vs Registered to "${payeeCheck.legalKycName}"`);
    if (payeeCheck.isMuleSuspect) {
      flags.push(`Account Watchlist: ${payeeCheck.accountRecord?.muleStatus || 'Mule Hit'}`);
    }

  } else if (payeeCheck.verdict === 'VERIFIED') {
    score += payeeCheck.riskPenalty; // negative penalty
    signals.push({
      name: payeeCheck.alertHeadline,
      impact: 'positive',
      explanation: payeeCheck.alertDetail,
    });
    flags.push(`Payee Verified: Legal Owner "${payeeCheck.legalKycName}"`);

  } else if (payeeCheck.verdict === 'PARTIAL_MATCH') {
    score += payeeCheck.riskPenalty;
    signals.push({
      name: payeeCheck.alertHeadline,
      impact: 'medium',
      explanation: payeeCheck.alertDetail,
    });
    flags.push(`Partial Match (${payeeCheck.matchScore}%): Bank Record "${payeeCheck.legalKycName}"`);

  } else {
    // UNREGISTERED
    score += payeeCheck.riskPenalty;
    signals.push({
      name: payeeCheck.alertHeadline,
      impact: 'medium',
      explanation: payeeCheck.alertDetail,
    });
    flags.push('Unregistered Account in Inter-Bank Registry');
  }

  // ── 2. Does the recipient name look suspicious? ─────────────────────────
  for (const { pattern, label, category } of SUSPICIOUS_NAME_PATTERNS) {
    if (pattern.test(beneficiaryName)) {
      score += 22;
      if (!detectedScam && category) detectedScam = category;
      signals.push({
        name: 'Suspicious Recipient Name',
        impact: 'high',
        explanation: `The recipient name contains a suspicious word (${label}). Scammers often use terms like "Escrow", "Clearance", or agency names in fake account names.`,
      });
      flags.push(`Suspicious Name: ${label}`);
      break;
    }
  }

  // ── 3. Does the account format look unusual? ────────────────────────────
  if (!hit) {
    const stripped = beneficiaryAccount.replace(/[\s·\-\.]/g, '');
    for (const { pattern, label } of SUSPICIOUS_ACCOUNT_PATTERNS) {
      if (pattern.test(stripped)) {
        score += 10;
        signals.push({
          name: 'Unusual Account Format',
          impact: 'medium',
          explanation: `The account format (${label}) is unusual for legitimate transfers. Real bank accounts and UPI IDs include a bank code or registered handle.`,
        });
        flags.push(`Account Format: ${label}`);
        break;
      }
    }
  }

  // ── 4. How large is this transfer? ─────────────────────────────────────
  const spike = amount / BASELINE_MEDIAN;

  if (amount <= 5_000) {
    signals.push({
      name: 'Small, Everyday Amount',
      impact: 'positive',
      explanation: `₹${amount.toLocaleString('en-IN')} is a small, routine transfer. No unusual amount detected.`,
    });

  } else if (amount <= BASELINE_HIGH) {
    const contrib = Math.round((spike - 1) * 4);
    score += contrib;
    signals.push({
      name: 'Slightly Above Your Usual Amount',
      impact: 'low',
      explanation: `₹${amount.toLocaleString('en-IN')} is ${spike.toFixed(1)}× your average — a bit higher than usual, but within a normal range.`,
    });

  } else if (amount <= BASELINE_EXTREME) {
    const contrib = Math.round(Math.min(30, (spike - 1) * 6));
    score += contrib;
    signals.push({
      name: 'Much Larger Than Your Usual Transfers',
      impact: 'high',
      explanation: `₹${amount.toLocaleString('en-IN')} is ${spike.toFixed(1)}× larger than your simulated average of ₹${BASELINE_MEDIAN.toLocaleString('en-IN')}. Large first-time transfers to unknown recipients are a common tactic used by scammers.`,
    });
    flags.push(`Amount: ${spike.toFixed(1)}× Your Average`);

  } else {
    // Very high: >₹2.4L
    score += 35;
    signals.push({
      name: 'Extremely Large Transfer',
      impact: 'critical',
      explanation: `₹${amount.toLocaleString('en-IN')} is ${spike.toFixed(0)}× larger than your simulated average. Transfers of this size to a new or unknown recipient are very high-risk. If someone is pressuring you to send this quickly, stop immediately.`,
    });
    flags.push(`Very High Amount: ${spike.toFixed(0)}× Your Average`);
  }

  // Secondary penalty for amounts beyond ₹5L — genuinely exceptional
  if (amount > EXTREME_LARGE) {
    score += 18;
    signals.push({
      name: 'Exceptionally Rare Transfer Size',
      impact: 'high',
      explanation: `₹${amount.toLocaleString('en-IN')} is an exceptionally large personal transfer. Routine payments almost never reach this level. If someone asked you to send this, please call your bank before proceeding.`,
    });
    flags.push('Transfer > ₹5,00,000 — Extremely Rare');
  }

  // ── 5. Why are you making this transfer? ───────────────────────────────
  let coercionScore = 0;
  const warningLabels: string[] = [];

  for (const { pattern, label, weight } of WARNING_PURPOSE_PATTERNS) {
    if (pattern.test(statedPurpose)) {
      coercionScore += weight;
      warningLabels.push(label);
    }
  }

  const isNormal = NORMAL_PURPOSE_PATTERNS.some(p => p.test(statedPurpose));

  if (coercionScore >= 40) {
    score += Math.min(35, coercionScore);
    signals.push({
      name: 'Your Reason Contains Scam Warning Signs',
      impact: 'critical',
      explanation: `Your stated reason uses phrases that appear in scam scripts: "${warningLabels.join('", "')}". Real police, banks, and government agencies NEVER ask you to transfer money to clear your account or avoid arrest.`,
    });
    flags.push(`Warning Language: ${warningLabels.join(', ')}`);
  } else if (coercionScore > 0) {
    score += Math.min(20, coercionScore);
    signals.push({
      name: 'Some Pressure Language in Your Reason',
      impact: 'medium',
      explanation: `Your stated reason contains words we sometimes see in scam reports: "${warningLabels.join('", "')}". If anyone is rushing you to make this transfer, take a pause.`,
    });
  } else if (isNormal) {
    score -= 10;
    signals.push({
      name: 'Reason Sounds Normal',
      impact: 'positive',
      explanation: 'Your stated reason matches everyday legitimate payments. No pressure language or scam-related words found.',
    });
  }

  // ── 6. How are you sending it? ─────────────────────────────────────────
  const rail = PAYMENT_RAIL[paymentType] ?? { weight: 5, note: 'Standard transfer method.' };

  if (rail.weight >= 8) {
    score += Math.round(rail.weight / 2);
    signals.push({
      name: `${paymentType} — Instant & Cannot Be Recalled`,
      impact: 'medium',
      explanation: `${rail.note} Once sent, you cannot get this money back. Make sure you completely trust the recipient before confirming.`,
    });
    flags.push(`${paymentType}: Instant Irrevocable Transfer`);
  } else if (rail.weight <= 3) {
    signals.push({
      name: `${paymentType} — Standard Transfer Method`,
      impact: 'positive',
      explanation: `${rail.note} This method is lower risk than instant transfers.`,
    });
  }

  // ── Finalise score ─────────────────────────────────────────────────────
  score = clamp(Math.round(score), 1, 99);

  let riskLevel: FraudAnalysisResponse['riskLevel'];
  let riskTier:  FraudAnalysisResponse['riskTier'];
  let recommendation: string;

  if (score >= 70) {
    riskLevel     = 'CRITICAL';
    riskTier      = 'critical';
    recommendation = 'Stop — do not send this money right now. Call your bank directly (the number on the back of your card) or dial 1930 (National Cyber Crime Helpline). Real police, government agencies, and banks never ask you to transfer funds to clear your account.';
  } else if (score >= 45) {
    riskLevel     = 'HIGH';
    riskTier      = 'critical';
    recommendation = 'Be very careful before sending. Talk to a family member, trusted friend, or your bank branch before completing this transfer. You can pause it for 48 hours to think it over — scammers hate delays.';
  } else if (score >= 25) {
    riskLevel     = 'MODERATE';
    riskTier      = 'moderate';
    recommendation = 'Double-check before sending. Make sure you know who this person is and that you are comfortable with the amount. If you feel any pressure, take a break before deciding.';
  } else {
    riskLevel     = 'LOW';
    riskTier      = 'low';
    recommendation = 'This looks like a routine transfer. No unusual concerns detected — proceed when ready.';
  }

  // ── Plain-English Context Summary ──────────────────────────────────────
  const highSignals    = signals.filter(s => s.impact === 'critical' || s.impact === 'high');
  const positiveCount  = signals.filter(s => s.impact === 'positive').length;

  let contextReasoning: string;
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    contextReasoning = highSignals.length > 0
      ? `Concerns found: ${highSignals.map(s => s.name.replace(/^[⚠✓] /, '')).join('; ')}.`
      : 'Multiple warning signs combine to make this transfer high risk.';
  } else if (positiveCount >= 2) {
    contextReasoning = `${positiveCount} positive trust indicators found. Overall risk: ${score}/100.`;
  } else {
    contextReasoning = `No major warning signs. Risk score: ${score}/100.`;
  }

  // ── Stage Telemetry (plain English for the 5-stage pipeline) ───────────
  const amountLabel = spike > 10
    ? `${spike.toFixed(0)}× Your Average — Very High`
    : spike > 3
    ? `${spike.toFixed(1)}× Your Average`
    : spike > 1.5
    ? `${spike.toFixed(1)}× Your Average`
    : 'Normal ✓';

  const recipientLabel = payeeCheck.verdict === 'CRITICAL_MISMATCH'
    ? `Discrepancy: ${payeeCheck.legalKycName} ⚠`
    : payeeCheck.verdict === 'VERIFIED'
    ? `Verified: ${payeeCheck.legalKycName} ✓`
    : payeeCheck.verdict === 'PARTIAL_MATCH'
    ? `Partial: ${payeeCheck.matchScore}% Match`
    : 'Unregistered Account';

  const behaviourLabel = coercionScore >= 40
    ? 'Warning Signs Found'
    : coercionScore > 0
    ? 'Some Pressure Language'
    : 'Normal ✓';

  const reasonLabel = warningLabels.length > 0
    ? `${warningLabels.length} Red Flag${warningLabels.length > 1 ? 's' : ''} Found`
    : isNormal
    ? 'Legitimate Reason ✓'
    : 'Neutral';

  const finalLabel = `Score ${score}/100 — ${riskLevel}`;

  const stageTelemetry: FraudAnalysisResponse['stageTelemetry'] = [
    amountLabel,
    recipientLabel,
    behaviourLabel,
    reasonLabel,
    finalLabel,
  ];

  return {
    riskScore: score,
    riskLevel,
    riskTier,
    signals,
    flags,
    contextReasoning,
    recommendation,
    scamCategory: detectedScam,
    stageTelemetry,
    payeeVerification: payeeCheck,
  };
}
