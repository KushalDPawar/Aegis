import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { PillButton } from '../common/PillButton';
import { Clock, Users, AlertTriangle, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

export const FrictionDecision: React.FC = () => {
  const { simulationState, applyFrictionDecision } = useIntelligence();
  const { decisionMade, activeTransaction, isComplete } = simulationState;

  const [isOverrideModalOpen, setIsOverrideModalOpen]   = useState(false);
  const [overrideCountdown, setOverrideCountdown]       = useState(5);
  const [acknowledgedRisk, setAcknowledgedRisk]         = useState(false);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOverrideModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOverrideModalOpen]);

  // Use engine-computed riskTier on activeTransaction
  const isLowRisk = activeTransaction.riskTier === 'low';

  // Don't render until analysis is complete
  if (!isComplete) return null;

  const handleStartOverride = () => {
    setIsOverrideModalOpen(true);
    setOverrideCountdown(5);
    setAcknowledgedRisk(false);
    const interval = setInterval(() => {
      setOverrideCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmOverride = () => {
    applyFrictionDecision('override');
    setIsOverrideModalOpen(false);
  };

  return (
    <HairlineCard className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">What would you like to do?</h3>
          <p className="font-sans text-sm text-ink-dim mt-1">
            You are always in control. Choose how to proceed with this transfer.
          </p>
        </div>
        {decisionMade && (
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold border ${
            decisionMade === 'cooling_off' || decisionMade === 'cleared'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
          }`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {decisionMade === 'cooling_off' ? 'Hold applied'
             : decisionMade === 'trusted_contact' ? 'Contact notified'
             : decisionMade === 'override' ? 'Sent anyway'
             : 'Transfer cleared'}
          </span>
        )}
      </div>

      {isLowRisk ? (
        /* ── Safe Transfer ── */
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">This transfer looks safe</p>
              <p className="font-sans text-sm text-ink-muted mt-0.5">
                No unusual concerns detected. You can proceed normally.
              </p>
            </div>
          </div>
          <PillButton
            variant="primary"
            size="md"
            onClick={() => applyFrictionDecision('cleared')}
            disabled={decisionMade === 'cleared'}
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            {decisionMade === 'cleared'
              ? 'Transfer Sent ✓'
              : `Send ₹${activeTransaction.amount.toLocaleString('en-IN')}`}
          </PillButton>
        </div>

      ) : (
        /* ── Elevated Risk Options ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Option 1 — Wait 48 Hours */}
          <button
            onClick={() => applyFrictionDecision('cooling_off')}
            className={`text-left rounded-2xl border p-5 transition-all duration-200 flex flex-col gap-3 ${
              decisionMade === 'cooling_off'
                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                : 'border-hairline bg-paper-elevated hover:border-accent-cyan/50 hover:bg-hairline/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5" />
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Recommended
              </span>
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">Wait 48 Hours</p>
              <p className="font-sans text-sm text-ink-muted mt-1 leading-relaxed">
                Pause the transfer and come back later. Scammers disappear when they can&apos;t get money quickly — this protects you.
              </p>
            </div>
            <p className="font-mono text-xs text-accent-cyan font-semibold mt-auto">
              {decisionMade === 'cooling_off' ? '✓ Hold is active' : 'Pause my transfer →'}
            </p>
          </button>

          {/* Option 2 — Ask Someone */}
          <button
            onClick={() => applyFrictionDecision('trusted_contact')}
            className={`text-left rounded-2xl border p-5 transition-all duration-200 flex flex-col gap-3 ${
              decisionMade === 'trusted_contact'
                ? 'border-accent-cyan bg-accent-cyan/10 ring-2 ring-accent-cyan/30'
                : 'border-hairline bg-paper-elevated hover:border-accent-cyan/50 hover:bg-hairline/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-cyan-400">
                <Users className="h-5 w-5" />
              </span>
              <span className="font-mono text-[10px] text-ink-dim font-bold uppercase tracking-wider">
                Get a second opinion
              </span>
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">Ask Someone You Trust</p>
              <p className="font-sans text-sm text-ink-muted mt-1 leading-relaxed">
                Share this with a family member or trusted friend before sending. A fresh pair of eyes can spot things you might miss.
              </p>
            </div>
            <p className="font-mono text-xs text-accent-cyan font-semibold mt-auto">
              {decisionMade === 'trusted_contact' ? '✓ Contact notified' : 'Share with a trusted person →'}
            </p>
          </button>

          {/* Option 3 — Send Anyway */}
          <button
            onClick={handleStartOverride}
            className={`text-left rounded-2xl border p-5 transition-all duration-200 flex flex-col gap-3 ${
              decisionMade === 'override'
                ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/30'
                : 'border-hairline bg-paper-elevated hover:border-rose-500/40 hover:bg-hairline/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <span className="font-mono text-[10px] text-ink-dim font-bold uppercase tracking-wider">
                Your choice
              </span>
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">Send Anyway</p>
              <p className="font-sans text-sm text-ink-muted mt-1 leading-relaxed">
                You can still choose to send. We will ask you to confirm you understand the risks first.
              </p>
            </div>
            <p className="font-mono text-xs text-rose-500 font-semibold mt-auto">
              {decisionMade === 'override' ? '⚠ Transfer sent by you' : 'I accept the risks →'}
            </p>
          </button>
        </div>
      )}

      {/* Override Confirmation Modal (Portaled directly to document.body to prevent layout scroll displacement) */}
      {isOverrideModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-soft-in">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/40 bg-paper-surface p-7 space-y-5 shadow-2xl relative my-auto animate-fade-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-display text-xl font-bold text-ink">Are you sure?</h3>
            </div>

            <p className="font-sans text-sm text-ink-muted leading-relaxed">
              Our safety check flagged this ₹{activeTransaction.amount.toLocaleString('en-IN')} transfer
              as high risk. If sent to a scammer, this money is very unlikely to be recovered.
            </p>

            <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedRisk}
                  onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                  className="mt-0.5 rounded border-hairline text-rose-500 focus:ring-rose-500"
                />
                <span className="font-sans text-sm text-ink leading-snug">
                  I understand the risks. Government agencies, banks, and police never ask you to transfer money to clear your account or avoid arrest. I am choosing to send anyway.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <PillButton variant="ghost" size="sm" onClick={() => setIsOverrideModalOpen(false)}>
                Go back — protect my money
              </PillButton>
              <PillButton
                variant="danger"
                size="sm"
                disabled={!acknowledgedRisk || overrideCountdown > 0}
                onClick={confirmOverride}
              >
                {overrideCountdown > 0
                  ? `Please wait (${overrideCountdown}s)`
                  : 'Confirm — send anyway'}
              </PillButton>
            </div>
          </div>
        </div>,
        document.body
      )}
    </HairlineCard>
  );
};
