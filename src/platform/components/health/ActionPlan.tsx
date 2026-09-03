import React, { useState } from 'react';
import { HairlineCard } from '../common/HairlineCard';
import { PillButton } from '../common/PillButton';
import { StatusBadge } from '../common/StatusBadge';
import { Target, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HealthIntervention {
  id: string;
  category: string;
  title: string;
  adjustment: string;
  mechanism: string;
  estimatedImpact: string;
  executed: boolean;
}

export const ActionPlan: React.FC = () => {
  const [plans, setPlans] = useState<HealthIntervention[]>([
    {
      id: 'plan-1',
      category: 'DINING & DELIVERY',
      title: 'Cap weekly food delivery apps at ₹2,200',
      adjustment: 'Reduce monthly delivery spend by ₹6,400',
      mechanism: 'Set up an ambient budget alert that notifies you when weekly delivery crosses ₹2,200 without blocking purchases.',
      estimatedImpact: '+₹38,400 to buffer over 6 months',
      executed: false
    },
    {
      id: 'plan-2',
      category: 'DEBT RESTRUCTURE',
      title: 'Convert ₹32k revolving balance into 6-month EMI',
      adjustment: 'Cut APR from 42% to 13.5%',
      mechanism: 'One-tap pre-approved conversion. Reduces monthly servicing to ₹5,540 while saving ₹4,100 in compounding interest.',
      estimatedImpact: 'Eliminates debt trap within 180 days',
      executed: false
    },
    {
      id: 'plan-3',
      category: 'LIQUIDITY VAULT',
      title: 'Post-Salary ₹4,000 Micro-Sweep',
      adjustment: 'Automate transfer on the 1st of every month',
      mechanism: 'Sweeps ₹4,000 immediately upon payroll deposit into high-yield 7.1% liquid emergency vault before discretionary spend occurs.',
      estimatedImpact: 'Rebuilds 3.2-month buffer by Q1 2027',
      executed: false
    },
    {
      id: 'plan-4',
      category: 'OBLIGATION DEFENSE',
      title: 'Car Insurance Renewal Buffer (Due Nov 15)',
      adjustment: 'Reserve ₹14,500 over next 2 payroll cycles',
      mechanism: 'Prevents annual vehicle policy premium from causing emergency fund drawdown or credit card carryover.',
      estimatedImpact: 'Zero financial shock on renewal day',
      executed: false
    }
  ]);

  const togglePlan = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, executed: !p.executed } : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-accent-cyan" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Empathetic Action Plan & Micro-Interventions
            </h3>
            <p className="font-sans text-xs text-ink-dim">
              Realistic, non-judgmental micro-adjustments tailored to your lifestyle without restrictive austerity.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-ink-dim">
          {plans.filter(p => p.executed).length} of {plans.length} Activated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <HairlineCard
            key={plan.id}
            className={`flex flex-col justify-between transition-all ${
              plan.executed ? 'border-emerald-500/30 bg-emerald-500/5' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-ink-dim uppercase">
                  [{plan.category}]
                </span>
                {plan.executed && (
                  <StatusBadge label="ACTIVATED" tone="emerald" size="sm" />
                )}
              </div>

              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  {plan.title}
                </h4>
                <div className="font-mono text-xs text-accent-cyan mt-0.5">
                  {plan.adjustment}
                </div>
              </div>

              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                {plan.mechanism}
              </p>

              <div className="rounded border border-hairline bg-paper-elevated p-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                ★ Projected Return: {plan.estimatedImpact}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline flex justify-end">
              <PillButton
                variant={plan.executed ? 'outline' : 'primary'}
                size="sm"
                onClick={() => togglePlan(plan.id)}
                icon={plan.executed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <ArrowRight className="h-3.5 w-3.5" />}
              >
                {plan.executed ? 'Active in Sentinel Core' : 'Activate Micro-Intervention'}
              </PillButton>
            </div>
          </HairlineCard>
        ))}
      </div>
    </div>
  );
};
