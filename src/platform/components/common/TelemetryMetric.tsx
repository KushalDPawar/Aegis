import React from 'react';

interface TelemetryMetricProps {
  label: string;
  value: string | number;
  delta?: {
    text: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  subtext?: string;
  tag?: string;
  className?: string;
}

export const TelemetryMetric: React.FC<TelemetryMetricProps> = ({
  label,
  value,
  delta,
  subtext,
  tag,
  className = ''
}) => {
  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[11px] font-medium tracking-wider text-ink-dim uppercase">
          {label}
        </span>
        {tag && (
          <span className="font-mono text-[10px] text-ink-dim px-1.5 py-0.5 rounded bg-hairline/30">
            {tag}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2.5 my-1">
        <span className="font-display text-3xl font-bold tracking-tight text-ink">
          {value}
        </span>
        {delta && (
          <span
            className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded ${
              delta.isNeutral
                ? 'text-ink-muted bg-hairline/30'
                : delta.isPositive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
            }`}
          >
            {delta.text}
          </span>
        )}
      </div>

      {subtext && (
        <p className="font-sans text-xs text-ink-muted mt-1 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
