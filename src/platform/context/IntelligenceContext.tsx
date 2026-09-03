"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  ActiveIntelligenceSignal,
  AIActionItem,
  DemoScenarioConfig,
  ScenarioId,
  RiskAnalysisStage,
  ContextualDialogueMessage,
  ScamVectorDetails,
  ScenarioSimulationInputs,
  RiskTier
} from '../types';
import { DEMO_SCENARIOS } from '../data/mockScenarios';
import { INITIAL_TRANSACTIONS, ACTIVE_SIGNALS, TODAY_ACTIONS } from '../data/mockTransactions';
import { analyzeTransaction, FraudAnalysisResponse } from '../services/fraudEngine';

interface SimulationState {
  currentStageIndex: number;
  stages: RiskAnalysisStage[];
  isAnalyzing: boolean;
  isComplete: boolean;
  isInterviewThinking?: boolean;
  activeTransaction: Transaction;
  dialogueMessages: ContextualDialogueMessage[];
  identifiedScam?: ScamVectorDetails;
  decisionMade?: 'cooling_off' | 'trusted_contact' | 'override' | 'cleared';
  requiresInterview: boolean;
  interviewCompleted: boolean;
  lastAnalysisResult?: FraudAnalysisResponse;
}

interface IntelligenceContextType {
  activeTab: 'command' | 'fraud' | 'health' | 'ai-center' | 'history';
  setActiveTab: (tab: 'command' | 'fraud' | 'health' | 'ai-center' | 'history') => void;
  currentScenarioId: ScenarioId;
  currentScenario: DemoScenarioConfig;
  switchScenario: (id: ScenarioId) => void;
  transactions: Transaction[];
  activeSignals: ActiveIntelligenceSignal[];
  actions: AIActionItem[];
  simulationState: SimulationState;
  startTransactionAnalysis: (customTx?: Partial<Transaction>) => void;
  submitInterviewResponse: (userMessage: string) => void;
  applyFrictionDecision: (decision: 'cooling_off' | 'trusted_contact' | 'override' | 'cleared') => void;
  resetSimulation: () => void;
  scenarioSliders: ScenarioSimulationInputs;
  updateScenarioSlider: (key: keyof ScenarioSimulationInputs, val: number) => void;
  markActionComplete: (id: string) => void;
}

const INITIAL_STAGES: RiskAnalysisStage[] = [
  {
    id: 'stage-1',
    step: 1,
    title: 'Checking Transfer Amount',
    subtitle: 'Comparing this amount to your typical payment history',
    status: 'pending',
    durationMs: 700,
    telemetryKey: 'AMOUNT',
    telemetryValue: 'Checking...',
    detail: 'We compare this transfer against your simulated 90-day average of ₹18,400 to spot unusual spikes.'
  },
  {
    id: 'stage-2',
    step: 2,
    title: 'Looking Up the Recipient',
    subtitle: 'Checking if we recognise this person or account',
    status: 'pending',
    durationMs: 850,
    telemetryKey: 'RECIPIENT',
    telemetryValue: 'Looking up...',
    detail: 'We check the recipient name and account against our simulated trusted and flagged recipient lists.'
  },
  {
    id: 'stage-3',
    step: 3,
    title: 'Reviewing Your Payment Behaviour',
    subtitle: 'Checking if this fits your normal spending habits',
    status: 'pending',
    durationMs: 750,
    telemetryKey: 'BEHAVIOUR',
    telemetryValue: 'Reviewing...',
    detail: 'We look for unusual patterns in how and when you are making this transfer compared to your history.'
  },
  {
    id: 'stage-4',
    step: 4,
    title: 'Scanning for Scam Patterns',
    subtitle: 'Looking for pressure tactics or suspicious language',
    status: 'pending',
    durationMs: 900,
    telemetryKey: 'SCAM SCAN',
    telemetryValue: 'Scanning...',
    detail: 'We check your stated reason and recipient details against known scam patterns and fraud keywords.'
  },
  {
    id: 'stage-5',
    step: 5,
    title: 'Generating Your Safety Result',
    subtitle: 'Putting everything together for a clear answer',
    status: 'pending',
    durationMs: 800,
    telemetryKey: 'RESULT',
    telemetryValue: 'Calculating...',
    detail: 'We combine all signals to produce a clear, personalised safety score and recommendation.'
  }
];


const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'command' | 'fraud' | 'health' | 'ai-center' | 'history'>('command');
  const [currentScenarioId, setCurrentScenarioId] = useState<ScenarioId>('digital_arrest');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeSignals, setActiveSignals] = useState<ActiveIntelligenceSignal[]>(ACTIVE_SIGNALS);
  const [actions, setActions] = useState<AIActionItem[]>(TODAY_ACTIONS);

  const currentScenario = DEMO_SCENARIOS[currentScenarioId] || DEMO_SCENARIOS.digital_arrest;

  // Interactive Health Sliders
  const [scenarioSliders, setScenarioSliders] = useState<ScenarioSimulationInputs>({
    discretionaryReduction: 0,
    incomeShock: 0,
    debtPrepayment: 0,
    emergencyAutoSweep: 0
  });

  // Simulation State
  const [simulationState, setSimulationState] = useState<SimulationState>(() => {
    const sc = DEMO_SCENARIOS.digital_arrest;
    const baseTx = sc.simulatedTransaction as Transaction;
    const engineResult = analyzeTransaction({
      beneficiaryName: baseTx.beneficiaryName,
      beneficiaryAccount: baseTx.beneficiaryAccount,
      amount: baseTx.amount,
      statedPurpose: baseTx.statedPurpose || '',
      paymentType: baseTx.paymentType || 'RTGS',
      category: baseTx.category || 'Government / Legal',
    });

    const initStages = INITIAL_STAGES.map((s, idx) => ({
      ...s,
      status: (idx === 0 || idx === 1 || idx === 2 || idx === 4) ? ('flagged' as const) : ('pending' as const),
      telemetryValue: engineResult.stageTelemetry[idx] || 'Evaluated'
    }));

    return {
      currentStageIndex: 4,
      stages: initStages,
      isAnalyzing: false,
      isComplete: true,
      activeTransaction: {
        ...baseTx,
        riskScore: engineResult.riskScore,
        riskTier: engineResult.riskTier,
        flags: engineResult.flags,
        contextReasoning: engineResult.contextReasoning,
        status: 'flagged'
      },
      lastAnalysisResult: engineResult,
      dialogueMessages: [
        {
          id: 'msg-init',
          sender: 'sentinel',
          timestamp: '14:22:05',
          text: `⚠️ Sentinel Contextual Audit Initiated\n\nWe noticed this transfer of ₹${baseTx.amount.toLocaleString('en-IN')} to "${baseTx.beneficiaryName}" is 520% higher than your standard baseline and directs funds to an account registered 12 minutes ago.\n\nBefore proceeding, can you briefly tell me what this payment is for and who requested it?`,
          urgencyLevel: 'caution',
          options: [
            'Someone claiming to be police told me my Aadhaar is tied to a narcotics case and I must deposit into escrow.',
            'Payment to our graphic design agency for branding assets per quarterly agreement.',
            'Urgent deposit requested via SMS link to prevent bank account freeze.'
          ]
        }
      ],
      identifiedScam: sc.scamVector,
      decisionMade: undefined,
      requiresInterview: true,
      interviewCompleted: false
    };
  });

  const updateScenarioSlider = (key: keyof ScenarioSimulationInputs, val: number) => {
    setScenarioSliders(prev => ({ ...prev, [key]: val }));
  };

  const markActionComplete = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, completed: true } : a));
  };

  const switchScenario = (id: ScenarioId) => {
    const sc = DEMO_SCENARIOS[id];
    if (!sc) return;
    setCurrentScenarioId(id);

    const baseTx = sc.simulatedTransaction as Transaction;
    const isLegit = id === 'legitimate_vendor';
    const isDistress = id === 'financial_distress';

    const engineResult = analyzeTransaction({
      beneficiaryName: baseTx.beneficiaryName,
      beneficiaryAccount: baseTx.beneficiaryAccount,
      amount: baseTx.amount,
      statedPurpose: baseTx.statedPurpose || '',
      paymentType: baseTx.paymentType || 'RTGS',
      category: baseTx.category || 'Personal',
    });

    const initStages = INITIAL_STAGES.map((s, idx) => ({
      ...s,
      status: isLegit ? ('completed' as const) : (idx === 3 ? 'pending' : 'flagged') as any,
      telemetryValue: engineResult.stageTelemetry[idx] || 'Evaluated'
    }));

    // Update simulation state according to selected scenario
    setSimulationState({
      currentStageIndex: 4,
      stages: initStages,
      isAnalyzing: false,
      isComplete: true,
      activeTransaction: {
        ...baseTx,
        riskScore: isLegit ? 4 : engineResult.riskScore,
        riskTier: isLegit ? 'low' : engineResult.riskTier,
        flags: isLegit ? ['New Beneficiary (Whitelisted Sector: Creative Services)'] : engineResult.flags,
        contextReasoning: engineResult.contextReasoning,
        status: isLegit ? 'cleared' : 'flagged'
      },
      lastAnalysisResult: engineResult,
      dialogueMessages: isLegit ? [
        {
          id: 'msg-legit-init',
          sender: 'sentinel',
          timestamp: 'Just now',
          text: `Sentinel Risk Audit: Transfer of ₹${baseTx.amount.toLocaleString('en-IN')} to "${baseTx.beneficiaryName}" looks normal. Please confirm the nature of this disbursement.`,
          options: ['Payment to our freelance graphics vendor for quarterly product branding collaterals.']
        }
      ] : isDistress ? [
        {
          id: 'msg-distress-init',
          sender: 'sentinel',
          timestamp: 'Just now',
          text: `Analyzing debt repayment pattern for ₹${baseTx.amount.toLocaleString('en-IN')} to ${baseTx.beneficiaryName}. This marks the 3rd consecutive month of minimum balance roll-over.`,
          options: ['Making payments on credit card balances accumulated over travel and festival shopping.']
        }
      ] : [
        {
          id: 'msg-init-fraud',
          sender: 'sentinel',
          timestamp: 'Just now',
          text: `⚠️ Sentinel Contextual Audit: Transfer of ₹${baseTx.amount.toLocaleString('en-IN')} to "${baseTx.beneficiaryName}". High risk indicators detected. Before proceeding, can you briefly tell me what this payment is for and who instructed you?`,
          urgencyLevel: 'caution',
          options: [
            id === 'fake_kyc' 
              ? 'Received urgent SMS stating my PAN and bank account will be blocked unless I make a verification deposit.'
              : 'Someone claiming to be police told me my Aadhaar is tied to a narcotics case and I must deposit into escrow.'
          ]
        }
      ],
      identifiedScam: sc.scamVector,
      decisionMade: isLegit ? 'cleared' : undefined,
      requiresInterview: !isLegit,
      interviewCompleted: false
    });

    if (id === 'financial_distress') {
      setScenarioSliders({
        discretionaryReduction: 15,
        incomeShock: 0,
        debtPrepayment: 5000,
        emergencyAutoSweep: 3000
      });
    }
  };

  const startTransactionAnalysis = (customTx?: Partial<Transaction>) => {
    // Merge submitted form inputs over the active scenario transaction
    const baseTx = simulationState.activeTransaction;
    const merged = { ...baseTx, ...(customTx || {}) } as Transaction;

    // ── Run deterministic fraud engine against actual submitted inputs ──────
    const engineResult: FraudAnalysisResponse = analyzeTransaction({
      beneficiaryName:    merged.beneficiaryName,
      beneficiaryAccount: merged.beneficiaryAccount,
      amount:             merged.amount,
      statedPurpose:      merged.statedPurpose || '',
      paymentType:        merged.paymentType || 'RTGS',
      category:           merged.category || 'Personal',
    });

    // Determine status from engine
    const txStatus: Transaction['status'] =
      engineResult.riskTier === 'low' ? 'cleared' : 'flagged';

    // Build enriched transaction with engine-derived values
    const enrichedTx: Transaction = {
      ...merged,
      riskScore:       engineResult.riskScore,
      riskTier:        engineResult.riskTier,
      flags:           engineResult.flags,
      contextReasoning: engineResult.contextReasoning,
      status:          txStatus,
    };

    // Build opening audit dialogue message using engine output
    const isLowRisk = engineResult.riskTier === 'low';
    const topSignals = engineResult.signals
      .filter(s => s.impact === 'critical' || s.impact === 'high')
      .slice(0, 2)
      .map(s => `• ${s.name}: ${s.explanation}`)
      .join('\n');

    const auditText = isLowRisk
      ? `Sentinel Risk Audit: Transfer of ₹${merged.amount.toLocaleString('en-IN')} to "${merged.beneficiaryName}" — Risk Score ${engineResult.riskScore}/100 (${engineResult.riskLevel}).\n\n${engineResult.recommendation}\n\nPlease confirm the nature of this disbursement.`
      : `⚠️ Sentinel Contextual Audit Initiated\n\nTransfer of ₹${merged.amount.toLocaleString('en-IN')} to "${merged.beneficiaryName}" has been flagged — Risk Score ${engineResult.riskScore}/100 (${engineResult.riskLevel}).\n\n${topSignals ? `Key signals:\n${topSignals}\n\n` : ''}${engineResult.recommendation}\n\nBefore proceeding, can you briefly tell us what this payment is for and who requested it?`;

    const initMsg: ContextualDialogueMessage = {
      id:           `msg-engine-${Date.now()}`,
      sender:       'sentinel',
      timestamp:    'Just now',
      text:         auditText,
      urgencyLevel: engineResult.riskLevel === 'CRITICAL' ? 'critical'
                  : engineResult.riskLevel === 'HIGH'     ? 'caution'
                  : 'normal',
      options: isLowRisk
        ? ['Payment to a verified vendor for commercial deliverables per invoice.']
        : [
            'Someone claiming to be police told me my Aadhaar is tied to a case and I must deposit funds.',
            'Payment to our freelance agency for branding assets per quarterly agreement.',
            'Received urgent SMS / call requesting this transfer to avoid account suspension.',
          ],
    };

    setSimulationState(prev => ({
      ...prev,
      activeTransaction:  enrichedTx,
      lastAnalysisResult: engineResult,
      isAnalyzing:        true,
      isComplete:         false,
      currentStageIndex:  0,
      decisionMade:       undefined,
      interviewCompleted: false,
      requiresInterview:  !isLowRisk,
      dialogueMessages:   [initMsg],
      stages: INITIAL_STAGES.map(s => ({ ...s, status: 'pending' }))
    }));

    // ── Sequential stage execution with engine-derived telemetry ──────────
    let currentStep = 0;
    const telemetry = engineResult.stageTelemetry;

    const executeStep = () => {
      if (currentStep < INITIAL_STAGES.length) {
        setSimulationState(prev => {
          const updatedStages = [...prev.stages];
          if (currentStep > 0) {
            const prevStatus = isLowRisk ? 'completed'
              : (telemetry[currentStep - 1].toLowerCase().includes('spike')
                 || telemetry[currentStep - 1].toLowerCase().includes('high-risk')
                 || telemetry[currentStep - 1].toLowerCase().includes('coercion')
                 || telemetry[currentStep - 1].toLowerCase().includes('detected')
                 || telemetry[currentStep - 1].toLowerCase().includes('markers'))
              ? 'flagged' : 'completed';
            updatedStages[currentStep - 1] = {
              ...updatedStages[currentStep - 1],
              status:         prevStatus,
              telemetryValue: telemetry[currentStep - 1],
            };
          }
          updatedStages[currentStep] = {
            ...updatedStages[currentStep],
            status:         'processing',
            telemetryValue: 'Evaluating in Real-Time...',
          };
          return { ...prev, currentStageIndex: currentStep, stages: updatedStages };
        });

        const duration = INITIAL_STAGES[currentStep].durationMs;
        currentStep++;
        setTimeout(executeStep, duration);
      } else {
        // Finalise all stages with engine telemetry
        setSimulationState(prev => {
          const finalStages = prev.stages.map((s, idx) => {
            const tv  = telemetry[idx] || 'Computed';
            const isFl = !isLowRisk && (
              tv.toLowerCase().includes('spike')
              || tv.toLowerCase().includes('high-risk')
              || tv.toLowerCase().includes('coercion')
              || tv.toLowerCase().includes('detected')
              || tv.toLowerCase().includes('markers')
              || tv.toLowerCase().includes('critical')
            );
            return {
              ...s,
              status:         (isFl ? 'flagged' : 'completed') as any,
              telemetryValue: tv,
            };
          });
          return {
            ...prev,
            isAnalyzing:      false,
            isComplete:       true,
            stages:           finalStages,
            requiresInterview: !isLowRisk,
            decisionMade:     isLowRisk ? 'cleared' : undefined,
          };
        });
      }
    };

    setTimeout(executeStep, 200);
  };

  const submitInterviewResponse = (userText: string) => {
    if (!userText.trim() || simulationState.isInterviewThinking) return;

    const trimmedText = userText.trim();
    const userMsg: ContextualDialogueMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: trimmedText
    };

    setSimulationState(prev => {
      if (prev.isInterviewThinking) return prev;
      return {
        ...prev,
        isInterviewThinking: true,
        dialogueMessages: [...prev.dialogueMessages, userMsg]
      };
    });

    // AI Semantic Reasoning Engine parses text
    setTimeout(() => {
      const lower = trimmedText.toLowerCase();
      let responseText = '';
      let detectedTokens: string[] = [];
      let tier: RiskTier = 'critical';
      let score = 96;
      let scamVector = DEMO_SCENARIOS.digital_arrest.scamVector;
      let flagsToAdd: string[] = [];
      let nextOptions: string[] = [];

      if (
        lower.includes('police') || lower.includes('cbi') || lower.includes('arrest') ||
        lower.includes('aadhaar') || lower.includes('escrow') || lower.includes('parcel') ||
        lower.includes('skype') || lower.includes('court') || lower.includes('customs') ||
        lower.includes('narcotics') || lower.includes('fedex')
      ) {
        detectedTokens = ['police', 'cbi', 'arrest', 'aadhaar', 'escrow', 'parcel'].filter(t => lower.includes(t));
        if (detectedTokens.length === 0) detectedTokens = ['law enforcement', 'coercion'];
        responseText = `⚠️ CRITICAL COERCION PATTERN DETECTED:\n\nOur contextual engine matches this explanation with the known "Digital Arrest" syndicate playbook.\n\n• Key Finding: Real police officers, CBI, or Customs NEVER conduct court hearings over Skype/WhatsApp and NEVER require you to transfer funds to a "safe escrow" or verification account.\n• Psychological Trigger: Fear of arrest with artificial urgency (< 30 minutes) to prevent you from consulting family or your bank.\n• Protective Safeguard: We have applied an intelligent protective hold. Do not send this money.`;
        tier = 'critical';
        score = 96;
        scamVector = DEMO_SCENARIOS.digital_arrest.scamVector;
        flagsToAdd = [
          'High Linguistic Stress / Urgent Timeline Signal',
          'Impersonation Keyword Density: "Arrest", "Police", "Escrow"',
          'Digital Arrest Coercion Pattern Identified'
        ];
        nextOptions = [
          'What should I do right now to protect my account?',
          'Why do scammers use Digital Arrest tactics?'
        ];
      } else if (
        lower.includes('kyc') || lower.includes('pan') || lower.includes('freeze') ||
        lower.includes('sms') || lower.includes('block') || lower.includes('link') ||
        lower.includes('apk') || lower.includes('unfreeze')
      ) {
        detectedTokens = ['kyc', 'pan', 'freeze', 'sms', 'verification fee'].filter(t => lower.includes(t));
        if (detectedTokens.length === 0) detectedTokens = ['kyc phishing', 'urgent sms'];
        responseText = `⚠️ FAKE KYC PHISHING IDENTIFIED:\n\nBanks never demand fees or fund transfers to complete KYC or link PAN cards. Official KYC updates are free and processed strictly inside the official bank application or in branch.\n\n• Protective Action: Do not transfer funds or click SMS links.\n• Threat Vector: Phishing portal designed to capture OTPs and drain savings.`;
        tier = 'critical';
        score = 91;
        scamVector = DEMO_SCENARIOS.fake_kyc.scamVector;
        flagsToAdd = [
          'SMS Originator Not In Bank Whitelist',
          'Fake KYC Phishing Threat Pattern'
        ];
        nextOptions = [
          'How do I complete genuine KYC safely?',
          'What should I do if I clicked the SMS link?'
        ];
      } else if (
        lower.includes('freelance') || lower.includes('design') || lower.includes('vendor') ||
        lower.includes('invoice') || lower.includes('branding') || lower.includes('agreement') ||
        lower.includes('developer') || lower.includes('consultant') || lower.includes('quarterly')
      ) {
        detectedTokens = ['freelance', 'vendor', 'invoice', 'branding'].filter(t => lower.includes(t));
        if (detectedTokens.length === 0) detectedTokens = ['commercial invoice'];
        responseText = `✓ CONTEXT VERIFIED BENIGN:\n\nStated purpose matches verified commercial invoicing against Chroma Studios LLP. Beneficiary has zero fraud reports and valid GSTIN registry.\n\n• Transaction cleared for normal dispatch with zero friction.`;
        tier = 'low';
        score = 4;
        scamVector = undefined;
        flagsToAdd = [
          'Context Verified: Benign Commercial Invoice',
          'Beneficiary GSTIN & Invoice Confirmed'
        ];
        nextOptions = [];
      } else if (lower.includes('what should i do') || lower.includes('help') || lower.includes('how') || lower.includes('protect')) {
        responseText = `🛡️ IMMEDIATE SAFETY ACTIONS:\n\n1. Disconnect any ongoing phone or video calls with the claimants immediately.\n2. Do NOT transfer any funds or share OTPs.\n3. Call the National Cyber Crime Helpline at 1930 or file a report at cybercrime.gov.in.\n4. Contact your local bank branch directly using the verified number on the back of your debit card.\n\nOur intelligent 48-hour cooling-off hold remains active to safeguard your capital.`;
        tier = 'critical';
        score = 96;
        nextOptions = [
          'Can I pause this transfer for 48 hours?',
          'How do I notify a trusted family contact?'
        ];
      } else {
        responseText = `Contextual evaluation completed. Stated purpose analyzed: "${trimmedText}". While no direct police coercion pattern was detected, the high transaction value and new beneficiary status warrant additional protective verification.`;
        tier = 'moderate';
        score = 55;
        nextOptions = [
          'Ask a trusted family member before sending',
          'Pause transfer for 48 hours'
        ];
      }

      const aiMsg: ContextualDialogueMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'sentinel',
        timestamp: 'Just now',
        text: responseText,
        highlightTokens: detectedTokens,
        urgencyLevel: tier === 'critical' ? 'critical' : tier === 'moderate' ? 'caution' : 'normal',
        options: nextOptions.length > 0 ? nextOptions : undefined
      };

      setSimulationState(prev => {
        const updatedFlags = tier === 'low'
          ? flagsToAdd
          : Array.from(new Set([...prev.activeTransaction.flags, ...flagsToAdd]));

        const updatedTx: Transaction = {
          ...prev.activeTransaction,
          statedPurpose: trimmedText,
          riskScore: score,
          riskTier: tier,
          status: tier === 'low' ? 'cleared' : 'flagged',
          flags: updatedFlags,
          contextReasoning: responseText.split('\n')[0]
        };

        const updatedStages = prev.stages.map((st, idx) => {
          if (idx === 3) {
            return {
              ...st,
              status: tier === 'low' ? ('completed' as const) : ('flagged' as const),
              telemetryValue: tier === 'low' ? 'Benign Context ✓' : `${detectedTokens.join(', ')} ⚠`
            };
          }
          if (idx === 4) {
            return {
              ...st,
              status: tier === 'low' ? ('completed' as const) : ('flagged' as const),
              telemetryValue: `Score ${score}/100 — ${tier.toUpperCase()}`
            };
          }
          return st;
        });

        return {
          ...prev,
          isComplete: true,
          isAnalyzing: false,
          isInterviewThinking: false,
          interviewCompleted: true,
          activeTransaction: updatedTx,
          identifiedScam: scamVector,
          stages: updatedStages,
          decisionMade: tier === 'low' ? 'cleared' : prev.decisionMade,
          dialogueMessages: [...prev.dialogueMessages, aiMsg]
        };
      });
    }, 800);
  };

  const applyFrictionDecision = (decision: 'cooling_off' | 'trusted_contact' | 'override' | 'cleared') => {
    setSimulationState(prev => ({
      ...prev,
      decisionMade: decision,
      activeTransaction: {
        ...prev.activeTransaction,
        status: decision === 'cooling_off' ? 'cooling_off' :
                decision === 'override' ? 'overridden' :
                decision === 'cleared' ? 'cleared' : 'flagged',
        coolingOffUntil: decision === 'cooling_off' ? 'In 48 hours (Protected)' : undefined
      }
    }));

    // Update transactions ledger
    setTransactions(prev => [
      {
        ...simulationState.activeTransaction,
        id: `TX-${Date.now().toString().slice(-6)}`,
        timestamp: 'Just now',
        status: decision === 'cooling_off' ? 'cooling_off' :
                decision === 'override' ? 'overridden' :
                decision === 'cleared' ? 'cleared' : 'flagged'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const resetSimulation = () => {
    switchScenario(currentScenarioId);
  };

  return (
    <IntelligenceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentScenarioId,
        currentScenario,
        switchScenario,
        transactions,
        activeSignals,
        actions,
        simulationState,
        startTransactionAnalysis,
        submitInterviewResponse,
        applyFrictionDecision,
        resetSimulation,
        scenarioSliders,
        updateScenarioSlider,
        markActionComplete
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = (): IntelligenceContextType => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
};
