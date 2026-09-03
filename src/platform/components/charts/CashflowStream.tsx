import React from 'react';
import { CURRENT_RESILIENCE_SUMMARY } from '../../data/mockHealthTimeline';
import { useIntelligence } from '../../context/IntelligenceContext';

export const CashflowStream: React.FC = () => {
  const { scenarioSliders } = useIntelligence();
  const base = CURRENT_RESILIENCE_SUMMARY;

  const adjustedIncome = base.monthlyIncome * (1 - scenarioSliders.incomeShock / 100);
  const adjustedDiscretionary = base.discretionaryExpenses * (1 - scenarioSliders.discretionaryReduction / 100);
  const essential = base.essentialExpenses;
  const debtExtra = scenarioSliders.debtPrepayment;
  const autoSweep = scenarioSliders.emergencyAutoSweep;

  const totalOutflows = essential + adjustedDiscretionary + debtExtra + autoSweep;
  const netSurplus = Math.max(0, adjustedIncome - totalOutflows);

  const essentialPct = Math.round((essential / adjustedIncome) * 100);
  const discretionaryPct = Math.round((adjustedDiscretionary / adjustedIncome) * 100);
  const bufferAllocationPct = Math.round(((debtExtra + autoSweep + netSurplus) / adjustedIncome) * 100);

  return (
    <div className="space-y-4">
      {/* Stream Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-ink-muted">MONTHLY CASHFLOW ALLOCATION</span>
          <span className="text-ink font-semibold">₹{Math.round(adjustedIncome).toLocaleString('en-IN')}/mo</span>
        </div>

        <div className="h-4 w-full rounded-full overflow-hidden flex bg-paper-elevated border border-hairline p-0.5">
          {/* Essential */}
          <div
            style={{ width: `${Math.min(100, essentialPct)}%` }}
            title={`Essential Expenses: ₹${essential.toLocaleString('en-IN')} (${essentialPct}%)`}
            className="h-full bg-slate-500 rounded-l-full transition-all duration-300"
          />
          {/* Discretionary */}
          <div
            style={{ width: `${Math.min(100 - essentialPct, discretionaryPct)}%` }}
            title={`Discretionary Spending: ₹${Math.round(adjustedDiscretionary).toLocaleString('en-IN')} (${discretionaryPct}%)`}
            className={`h-full transition-all duration-300 ${discretionaryPct > 35 ? 'bg-amber-500' : 'bg-cyan-500'}`}
          />
          {/* Net Buffer / Surplus */}
          <div
            style={{ width: `${Math.max(0, 100 - essentialPct - discretionaryPct)}%` }}
            title={`Surplus / Buffer: ₹${Math.round(netSurplus + autoSweep).toLocaleString('en-IN')}`}
            className="h-full bg-emerald-500 rounded-r-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Allocation Legend Chips */}
      <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
        <div className="rounded border border-hairline bg-paper-elevated p-2">
          <div className="flex items-center gap-1.5 text-ink-dim mb-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Essential (Fixed)</span>
          </div>
          <div className="font-display text-base font-bold text-ink">
            ₹{essential.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-ink-dim">{essentialPct}% of net income</div>
        </div>

        <div className="rounded border border-hairline bg-paper-elevated p-2">
          <div className="flex items-center gap-1.5 text-ink-dim mb-1">
            <span className={`h-2 w-2 rounded-full ${discretionaryPct > 35 ? 'bg-amber-500' : 'bg-cyan-500'}`} />
            <span>Discretionary</span>
          </div>
          <div className="font-display text-base font-bold text-ink">
            ₹{Math.round(adjustedDiscretionary).toLocaleString('en-IN')}
          </div>
          <div className={`text-[10px] ${discretionaryPct > 35 ? 'text-amber-500' : 'text-ink-dim'}`}>
            {discretionaryPct}% {discretionaryPct > 35 && '(Elevated)'}
          </div>
        </div>

        <div className="rounded border border-hairline bg-paper-elevated p-2">
          <div className="flex items-center gap-1.5 text-ink-dim mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Buffer / Resilience</span>
          </div>
          <div className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
            ₹{Math.round(netSurplus + autoSweep).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
            {bufferAllocationPct}% retained
          </div>
        </div>
      </div>
    </div>
  );
};
