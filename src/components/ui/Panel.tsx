import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Panel({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("glass-panel rounded-2xl p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal-teal/80 mb-1.5">{eyebrow}</p>
        )}
        <h2 className="font-display text-lg font-medium text-cream-100">{title}</h2>
      </div>
      {action}
    </div>
  );
}
