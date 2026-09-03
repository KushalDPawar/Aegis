import React, { useState } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { PillButton } from '../common/PillButton';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, Play, RotateCcw, Info, Building2, AlertTriangle, CheckCircle2, ListFilter, CreditCard } from 'lucide-react';
import { Transaction } from '../../types';
import { queryBankingDatabase, BANKING_DATABASE } from '../../data/bankingDatabase';

const PAYMENT_LABELS: Record<string, string> = {
  UPI:  'UPI — Phone / QR Pay',
  IMPS: 'IMPS — Instant Bank Transfer',
  NEFT: 'NEFT — Standard Bank Transfer',
  RTGS: 'RTGS — High Value (₹2L+)',
};

export const TransactionSimulator: React.FC = () => {
  const { simulationState, startTransactionAnalysis, resetSimulation } = useIntelligence();
  const tx = simulationState.activeTransaction;

  const [amount, setAmount]       = useState(tx.amount.toString());
  const [beneficiary, setBeneficiary] = useState(tx.beneficiaryName);
  const [account, setAccount]     = useState(tx.beneficiaryAccount);
  const [purpose, setPurpose]     = useState(tx.statedPurpose);
  const [paymentType, setPaymentType] = useState<Transaction['paymentType']>(tx.paymentType || 'RTGS');
  const [category, setCategory]   = useState<Transaction['category']>(tx.category || 'Personal');

  // Sync with scenario changes
  React.useEffect(() => {
    setAmount(simulationState.activeTransaction.amount.toString());
    setBeneficiary(simulationState.activeTransaction.beneficiaryName);
    setAccount(simulationState.activeTransaction.beneficiaryAccount);
    setPurpose(simulationState.activeTransaction.statedPurpose);
    setPaymentType(simulationState.activeTransaction.paymentType || 'RTGS');
    setCategory(simulationState.activeTransaction.category || 'Personal');
  }, [simulationState.activeTransaction]);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransactionAnalysis({
      amount: parseFloat(amount) || 0,
      beneficiaryName: beneficiary,
      beneficiaryAccount: account,
      statedPurpose: purpose,
      paymentType,
      category
    });
  };

  const handleAccountSelect = (selectedVal: string) => {
    setAccount(selectedVal);
    const matchedRecord = queryBankingDatabase(selectedVal);
    if (matchedRecord) {
      setBeneficiary(matchedRecord.legalKycName);
    }
  };

  const isAnalyzing = simulationState.isAnalyzing;
  const isComplete  = simulationState.isComplete;

  const statusLabel = isAnalyzing ? 'CHECKING NOW…' : isComplete ? 'CHECK COMPLETE' : 'READY';
  const statusTone  = isAnalyzing ? 'amber' : isComplete ? 'cyan' : 'slate';

  return (
    <HairlineCard className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-accent-cyan" />
            <h3 className="font-display text-xl font-bold text-ink">
              Safety Check Before You Send
            </h3>
          </div>
          <p className="font-sans text-sm text-ink-dim mt-1">
            Enter the transfer details below and we will check it for signs of fraud in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge label={statusLabel} tone={statusTone} pulse={isAnalyzing} size="sm" />
          <button
            onClick={resetSimulation}
            title="Reset"
            className="p-2 rounded-full border border-hairline text-ink-dim hover:text-ink hover:bg-hairline/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSimulate} className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-semibold text-ink">
              How much are you sending?
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-display text-base text-ink-dim font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isAnalyzing}
                className="w-full rounded-xl border border-hairline bg-paper-elevated pl-9 pr-4 py-3 font-display text-lg font-bold text-ink focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 disabled:opacity-50"
                placeholder="e.g. 18500"
                required
              />
            </div>
          </div>

          {/* Payment Type */}
          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-semibold text-ink">
              How are you sending it?
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as Transaction['paymentType'])}
              disabled={isAnalyzing}
              className="w-full rounded-xl border border-hairline bg-paper-elevated px-4 py-3 font-sans text-sm text-ink focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 disabled:opacity-50"
            >
              {Object.entries(PAYMENT_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Beneficiary Name & Bank Account ID Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Beneficiary Name */}
          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-semibold text-ink">
              Who are you sending to?
            </label>
            <input
              type="text"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              disabled={isAnalyzing}
              className="w-full rounded-xl border border-hairline bg-paper-elevated px-4 py-3 font-sans text-sm text-ink focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 disabled:opacity-50"
              placeholder="e.g. Arjun Sharma or Govt Escrow"
              required
            />
          </div>

          {/* Bank Account ID / UPI ID Dropdown List with Beneficiary Names */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-sans text-sm font-semibold text-ink">
                Bank Account ID / UPI ID
              </label>
              <span className="font-mono text-[10px] text-accent-cyan font-bold flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {BANKING_DATABASE.length} Accounts in Registry
              </span>
            </div>

            {/* Dropdown containing Beneficiary Names alongside Account Numbers and UPI IDs */}
            <select
              value={account}
              onChange={(e) => handleAccountSelect(e.target.value)}
              disabled={isAnalyzing}
              className="w-full rounded-xl border border-hairline bg-paper-elevated px-3.5 py-3 font-mono text-xs sm:text-sm text-ink focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 disabled:opacity-50 cursor-pointer"
            >
              <option value="" disabled>-- Select Beneficiary & Account from Database --</option>
              
              {/* Bank Account Numbers with Beneficiary Names */}
              <optgroup label="── Bank Account Numbers (with Beneficiary Name) ──">
                {BANKING_DATABASE.filter(r => !r.accountNumber.includes('@')).map((rec) => (
                  <option key={rec.accountNumber} value={rec.displayAccount}>
                    {rec.legalKycName} — {rec.displayAccount} ({rec.bankName})
                  </option>
                ))}
              </optgroup>

              {/* UPI Handles with Beneficiary Names */}
              <optgroup label="── UPI IDs / Handles (with Beneficiary Name) ──">
                {BANKING_DATABASE.filter(r => r.accountNumber.includes('@')).map((rec) => (
                  <option key={rec.accountNumber} value={rec.displayAccount}>
                    {rec.legalKycName} — {rec.displayAccount} ({rec.bankName})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Live Bank Database Cross-Check Preview */}
        {(() => {
          const liveRecord = queryBankingDatabase(account);
          if (!liveRecord) return null;

          const isMule = liveRecord.muleStatus.includes('Mule');
          const isMatch = liveRecord.legalKycName.toLowerCase().includes(beneficiary.toLowerCase().trim()) ||
                          (beneficiary.length > 3 && beneficiary.toLowerCase().trim().includes(liveRecord.legalKycName.toLowerCase().split(' ')[0]));

          return (
            <div className={`rounded-xl border p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-all ${
              isMule
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                : isMatch
                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
            }`}>
              <div className="flex items-start gap-2.5">
                <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">Inter-Bank Confirmation of Payee Registry:</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-black/20 text-ink">
                      {liveRecord.legalKycName}
                    </span>
                    <span className="font-mono text-[10px] text-ink-dim">
                      ({liveRecord.bankName} · {liveRecord.accountType})
                    </span>
                  </div>
                  <p className="font-mono text-[11px] opacity-80">
                    {liveRecord.notes}
                  </p>
                </div>
              </div>

              <span className="font-mono text-[10px] uppercase font-bold shrink-0 self-start sm:self-center px-2 py-1 rounded border border-current/20">
                {isMule ? '🚨 KNOWN MULE' : isMatch ? '✓ KYC MATCH' : '⚠️ NAME MISMATCH'}
              </span>
            </div>
          );
        })()}

        {/* Stated Purpose */}
        <div className="space-y-1.5">
          <label className="block font-sans text-sm font-semibold text-ink">
            What is this transfer for?
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            disabled={isAnalyzing}
            className="w-full rounded-xl border border-hairline bg-paper-elevated px-4 py-3 font-sans text-sm text-ink focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 disabled:opacity-50"
            placeholder="e.g. Design deliverables invoice or Clearance fee"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <PillButton
            variant="primary"
            size="lg"
            type="submit"
            disabled={isAnalyzing}
            icon={<Play className="h-4 w-4 fill-current" />}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? 'Analyzing Security Signals…' : 'Run Safety Check'}
          </PillButton>
        </div>
      </form>
    </HairlineCard>
  );
};
