import { DemoScenarioConfig } from '../types';

export const DEMO_SCENARIOS: Record<string, DemoScenarioConfig> = {
  legitimate_vendor: {
    id: 'legitimate_vendor',
    name: 'Scenario 1: Legitimate Vendor Payment',
    shortLabel: '1. Legitimate (₹18.5k)',
    badge: 'VERIFIED BENIGN',
    description: 'User transfers ₹18,500 to a new freelance branding agency. Low behavioral divergence, calm contextual explanation. Analyzed & cleared with zero friction.',
    simulatedTransaction: {
      id: 'TX-LEGIT-7701',
      timestamp: 'Just now',
      beneficiaryName: 'Arjun Sharma (Chroma Studios LLP)',
      beneficiaryAccount: 'HDFC0001249 · 501004928192',
      bankName: 'HDFC Bank',
      amount: 18500,
      currency: 'INR',
      paymentType: 'IMPS',
      category: 'Vendor',
      status: 'cleared',
      riskTier: 'low',
      riskScore: 4,
      statedPurpose: 'Quarterly website UI asset licensing and brand system deliverables',
      flags: ['New Beneficiary (Whitelisted Sector: Creative Services)'],
      contextReasoning: 'Standard commercial invoice payment. Beneficiary registered with GSTIN 27AAAC... Transaction matches historical business expense rhythms.'
    },
    contextResponse: 'Payment to our freelance graphics designer for UI/UX branding assets per quarterly agreement. Invoice verified.',
    expectedRiskTier: 'low',
    expectedRiskScore: 4
  },

  digital_arrest: {
    id: 'digital_arrest',
    name: 'Scenario 2: Social Engineering — "Digital Arrest" Coercion',
    shortLabel: '2. Digital Arrest Scam (₹2.4L)',
    badge: 'COERCION INTERCEPT',
    description: 'High-value ₹2,40,000 transfer to an unknown personal account masquerading as an "RBI Clearance Escrow". Impersonators threatening immediate arrest over video call.',
    simulatedTransaction: {
      id: 'TX-FRAUD-9942',
      timestamp: 'Just now',
      beneficiaryName: 'Govt Clearance Escrow - Verif 09',
      beneficiaryAccount: 'SBIN0008821 · 30948827110',
      bankName: 'State Bank of India',
      amount: 240000,
      currency: 'INR',
      paymentType: 'RTGS',
      category: 'Government / Legal',
      status: 'flagged',
      riskTier: 'critical',
      riskScore: 96,
      statedPurpose: 'Temporary fund security audit and clearance',
      flags: [
        'New Beneficiary Added < 12 Minutes Ago',
        'Amount is 520% Above 90-Day Median Transfer',
        'High Linguistic Stress / Urgent Timeline Signal',
        'Impersonation Keyword Density: "Arrest", "Police", "Escrow"'
      ],
      contextReasoning: 'Coercive linguistic patterns match known Digital Arrest scam networks. Law enforcement agencies never demand fund transfers to personal accounts or conduct legal proceedings via Skype/WhatsApp.'
    },
    contextResponse: 'An officer claiming to be from Mumbai Cyber Crime Cell called over Skype showing police badges. He stated my Aadhaar was found in an illegal narcotics FedEx parcel in Delhi and I must transfer ₹2,40,000 to this RBI security verification account immediately to avoid non-bailable arrest before the magistrate today.',
    expectedRiskTier: 'critical',
    expectedRiskScore: 96,
    scamVector: {
      patternId: 'SCAM-DIGITAL-ARREST-V3',
      patternName: 'Law Enforcement / Digital Arrest Impersonation',
      category: 'digital_arrest',
      confidence: 97.4,
      threatLevel: 'Critical',
      psychologicalTriggers: [
        'Extreme Fear of Criminal Prosecution',
        'Artificial Urgency (< 30 min ultimatum)',
        'Video Intimidation (Forged Police Uniforms & Badges)',
        'Forced Isolation (Demanding victim stay on continuous call)'
      ],
      modusOperandi: 'Fraudsters impersonate CBI, Mumbai Police, or Customs officials. They allege the victim’s Aadhaar/mobile is tied to illicit courier parcels, money laundering, or terrorist financing, then stage fake judicial hearings to coerce fund liquidation into mule accounts.',
      officialProtocolDiscrepancy: 'Indian Police and CBI NEVER issue summons via WhatsApp, never conduct court hearings over Skype, and NEVER require citizens to transfer money to "clear" their bank accounts.',
      immediateSafetyGuidance: [
        'Disconnect the call immediately; do NOT stay on the line.',
        'Official law enforcement never requires financial transfers for legal innocence.',
        'File an instant complaint on the National Cyber Crime Portal (cybercrime.gov.in) or dial 1930.',
        'Your local bank branch has applied a 48-hour protective cooling lock on this transfer.'
      ],
      historicalInterceptsCount: 1420
    }
  },

  fake_kyc: {
    id: 'fake_kyc',
    name: 'Scenario 3: Urgent Phishing — Fake KYC / PAN Suspension',
    shortLabel: '3. Fake KYC Scam (₹45k)',
    badge: 'PHISHING DETECTED',
    description: 'Victim received an urgent SMS threatening bank account freeze within 2 hours unless ₹45,000 "Verification Deposit" is routed via third-party link.',
    simulatedTransaction: {
      id: 'TX-KYC-3381',
      timestamp: 'Just now',
      beneficiaryName: 'NPCI-KYC Gateway Desk',
      beneficiaryAccount: 'PAYTM0123456 · 9820192841@paytm',
      bankName: 'UPI Payment Gateway',
      amount: 45000,
      currency: 'INR',
      paymentType: 'UPI',
      category: 'Utility',
      status: 'flagged',
      riskTier: 'critical',
      riskScore: 91,
      statedPurpose: 'Mandatory KYC verification unlock deposit',
      flags: [
        'SMS Originator Not In Bank Whitelist',
        'Third-Party Unverified APK Download Detected',
        'Mule VPA flagged across 14 other financial institutions'
      ],
      contextReasoning: 'Bank compliance never asks customers to transfer money to complete KYC. Re-KYC is strictly free and performed via official in-app biometrics or verified branch visits.'
    },
    contextResponse: 'I received an urgent SMS that my account would be blocked by 6 PM today because my PAN card is not linked. The link asked me to pay a ₹45,000 refundable verification fee.',
    expectedRiskTier: 'critical',
    expectedRiskScore: 91,
    scamVector: {
      patternId: 'SCAM-KYC-PHISH-V2',
      patternName: 'Fake KYC / PAN Deactivation Phishing',
      category: 'kyc_phishing',
      confidence: 94.8,
      threatLevel: 'Severe',
      psychologicalTriggers: [
        'Panic of Losing Banking Access',
        'Impending Deadline Pressure',
        'False Promise of Full Refund'
      ],
      modusOperandi: 'Phishers send deceptive SMS spoofing bank sender IDs (e.g. AX-HDFCBK), leading to credential harvesting portals or APK malware that reroutes OTPs and initiates illicit UPI debits.',
      officialProtocolDiscrepancy: 'Banks NEVER charge fees or request transfers for KYC updates. Official updates happen in branch or within the bank’s certified banking app with zero debit.',
      immediateSafetyGuidance: [
        'Do not click any link received via SMS or WhatsApp.',
        'Delete any APK file or remote access utility (AnyDesk, TeamViewer) installed recently.',
        'Change internet banking passwords and UPI MPIN immediately from a clean device.'
      ],
      historicalInterceptsCount: 3890
    }
  },

  financial_distress: {
    id: 'financial_distress',
    name: 'Scenario 4: Early Financial Distress — Silent Runway Depletion',
    shortLabel: '4. Impending Distress Alert',
    badge: 'HEALTH INFLECTION',
    description: 'User spending trends reveal an alarming trajectory: discretionary expenses +28%, savings buffer depleted to 1.1 months, high-interest revolving credit rising. AI initiates early intervention before debt crisis occurs.',
    simulatedTransaction: {
      id: 'TX-DISTRESS-5510',
      timestamp: 'Yesterday',
      beneficiaryName: 'Urban Cred Flexi-Loan EMI',
      beneficiaryAccount: 'ICIC0002100 · 8910283719',
      bankName: 'ICICI Bank',
      amount: 32000,
      currency: 'INR',
      paymentType: 'NEFT',
      category: 'Personal',
      status: 'cleared',
      riskTier: 'moderate',
      riskScore: 58,
      statedPurpose: 'Monthly revolving credit card rollover payment',
      flags: [
        'Minimum Amount Due Paid Only (High Interest Compounding)',
        '3rd Consecutive Month of Emergency Buffer Drawdown',
        'Debt-to-Income Climbed to 44.5%'
      ],
      contextReasoning: 'Transaction is legitimate and authorized, but signals systemic financial distress. Sentinel flags the underlying trajectory to provide non-judgmental proactive buffer stabilization.'
    },
    contextResponse: 'Making payments on credit card balances accumulated over festival shopping and travel. Finding it tighter to maintain regular savings this quarter.',
    expectedRiskTier: 'moderate',
    expectedRiskScore: 58
  }
};
