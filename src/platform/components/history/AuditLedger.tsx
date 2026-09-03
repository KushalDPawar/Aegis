import React, { useState } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { StatusBadge } from '../common/StatusBadge';
import { PillButton } from '../common/PillButton';
import { Transaction } from '../../types';
import { AuditDetailModal } from './AuditDetailModal';
import { Search, Download, Filter, ShieldCheck, AlertTriangle, Clock, Eye, FileText } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const { transactions } = useIntelligence();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'cleared' | 'cooling_off'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showExportNotice, setShowExportNotice] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.statedPurpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'flagged'
        ? tx.status === 'flagged' || tx.status === 'intercepted'
        : tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sentinel-audit-dossier-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setShowExportNotice(true);
    setTimeout(() => setShowExportNotice(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            Immutable Audit Ledger & Forensic History
          </h2>
          <p className="font-sans text-xs text-ink-dim">
            Auditable trail of all transactions evaluated by Sentinel, intercepted threats, and context interviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showExportNotice && (
            <span className="font-mono text-xs text-emerald-500 animate-fade-up">
              ✓ Dossier Exported
            </span>
          )}
          <PillButton
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={<Download className="h-3.5 w-3.5" />}
          >
            Export Compliance Dossier
          </PillButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by beneficiary, purpose, or TX ID..."
            className="w-full rounded-lg border border-hairline bg-paper-elevated pl-9 pr-3 py-1.5 font-sans text-xs text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-ink-dim text-[11px] hidden sm:inline">STATUS:</span>
          {(['all', 'flagged', 'cleared', 'cooling_off'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 uppercase transition-all ${
                statusFilter === st
                  ? 'bg-ink text-paper-bottom font-semibold'
                  : 'border border-hairline bg-paper-elevated text-ink-muted hover:text-ink'
              }`}
            >
              {st === 'cooling_off' ? 'HOLD' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <HairlineCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="border-b border-hairline bg-paper-elevated font-mono text-[10px] text-ink-dim uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp / TX ID</th>
                <th className="px-4 py-3">Beneficiary Entity</th>
                <th className="px-4 py-3">Amount & Rail</th>
                <th className="px-4 py-3">Stated Purpose</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Forensic Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredTransactions.map((tx) => {
                const isFlagged = tx.status === 'flagged' || tx.status === 'intercepted';
                const isCooling = tx.status === 'cooling_off';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-hairline/10 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                      <div className="font-semibold text-ink">{tx.timestamp}</div>
                      <div className="text-[10px] text-ink-dim">{tx.id}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink group-hover:text-accent-cyan transition-colors">
                        {tx.beneficiaryName}
                      </div>
                      <div className="font-mono text-[10px] text-ink-dim">
                        {tx.beneficiaryAccount}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-display font-bold text-ink">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="font-mono text-[10px] text-ink-dim">
                        {tx.paymentType} · {tx.category}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs truncate text-ink-muted" title={tx.statedPurpose}>
                      {tx.statedPurpose}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                            tx.riskScore > 75
                              ? 'bg-rose-500/15 text-rose-500'
                              : tx.riskScore > 40
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-emerald-500/15 text-emerald-500'
                          }`}
                        >
                          {tx.riskScore}/100
                        </span>
                        <span className="font-mono text-[10px] text-ink-dim uppercase">
                          {tx.riskTier}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        label={tx.status.toUpperCase()}
                        tone={
                          tx.status === 'cleared'
                            ? 'emerald'
                            : tx.status === 'cooling_off'
                            ? 'amber'
                            : 'rose'
                        }
                        size="sm"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="p-1.5 rounded-full hover:bg-hairline/20 text-ink-dim hover:text-ink transition-colors"
                        title="View Full Transcript"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </HairlineCard>

      {/* Forensic Modal */}
      <AuditDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
