import React, { useState } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldAlert, AlertTriangle, TrendingDown, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const ActiveIntelligence: React.FC = () => {
  const { activeSignals, setActiveTab } = useIntelligence();
  const [filter, setFilter] = useState<'all' | 'fraud' | 'health'>('all');

  const filteredSignals = activeSignals.filter((sig) => {
    if (filter === 'all') return true;
    return sig.domain === filter;
  });

  const getSignalIcon = (domain: string, level: string) => {
    if (domain === 'fraud') {
      return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    }
    if (level === 'warning') {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    return <Activity className="h-4 w-4 text-accent-cyan" />;
  };

  const getSignalTone = (level: string) => {
    if (level === 'alert') return 'rose' as const;
    if (level === 'warning') return 'amber' as const;
    return 'cyan' as const;
  };

  return (
    <HairlineCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-accent-cyan animate-ping" />
          <h3 className="font-display text-base font-bold text-ink">
            Active Intelligence Stream
          </h3>
          <span className="font-mono text-xs text-ink-dim">
            ({filteredSignals.length} Active Nodes)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-lg border border-hairline bg-paper-elevated p-0.5 text-xs font-mono">
          {(['all', 'fraud', 'health'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-2.5 py-1 uppercase transition-all ${
                filter === f
                  ? 'bg-ink text-paper-bottom font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-hairline/60">
        {filteredSignals.map((signal) => {
          const tone = getSignalTone(signal.level);
          return (
            <div
              key={signal.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 transition-colors hover:bg-hairline/10 rounded-lg px-2 -mx-2 cursor-pointer"
              onClick={() => {
                if (signal.domain === 'fraud') setActiveTab('fraud');
                else if (signal.domain === 'health') setActiveTab('health');
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline bg-paper-elevated">
                  {getSignalIcon(signal.domain, signal.level)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans text-sm font-semibold text-ink group-hover:text-accent-cyan transition-colors">
                      {signal.title}
                    </span>
                    <StatusBadge
                      label={signal.domain.toUpperCase()}
                      tone={tone}
                      size="sm"
                    />
                    {signal.metricDelta && (
                      <span className="font-mono text-[11px] font-medium text-ink-dim">
                        {signal.metricDelta}
                      </span>
                    )}
                  </div>

                  <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-2xl">
                    {signal.summary}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0">
                <span className="font-mono text-[11px] text-ink-dim">
                  {signal.timestamp}
                </span>
                <ChevronRight className="h-4 w-4 text-ink-dim group-hover:text-ink group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </HairlineCard>
  );
};
