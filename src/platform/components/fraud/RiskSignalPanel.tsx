import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import {
  ShieldAlert, ShieldCheck, ShieldX, Shield,
  AlertTriangle, CheckCircle2, Info, TrendingUp, Minus, Building2
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Risk level display config
// ---------------------------------------------------------------------------
const RISK_CONFIG = {
  CRITICAL: {
    bg:          'bg-rose-500/10 border-rose-500/40',
    iconBg:      'bg-rose-500/15',
    iconColor:   'text-rose-500',
    scoreColor:  'text-rose-500',
    barColor:    'bg-rose-500',
    label:       'HIGH RISK — Do not send',
    sublabel:    'We found serious warning signs with this transfer.',
    Icon:        ShieldX,
  },
  HIGH: {
    bg:          'bg-amber-500/10 border-amber-500/40',
    iconBg:      'bg-amber-500/15',
    iconColor:   'text-amber-500',
    scoreColor:  'text-amber-500',
    barColor:    'bg-amber-500',
    label:       'CAUTION — Be careful',
    sublabel:    'Some warning signs found. Please double-check before sending.',
    Icon:        ShieldAlert,
  },
  MODERATE: {
    bg:          'bg-yellow-500/8 border-yellow-500/30',
    iconBg:      'bg-yellow-500/15',
    iconColor:   'text-yellow-600 dark:text-yellow-400',
    scoreColor:  'text-yellow-600 dark:text-yellow-400',
    barColor:    'bg-yellow-500',
    label:       'MODERATE — Double-check',
    sublabel:    'A few things to note — review before proceeding.',
    Icon:        Shield,
  },
  LOW: {
    bg:          'bg-emerald-500/8 border-emerald-500/30',
    iconBg:      'bg-emerald-500/15',
    iconColor:   'text-emerald-500',
    scoreColor:  'text-emerald-500',
    barColor:    'bg-emerald-500',
    label:       'SAFE — Looks good',
    sublabel:    'No major concerns detected with this transfer.',
    Icon:        ShieldCheck,
  },
};

// ---------------------------------------------------------------------------
// Signal impact display config
// ---------------------------------------------------------------------------
const IMPACT_CONFIG = {
  critical: {
    border: 'border-rose-500/30 bg-rose-500/5',
    dot:    'bg-rose-500',
    text:   'text-rose-500',
    Icon:   AlertTriangle,
  },
  high: {
    border: 'border-amber-500/25 bg-amber-500/5',
    dot:    'bg-amber-500',
    text:   'text-amber-500',
    Icon:   TrendingUp,
  },
  medium: {
    border: 'border-yellow-500/20 bg-yellow-500/5',
    dot:    'bg-yellow-500',
    text:   'text-yellow-600 dark:text-yellow-400',
    Icon:   Minus,
  },
  low: {
    border: 'border-sky-500/20 bg-sky-500/5',
    dot:    'bg-sky-400',
    text:   'text-sky-500',
    Icon:   Info,
  },
  positive: {
    border: 'border-emerald-500/25 bg-emerald-500/5',
    dot:    'bg-emerald-500',
    text:   'text-emerald-500',
    Icon:   CheckCircle2,
  },
};

const IMPACT_LABEL: Record<string, string> = {
  critical: 'Big concern',
  high:     'Worth noting',
  medium:   'Minor note',
  low:      'Small detail',
  positive: 'Good sign',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const RiskSignalPanel: React.FC = () => {
  const { simulationState } = useIntelligence();
  const { activeTransaction, isComplete, isAnalyzing } = simulationState;

  // Empty state
  if (!isComplete && !isAnalyzing) {
    return (
      <HairlineCard className="space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-accent-cyan" />
          <h3 className="font-display text-xl font-bold text-ink">Safety Check Results</h3>
        </div>
        <div className="rounded-xl border border-hairline/50 bg-paper-elevated/40 p-6 text-center space-y-2">
          <Shield className="h-10 w-10 text-ink-dim/30 mx-auto" />
          <p className="font-sans text-sm text-ink-dim">
            Fill in the form and click <strong>Run Safety Check</strong> to see the results here.
          </p>
          <p className="font-mono text-[11px] text-ink-dim/60">
            ⓘ Simulated analysis — not a real banking database
          </p>
        </div>
      </HairlineCard>
    );
  }

  // Loading state
  if (isAnalyzing && !isComplete) {
    return (
      <HairlineCard className="space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-accent-cyan animate-pulse" />
          <h3 className="font-display text-xl font-bold text-ink">Running Safety Checks…</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl border border-hairline/40 bg-paper-elevated/30 animate-pulse" />
          ))}
        </div>
      </HairlineCard>
    );
  }

  const { riskScore, riskTier, flags, contextReasoning } = activeTransaction;

  // Derive riskLevel display key
  const riskLevelKey: keyof typeof RISK_CONFIG =
    riskTier === 'critical' && riskScore >= 70 ? 'CRITICAL'
    : riskTier === 'critical'                  ? 'HIGH'
    : riskTier === 'moderate'                  ? 'MODERATE'
    : 'LOW';

  const cfg = RISK_CONFIG[riskLevelKey];
  const { Icon: RiskIcon } = cfg;

  // We don't have the structured signals in activeTransaction yet — reconstruct
  // from contextReasoning & flags to give the user clear plain-English bullets.
  // The actual signals are re-derived from context clues stored in flags[].
  const displayFlags = flags.filter(Boolean);

  return (
    <HairlineCard className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-hairline pb-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-accent-cyan" />
          <h3 className="font-display text-xl font-bold text-ink">Safety Check Results</h3>
        </div>
        <span className="font-mono text-[10px] text-ink-dim/60 bg-paper-elevated border border-hairline rounded px-2 py-1">
          SIMULATED · NOT REAL DATA
        </span>
      </div>

      {/* Big Risk Indicator */}
      <div className={`rounded-2xl border p-5 ${cfg.bg} space-y-4`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${cfg.iconBg}`}>
            <RiskIcon className={`h-7 w-7 ${cfg.iconColor}`} />
          </div>
          <div>
            <p className={`font-display text-lg font-black ${cfg.scoreColor}`}>
              {cfg.label}
            </p>
            <p className="font-sans text-sm text-ink-muted mt-0.5">
              {cfg.sublabel}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className={`font-display text-4xl font-black ${cfg.scoreColor}`}>
              {riskScore}
            </p>
            <p className="font-mono text-xs text-ink-dim">out of 100</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-black/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-ink-dim/60">
            <span>0 — Safe</span>
            <span>50 — Caution</span>
            <span>100 — Very High Risk</span>
          </div>
        </div>
      </div>

      {/* Confirmation of Payee: Bank Database Cross-Check */}
      {simulationState.lastAnalysisResult?.payeeVerification && (() => {
        const payee = simulationState.lastAnalysisResult.payeeVerification;
        const isMismatch = payee.verdict === 'CRITICAL_MISMATCH';
        const isVerified = payee.verdict === 'VERIFIED';
        const isPartial  = payee.verdict === 'PARTIAL_MATCH';

        return (
          <div className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-all ${
            isMismatch
              ? 'border-rose-500/40 bg-rose-500/10 shadow-[0_0_20px_-4px_rgba(244,63,94,0.15)]'
              : isVerified
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : isPartial
              ? 'border-amber-500/30 bg-amber-500/10'
              : 'border-hairline bg-paper-elevated/60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline/50 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className={`h-4 w-4 ${
                  isMismatch ? 'text-rose-500' : isVerified ? 'text-emerald-500' : 'text-accent-cyan'
                }`} />
                <h4 className="font-display text-sm font-bold text-ink">
                  Bank Registry Cross-Check (Confirmation of Payee)
                </h4>
              </div>

              <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isMismatch
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                  : isVerified
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
                  : isPartial
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                  : 'bg-paper-surface border-hairline text-ink-dim'
              }`}>
                {isMismatch
                  ? `🚨 ${payee.matchScore}% MATCH — NAME MISMATCH`
                  : isVerified
                  ? `✓ ${payee.matchScore}% MATCH — VERIFIED`
                  : isPartial
                  ? `⚠️ ${payee.matchScore}% PARTIAL MATCH`
                  : 'UNREGISTERED ACCOUNT'}
              </span>
            </div>

            {/* Side-by-Side Name Comparison: Entered vs Legal Core Bank Record */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-hairline/70 bg-paper-surface/80 p-3 space-y-1">
                <span className="font-mono text-[10px] text-ink-dim uppercase">Recipient Name You Entered</span>
                <p className="font-display text-sm font-bold text-ink truncate">{payee.enteredName}</p>
                <p className="font-mono text-[11px] text-ink-dim">{payee.enteredAccount}</p>
              </div>

              <div className={`rounded-xl border p-3 space-y-1 ${
                isMismatch
                  ? 'border-rose-500/40 bg-rose-500/10'
                  : 'border-hairline/70 bg-paper-surface/80'
              }`}>
                <span className="font-mono text-[10px] text-ink-dim uppercase">Bank Core Database Record (Legal KYC)</span>
                <p className={`font-display text-sm font-bold truncate ${
                  isMismatch ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {payee.legalKycName}
                </p>
                <p className="font-mono text-[11px] text-ink-dim">{payee.bankName} · {payee.accountType}</p>
              </div>
            </div>

            <div className="rounded-lg border border-hairline/40 bg-paper-surface/40 p-3">
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                {payee.alertDetail}
              </p>
            </div>
          </div>
        );
      })()}

      {/* What we found (flags) */}
      {displayFlags.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-sans text-sm font-bold text-ink">What we found:</h4>
          <div className="space-y-2.5">
            {displayFlags.map((flag, i) => {
              // Determine display colour from flag content
              const isGood = flag.toLowerCase().includes('verified') || flag.toLowerCase().includes('trusted');
              const isBad  = flag.toLowerCase().includes('flagged') || flag.toLowerCase().includes('high')
                          || flag.toLowerCase().includes('suspicious') || flag.toLowerCase().includes('warning')
                          || flag.toLowerCase().includes('coercion') || flag.toLowerCase().includes('rare')
                          || flag.toLowerCase().includes('spike');
              const dotColor = isGood ? 'bg-emerald-500' : isBad ? 'bg-rose-500' : 'bg-amber-500';
              const textColor = isGood ? 'text-emerald-600 dark:text-emerald-400' : isBad ? 'text-rose-500' : 'text-amber-500';

              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    isGood ? 'border-emerald-500/25 bg-emerald-500/5'
                    : isBad ? 'border-rose-500/25 bg-rose-500/5'
                    : 'border-amber-500/20 bg-amber-500/5'
                  }`}
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
                  <span className={`font-sans text-sm font-medium ${textColor}`}>{flag}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Our recommendation */}
      {contextReasoning && (
        <div className="rounded-xl border border-hairline bg-paper-elevated/60 p-4 space-y-1.5">
          <p className="font-sans text-xs font-bold text-ink-dim uppercase tracking-wider">Our assessment</p>
          <p className="font-sans text-sm text-ink leading-relaxed">{contextReasoning}</p>
        </div>
      )}
    </HairlineCard>
  );
};
