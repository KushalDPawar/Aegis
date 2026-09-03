import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Transaction } from '../../types';
import { PillButton } from '../common/PillButton';
import { StatusBadge } from '../common/StatusBadge';
import { Shield, X, Hash, Calendar, ArrowUpRight, CheckCircle2, Lock } from 'lucide-react';

interface AuditDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ transaction, onClose }) => {
  useEffect(() => {
    if (transaction) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [transaction]);

  if (!transaction) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-soft-in">
      <div className="max-w-2xl w-full rounded-2xl border border-hairlineStrong bg-paper-surface p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-ink">
                  Forensic Audit Record
                </h3>
                <span className="font-mono text-xs text-ink-dim">
                  #{transaction.id}
                </span>
              </div>
              <p className="font-mono text-[11px] text-ink-dim">
                CONFIDENTIAL BANKING INTELLIGENCE TRANSCRIPT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-hairline text-ink-dim hover:text-ink hover:bg-hairline/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount & Beneficiary Hero */}
        <div className="rounded-xl border border-hairline bg-paper-elevated p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] text-ink-dim uppercase">
              TRANSACTION VALUE & RAIL
            </span>
            <div className="font-display text-3xl font-extrabold text-ink">
              ₹{transaction.amount.toLocaleString('en-IN')}
              <span className="font-mono text-xs font-semibold text-ink-muted ml-2">
                [{transaction.paymentType}]
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <StatusBadge
              label={transaction.status.toUpperCase()}
              tone={
                transaction.status === 'cleared'
                  ? 'emerald'
                  : transaction.status === 'cooling_off'
                  ? 'amber'
                  : 'rose'
              }
            />
            <span className="font-mono text-[11px] text-ink-dim mt-1">
              Risk Score: {transaction.riskScore}/100
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-hairline bg-paper-elevated p-3">
            <span className="font-mono text-[10px] text-ink-dim uppercase block mb-1">
              Beneficiary Entity
            </span>
            <span className="font-sans font-semibold text-ink">
              {transaction.beneficiaryName}
            </span>
            <div className="font-mono text-[11px] text-ink-muted mt-0.5">
              {transaction.beneficiaryAccount}
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-paper-elevated p-3">
            <span className="font-mono text-[10px] text-ink-dim uppercase block mb-1">
              Timestamp & Bank Rail
            </span>
            <span className="font-sans font-semibold text-ink">
              {transaction.timestamp}
            </span>
            <div className="font-mono text-[11px] text-ink-muted mt-0.5">
              {transaction.bankName} · Category: {transaction.category}
            </div>
          </div>
        </div>

        {/* Stated Purpose & Flags */}
        <div className="space-y-2">
          <span className="font-mono text-[11px] text-ink-dim uppercase">
            User Stated Context & Purpose:
          </span>
          <div className="rounded-lg border border-hairline bg-paper-elevated p-3 font-sans text-xs text-ink leading-relaxed">
            &quot;{transaction.statedPurpose}&quot;
          </div>
        </div>

        {/* Invariant Signal Flags */}
        <div className="space-y-2">
          <span className="font-mono text-[11px] text-ink-dim uppercase">
            Synthesized Invariant Signals:
          </span>
          <div className="space-y-1.5">
            {transaction.flags.map((flag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded border border-hairline bg-paper-elevated px-3 py-1.5 font-mono text-[11px] text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shrink-0" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Contextual Reasoning */}
        {transaction.contextReasoning && (
          <div className="space-y-2">
            <span className="font-mono text-[11px] text-accent-cyan font-semibold uppercase">
              AI Contextual Reasoning Transcript:
            </span>
            <div className="rounded-lg border border-accent-cyan/30 bg-accent-cyan/5 p-3.5 font-sans text-xs text-ink-muted leading-relaxed">
              {transaction.contextReasoning}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-hairline flex items-center justify-between font-mono text-[11px] text-ink-dim">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-accent-emerald" />
            <span>IMMUTABLE COMPLIANCE AUDIT TRAIL</span>
          </div>

          <PillButton variant="secondary" size="sm" onClick={onClose}>
            Close Transcript
          </PillButton>
        </div>
      </div>
    </div>,
    document.body
  );
};
