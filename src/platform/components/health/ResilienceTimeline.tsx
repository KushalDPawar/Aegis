import React from 'react';
import { ResilienceCurve } from '../charts/ResilienceCurve';
import { CashflowStream } from '../charts/CashflowStream';
import { HairlineCard } from '../common/HairlineCard';
import { TrendingUp, ArrowDownRight, Layers } from 'lucide-react';

export const ResilienceTimeline: React.FC = () => {
  return (
    <HairlineCard className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-cyan" />
            <h3 className="font-display text-lg font-bold text-ink">
              Financial Resilience Timeline & Forward Trajectory
            </h3>
          </div>
          <p className="font-sans text-xs text-ink-dim">
            12-month audited trajectory combined with 6-month AI forward projection corridor.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-ink-dim">
          <span>MONTE CARLO PROJECTION: 10,000 PATHWAYS</span>
        </div>
      </div>

      {/* SVG Interactive Timeline Curve */}
      <ResilienceCurve />

      {/* Cashflow Stream Breakdown */}
      <div className="pt-2 border-t border-hairline">
        <CashflowStream />
      </div>
    </HairlineCard>
  );
};
