import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { PillButton } from '../common/PillButton';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, ShieldAlert, Sparkles, ArrowRight, Clock } from 'lucide-react';

export const ActionMatrix: React.FC = () => {
  const { actions, markActionComplete, setActiveTab } = useIntelligence();

  const handleActionClick = (actionId: string, category: string) => {
    markActionComplete(actionId);
    if (category === 'fraud_safeguard') {
      setActiveTab('fraud');
    } else if (category === 'distress_prevention' || category === 'liquidity_buffer' || category === 'debt_optimization') {
      setActiveTab('health');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            Today&apos;s AI Action Protocol
          </h2>
          <p className="font-sans text-xs text-ink-dim">
            Prioritized high-impact financial and security actions to protect capital and stabilize runway today.
          </p>
        </div>
        <span className="font-mono text-xs text-ink-dim">
          {actions.filter((a) => a.completed).length} of {actions.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => {
          const isCritical = action.urgency === 'critical';
          const isElevated = action.urgency === 'elevated';

          return (
            <HairlineCard
              key={action.id}
              className={`flex flex-col justify-between transition-all ${
                action.completed ? 'opacity-50 bg-paper-elevated/40' : ''
              } ${isCritical && !action.completed ? 'border-rose-500/40 shadow-[0_0_20px_-4px_rgba(244,63,94,0.15)]' : ''}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    label={action.category.replace('_', ' ').toUpperCase()}
                    tone={
                      isCritical
                        ? 'rose'
                        : isElevated
                        ? 'amber'
                        : 'cyan'
                    }
                    size="sm"
                    pulse={isCritical && !action.completed}
                  />

                  {action.completed ? (
                    <span className="flex items-center gap-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      EXECUTED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-ink-dim">
                      <Clock className="h-3 w-3" />
                      ACTION REQUIRED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    {action.title}
                  </h3>
                  <div className="mt-1 font-mono text-xs text-accent-cyan font-medium">
                    {action.impactSummary}
                  </div>
                </div>

                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  {action.detailExplanation}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-ink-dim truncate max-w-[200px]">
                  {action.recommendedAction}
                </span>

                <PillButton
                  variant={isCritical ? 'danger' : 'secondary'}
                  size="sm"
                  disabled={action.completed}
                  onClick={() => handleActionClick(action.id, action.category)}
                  icon={action.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                >
                  {action.completed ? 'Completed' : action.actionButtonLabel}
                </PillButton>
              </div>
            </HairlineCard>
          );
        })}
      </div>
    </div>
  );
};
