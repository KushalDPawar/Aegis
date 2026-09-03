import { Transaction, ActiveIntelligenceSignal, AIActionItem } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-9481-01',
    timestamp: 'Today, 14:22',
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
      'Digital Arrest Coercion Pattern Match',
      'Velocity Spike: 5.2x Historical Median',
      'First-Time Beneficiary Added < 15m Ago'
    ],
    contextReasoning: 'Caller pressured user under false pretenses of criminal investigation. Sentinel intelligent friction intercepted transaction.'
  },
  {
    id: 'TX-9481-02',
    timestamp: 'Yesterday, 19:40',
    beneficiaryName: 'Tata Power Electricity Bill',
    beneficiaryAccount: 'BILLDESK · ELEC-849102',
    bankName: 'Axis Bank PG',
    amount: 4320,
    currency: 'INR',
    paymentType: 'UPI',
    category: 'Utility',
    status: 'cleared',
    riskTier: 'low',
    riskScore: 2,
    statedPurpose: 'Monthly utility consumption billing',
    flags: ['Recurring Whitelisted Beneficiary', 'Baseline Velocity Nominal'],
    contextReasoning: 'Standard household utility payment consistent with 18-month behavioral baseline.'
  },
  {
    id: 'TX-9481-03',
    timestamp: '28 Aug, 11:15',
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
    statedPurpose: 'Quarterly website UI asset licensing deliverables',
    flags: ['First-time vendor', 'Verified GSTIN Registry', 'Contextual Invoice Cross-Check'],
    contextReasoning: 'Context interview verified commercial freelance deliverable. Low behavioral friction.'
  },
  {
    id: 'TX-9481-04',
    timestamp: '25 Aug, 16:30',
    beneficiaryName: 'Urban Cred Flexi-Loan EMI',
    beneficiaryAccount: 'ICIC0002100 · 8910283719',
    bankName: 'ICICI Bank',
    amount: 32000,
    currency: 'INR',
    paymentType: 'NEFT',
    category: 'Personal',
    status: 'cleared',
    riskTier: 'moderate',
    riskScore: 54,
    statedPurpose: 'Monthly revolving credit repayment',
    flags: ['Minimum Payment Loop Detected', 'Debt Servicing Ratio Climbing'],
    contextReasoning: 'Legitimate transaction, but signals financial stress indicator. User has rolled over revolving balance for 3 months.'
  },
  {
    id: 'TX-9481-05',
    timestamp: '21 Aug, 09:05',
    beneficiaryName: 'Nature Fresh Organic Mart',
    beneficiaryAccount: 'UPI-MERC · naturefresh@icici',
    bankName: 'ICICI Bank',
    amount: 2850,
    currency: 'INR',
    paymentType: 'UPI',
    category: 'Personal',
    status: 'cleared',
    riskTier: 'low',
    riskScore: 1,
    statedPurpose: 'Groceries and weekly provisions',
    flags: ['Normal Geolocation: Mumbai West', 'Routine Essential'],
    contextReasoning: 'Expected regular essential outflow.'
  }
];

export const ACTIVE_SIGNALS: ActiveIntelligenceSignal[] = [
  {
    id: 'SIG-01',
    timestamp: '14 mins ago',
    domain: 'fraud',
    level: 'alert',
    title: 'High-Friction Transaction Intercepted',
    summary: '₹2,40,000 transfer paused. Linguistic analysis of user context matches Digital Arrest intimidation script.',
    metricDelta: 'Risk 96/100',
    actionSuggested: 'Review Coercion Intercept'
  },
  {
    id: 'SIG-02',
    timestamp: '2 hours ago',
    domain: 'health',
    level: 'warning',
    title: 'Emergency Buffer Contraction Alert',
    summary: 'Your liquid emergency runway has narrowed to 2.4 months due to non-essential spending surges.',
    metricDelta: '-18.4% 3M delta',
    actionSuggested: 'Adjust Discretionary Cap'
  },
  {
    id: 'SIG-03',
    timestamp: 'Yesterday',
    domain: 'behavior',
    level: 'info',
    title: 'Subscription Drift Detected',
    summary: '3 streaming & SaaS subscriptions have renewed without active cardholder engagement in 60 days (₹3,490/mo).',
    metricDelta: '₹41,880/yr leak',
    actionSuggested: 'One-Click Subscription Audit'
  },
  {
    id: 'SIG-04',
    timestamp: '3 days ago',
    domain: 'compliance',
    level: 'info',
    title: 'Whitelisted Merchant Verification',
    summary: 'Chroma Studios LLP verified against National GSTIN & MCA company database.',
    metricDelta: '100% Trust Score',
    actionSuggested: 'Save as Trusted Beneficiary'
  }
];

export const TODAY_ACTIONS: AIActionItem[] = [
  {
    id: 'ACT-01',
    title: 'Review Intercepted ₹2,40,000 Transfer',
    category: 'fraud_safeguard',
    urgency: 'critical',
    impactSummary: 'Prevents irreparable ₹2.4L capital loss to syndicated mule account',
    detailExplanation: 'Transfer is on protective 48-hr hold. Our conversational reasoning identified severe social-engineering coercion signals (law enforcement intimidation). Confirm security action.',
    recommendedAction: 'Engage in Contextual Interview or Confirm 48-Hour Hold',
    actionButtonLabel: 'Open Fraud Intelligence',
    completed: false
  },
  {
    id: 'ACT-02',
    title: 'Calibrate Discretionary Spending Corridor',
    category: 'distress_prevention',
    urgency: 'elevated',
    impactSummary: 'Restores liquid runway from 2.4 months to 4.5 months within 90 days',
    detailExplanation: 'Discretionary outflows have climbed 28% over 3 months while savings dropped. Adjusting your variable category cap by ₹8,500/month reverses this trajectory before stress peaks.',
    recommendedAction: 'Simulate recovery scenarios with predictive sliders',
    actionButtonLabel: 'Explore Health Navigator',
    completed: false
  },
  {
    id: 'ACT-03',
    title: 'Auto-Sweep Surplus to Emergency Vault',
    category: 'liquidity_buffer',
    urgency: 'routine',
    impactSummary: '+₹15,000 liquid safety buffer earning 7.1% interest',
    detailExplanation: 'You have a surplus liquidity pocket in your primary checking account. Moving ₹15,000 to the high-yield auto-sweep vault protects against impulse spending while growing reserves.',
    recommendedAction: 'Execute one-click sweep to liquid reserve vault',
    actionButtonLabel: 'Execute Vault Sweep',
    completed: false
  },
  {
    id: 'ACT-04',
    title: 'Revolving Credit Rollover Optimization',
    category: 'debt_optimization',
    urgency: 'elevated',
    impactSummary: 'Saves ₹14,200 in compounding 42% APR revolving finance charges',
    detailExplanation: 'Revolving card balance of ₹64,000 is accruing 3.5% monthly finance charges. Converting to a zero-penalty 6-month institutional term loan cuts interest by 68%.',
    recommendedAction: 'Review pre-approved low-APR term conversion',
    actionButtonLabel: 'Review Debt Restructure',
    completed: false
  }
];
