import clsx from "clsx";
import { levelForScore } from "@/lib/risk/thresholds";
import { RISK_LEVEL_META } from "@/lib/risk/colors";

export function ScoreBar({
  label,
  score,
  invert = false,
  detail,
}: {
  label: string;
  score: number;
  /** true when a HIGHER score is GOOD (e.g. Decision Integrity, Transaction Legitimacy) */
  invert?: boolean;
  detail?: string;
}) {
  const effectiveLevel = invert ? levelForScore(100 - score) : levelForScore(score);
  const meta = RISK_LEVEL_META[effectiveLevel];
  const barColor = meta.text.replace("text-", "bg-");

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-cream-100/80">{label}</span>
        <span className={clsx("font-mono text-sm font-medium", meta.text)}>{Math.round(score)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden" role="img" aria-label={`${label}: ${Math.round(score)} percent, ${meta.label} risk`}>
        <div
          className={clsx("h-full rounded-full transition-[width] duration-700 ease-out", barColor)}
          style={{ width: `${Math.max(3, Math.round(score))}%` }}
        />
      </div>
      {detail && <p className="text-xs text-cream-100/45 mt-1.5 leading-relaxed">{detail}</p>}
    </div>
  );
}
