import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { CheckCircle2, AlertTriangle, ScanSearch, Loader2, Circle } from 'lucide-react';

export const ProgressiveAnalysis: React.FC = () => {
  const { simulationState } = useIntelligence();
  const { stages, currentStageIndex, isAnalyzing, isComplete } = simulationState;

  const doneCount = stages.filter(s => s.status === 'completed' || s.status === 'flagged').length;

  return (
    <HairlineCard className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ScanSearch className="h-5 w-5 text-accent-cyan" />
            <h3 className="font-display text-xl font-bold text-ink">
              {isAnalyzing ? 'Running Your Safety Check…' : isComplete ? 'Safety Check Complete' : 'Safety Check'}
            </h3>
          </div>
          <p className="font-sans text-sm text-ink-dim mt-1">
            We run 5 checks to look for signs of fraud.
          </p>
        </div>

        {(isAnalyzing || isComplete) && (
          <span className="font-mono text-xs text-ink-dim bg-paper-elevated border border-hairline rounded-lg px-3 py-1.5">
            {doneCount} / {stages.length} checks done
          </span>
        )}
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isCurrent   = isAnalyzing && currentStageIndex === idx;
          const isCompleted = stage.status === 'completed';
          const isFlagged   = stage.status === 'flagged';
          const isPending   = stage.status === 'pending';

          return (
            <div
              key={stage.id}
              className={`
                rounded-xl border p-4 transition-all duration-300
                ${isFlagged
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : isCurrent
                  ? 'border-accent-cyan/50 bg-accent-cyan/5 shadow-[0_0_20px_-5px_rgba(0,210,255,0.15)]'
                  : isCompleted
                  ? 'border-emerald-500/25 bg-emerald-500/5'
                  : 'border-hairline/50 bg-paper-elevated/30 opacity-50'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Icon + Text */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isFlagged ? (
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-accent-cyan animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-ink-dim/40" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className={`font-display text-sm font-semibold ${
                      isFlagged ? 'text-rose-500'
                      : isCompleted ? 'text-emerald-600 dark:text-emerald-400'
                      : isCurrent ? 'text-ink'
                      : 'text-ink-dim'
                    }`}>
                      {stage.step}. {stage.title}
                    </p>
                    <p className="font-sans text-xs text-ink-dim leading-relaxed">
                      {stage.subtitle}
                    </p>
                    {(isCurrent || isCompleted || isFlagged) && (
                      <p className="font-sans text-xs text-ink-muted/80 leading-relaxed pt-0.5">
                        {stage.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Telemetry result chip */}
                {(isCompleted || isFlagged || isCurrent) && (
                  <div className="shrink-0">
                    <span className={`inline-block font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                      isFlagged
                        ? 'bg-rose-500/15 text-rose-500'
                        : isCompleted
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-accent-cyan/15 text-accent-cyan'
                    }`}>
                      {stage.telemetryValue}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar while active */}
              {isCurrent && (
                <div className="mt-3 h-1 w-full bg-paper-surface rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan rounded-full w-2/3 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </HairlineCard>
  );
};
