import React from 'react';
import { CURRENT_RESILIENCE_SUMMARY } from '../../data/mockHealthTimeline';
import { HairlineCard } from '../common/HairlineCard';
import { TelemetryMetric } from '../common/TelemetryMetric';
import { useIntelligence } from '../../context/IntelligenceContext';
import { TrendingDown, ShieldCheck, AlertCircle, Zap, ArrowRight } from 'lucide-react';

export const ResilienceOverview: React.FC = () => {
  const { setActiveTab } = useIntelligence();
  const summary = CURRENT_RESILIENCE_SUMMARY;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            Financial Health & Resilience Matrix
          </h2>
          <p className="font-sans text-xs text-ink-dim">
            Multi-dimensional risk telemetry synthesized from banking behavior, runway velocity, and obligations.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('health')}
          className="group flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-cyan hover:underline"
        >
          <span>DEEP HEALTH NAVIGATOR</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Financial Resilience */}
        <HairlineCard className="flex flex-col justify-between">
          <div>
            <TelemetryMetric
              label="Financial Resilience"
              value={`${summary.resilienceScore}/100`}
              tag={summary.rating}
              delta={{
                text: `${summary.scoreChange3M}% 3M`,
                isPositive: false
              }}
              subtext="Composite multi-vector score evaluating liquidity, spending elasticity, and shock buffers."
            />
          </div>
          
          {/* Visual Resilience Progress Bar */}
          <div className="mt-4 pt-3 border-t border-hairline">
            <div className="flex justify-between font-mono text-[10px] text-ink-dim mb-1">
              <span>CRITICAL (0)</span>
              <span className="text-amber-500 font-bold">{summary.resilienceScore}</span>
              <span>ROBUST (100)</span>
            </div>
            <div className="h-1.5 w-full bg-paper-elevated rounded-full overflow-hidden border border-hairline">
              <div
                style={{ width: `${summary.resilienceScore}%` }}
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </HairlineCard>

        {/* Pillar 2: Spending Velocity */}
        <HairlineCard className="flex flex-col justify-between">
          <div>
            <TelemetryMetric
              label="Spending Velocity"
              value="₹1,54,000"
              tag="93.3% BURN"
              delta={{
                text: "+28% Discretionary",
                isPositive: false
              }}
              subtext="Essential (₹93k) + Discretionary (₹61k). Burn rate is consuming 93% of current monthly net income."
            />
          </div>

          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between font-mono text-[10px] text-ink-dim">
            <span>DISCRETIONARY EXPANSION</span>
            <span className="text-amber-500 font-medium">HIGH VELOCITY</span>
          </div>
        </HairlineCard>

        {/* Pillar 3: Savings Buffer Runway */}
        <HairlineCard className="flex flex-col justify-between">
          <div>
            <TelemetryMetric
              label="Liquid Buffer Runway"
              value={`${summary.bufferRunwayMonths} Mo`}
              tag="₹1.45L LIQUID"
              delta={{
                text: "Down from 4.8 Mo",
                isPositive: false
              }}
              subtext="Months of essential obligations your cash reserves can absorb in the event of total income stoppage."
            />
          </div>

          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between font-mono text-[10px] text-ink-dim">
            <span>RECOMMENDED BASELINE</span>
            <span className="text-ink font-semibold">6.0 MONTHS</span>
          </div>
        </HairlineCard>

        {/* Pillar 4: Debt Exposure & Servicing */}
        <HairlineCard className="flex flex-col justify-between">
          <div>
            <TelemetryMetric
              label="Debt Servicing Burden"
              value={`${summary.debtToIncomeRatio}%`}
              tag="₹32,000 / MO"
              delta={{
                text: "+6.2% DTI",
                isPositive: false
              }}
              subtext="Revolving credit card interest rollover compounding at 42% APR. Minimum due paid for 3 consecutive cycles."
            />
          </div>

          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between font-mono text-[10px] text-ink-dim">
            <span>FINANCE CHARGE DRAG</span>
            <span className="text-rose-500 font-medium">₹3,400 / MO</span>
          </div>
        </HairlineCard>
      </div>
    </div>
  );
};
