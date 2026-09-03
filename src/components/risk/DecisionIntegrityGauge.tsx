import { levelForScore } from "@/lib/risk/thresholds";
import { RISK_LEVEL_META } from "@/lib/risk/colors";

/** Circular gauge for Decision Integrity — higher = healthier. */
export function DecisionIntegrityGauge({ integrity }: { integrity: number }) {
  const riskEquivalent = 100 - integrity;
  const level = levelForScore(riskEquivalent);
  const meta = RISK_LEVEL_META[level];
  const strokeColor = meta.text.includes("jade")
    ? "#4ade80"
    : meta.text.includes("cyan")
      ? "#67e8f9"
      : meta.text.includes("amber")
        ? "#f5b942"
        : meta.text.includes("coral")
          ? "#f2685b"
          : "#e2394d";

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - integrity / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
          <circle cx="90" cy="90" r={radius} stroke="rgba(255,255,255,0.07)" strokeWidth="14" fill="none" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={strokeColor}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1), stroke 400ms" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold text-cream-100">{Math.round(integrity)}</span>
          <span className="text-[11px] text-cream-100/50 font-mono uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em]" style={{ color: strokeColor }}>
        Decision Integrity: {meta.label === "Low" ? "Healthy" : meta.label}
      </p>
    </div>
  );
}
