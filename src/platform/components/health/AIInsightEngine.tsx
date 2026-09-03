import React from 'react';
import { HairlineCard } from '../common/HairlineCard';
import { StatusBadge } from '../common/StatusBadge';
import { Brain, AlertCircle, TrendingDown, HelpCircle, ArrowRight } from 'lucide-react';

export const AIInsightEngine: React.FC = () => {
  const insights = [
    {
      id: 'ins-1',
      title: 'Your savings buffer has decreased by 18% over the last three months.',
      whatIsChanging:
        'Liquid reserves fell from ₹2,25,000 to ₹1,45,000. Inflows (salary) remained constant at ₹1,65,000, but outflows climbed due to festive dining, travel, and gadget purchases.',
      whyItMatters:
        'Your shock absorption capacity has compressed from 4.8 months of essential buffer down to 1.56 months. You are moving closer to living paycheck-to-paycheck.',
      whatCouldHappenNext:
        'At your current drawdown rate of ₹26,600/month, your liquid reserves will fall below ₹50,000 by mid-December, leaving zero safety margin for emergency medical or domestic contingencies.',
      tone: 'amber' as const
    },
    {
      id: 'ins-2',
      title: 'Essential obligations are consuming a growing percentage of your net income.',
      whatIsChanging:
        'Fixed non-negotiable outflows (rent, car loan EMI, utility bills, school fees) increased from 49% of income in October to 56.4% this month due to utility tariff revisions and loan rate resets.',
      whyItMatters:
        'When fixed expenses expand, financial elasticity shrinks. Small discretionary variances quickly push cashflow into negative territory.',
      whatCouldHappenNext:
        'Any unexpected 10% income reduction would force you to either liquidate investments at a penalty or carry balance on high-interest revolving credit cards.',
      tone: 'slate' as const
    },
    {
      id: 'ins-3',
      title: 'Compounding 42% APR revolving credit is silently accelerating.',
      whatIsChanging:
        'You have rolled over ₹32,000 on your credit card for 3 consecutive statement cycles, paying only the minimum due amount of ₹2,100.',
      whyItMatters:
        'Banks charge 3.5% per month (42% per annum) plus GST on revolving balances. You have already accumulated ₹3,400 in finance charges this quarter with zero reduction in principal.',
      whatCouldHappenNext:
        'Revolving finance charges will expand to ₹18,400 over the next 12 months if unaddressed, creating an invisible debt drag.',
      tone: 'rose' as const
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-accent-cyan" />
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            AI Contextual Diagnostic Engine
          </h3>
          <p className="font-sans text-xs text-ink-dim">
            Transparent narrative reasoning: what is changing, why it matters, and projected ramifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <HairlineCard key={insight.id} className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <StatusBadge
                  label={insight.tone === 'rose' ? 'CRITICAL DRAG' : insight.tone === 'amber' ? 'VULNERABILITY' : 'OBSERVATION'}
                  tone={insight.tone}
                  size="sm"
                />
              </div>

              <h4 className="font-display text-sm font-bold text-ink leading-snug">
                {insight.title}
              </h4>

              <div className="space-y-2 text-xs font-sans">
                <div className="rounded-md bg-paper-elevated p-2.5 border border-hairline">
                  <span className="font-mono text-[10px] font-semibold text-accent-cyan uppercase block mb-1">
                    What is Changing:
                  </span>
                  <p className="text-ink-muted leading-relaxed">
                    {insight.whatIsChanging}
                  </p>
                </div>

                <div className="rounded-md bg-paper-elevated p-2.5 border border-hairline">
                  <span className="font-mono text-[10px] font-semibold text-amber-500 uppercase block mb-1">
                    Why It Matters:
                  </span>
                  <p className="text-ink-muted leading-relaxed">
                    {insight.whyItMatters}
                  </p>
                </div>

                <div className="rounded-md bg-paper-elevated p-2.5 border border-hairline">
                  <span className="font-mono text-[10px] font-semibold text-rose-500 uppercase block mb-1">
                    What Could Happen Next:
                  </span>
                  <p className="text-ink-muted leading-relaxed">
                    {insight.whatCouldHappenNext}
                  </p>
                </div>
              </div>
            </div>
          </HairlineCard>
        ))}
      </div>
    </div>
  );
};
