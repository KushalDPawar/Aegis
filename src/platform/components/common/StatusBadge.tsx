import React from 'react';

export type BadgeTone = 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'slate',
  pulse = false,
  className = '',
  size = 'md'
}) => {
  const toneClasses: Record<BadgeTone, { bg: string; text: string; dot: string; border: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-500/25'
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-500/25'
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-500/25'
    },
    cyan: {
      bg: 'bg-sky-500/10 dark:bg-cyan-500/15',
      text: 'text-sky-700 dark:text-cyan-300',
      dot: 'bg-cyan-400',
      border: 'border-cyan-500/25'
    },
    slate: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-500/25'
    }
  };

  const selected = toneClasses[tone];
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide uppercase ${selected.bg} ${selected.text} ${selected.border} ${sizeStyles} ${className}`}
    >
      {pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${selected.dot}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${selected.dot}`} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${selected.dot}`} />
      )}
      <span>{label}</span>
    </span>
  );
};
