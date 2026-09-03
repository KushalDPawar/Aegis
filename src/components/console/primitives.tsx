import type { GuardAction, RiskLevelName } from "@/lib/risk/types";
import { RISK_LEVEL_META } from "@/lib/risk/colors";
import { formatINR } from "@/lib/format";

/**
 * Console-wide presentational primitives.
 *
 * Every status colour resolves through `lib/risk/colors`, so a CRITICAL in the
 * console is the same colour a customer sees on their own payment. Divergent
 * palettes between the operator view and the customer view would be a genuine
 * hazard, not just an inconsistency.
 */

export function Panel({
  title,
  eyebrow,
  action,
  className = "",
  children,
}: {
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`glass-panel rounded-2xl ${className}`}>
      {(title || eyebrow || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
          <div>
            {eyebrow && (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal-teal/70">{eyebrow}</p>
            )}
            {title && <h2 className="font-display text-base font-medium text-cream-100 mt-1">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className={title || eyebrow || action ? "px-5 pb-5" : "p-5"}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-signal-jade"
      : tone === "warn"
        ? "text-signal-amber"
        : tone === "bad"
          ? "text-signal-coral"
          : "text-cream-100";
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40">{label}</p>
      <p className={`value-in font-display text-3xl font-semibold mt-2 tabular-nums ${toneClass}`}>{value}</p>
      {sub && <p className="text-xs text-cream-100/45 mt-1.5">{sub}</p>}
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskLevelName | null }) {
  if (!level) {
    return (
      <span className="inline-flex items-center rounded-full border border-white/12 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/40">
        Not scored
      </span>
    );
  }
  const meta = RISK_LEVEL_META[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${meta.text} ${meta.border} ${meta.bg}`}
    >
      <span aria-hidden="true">{meta.symbol}</span>
      {meta.label}
    </span>
  );
}

/** Maps a persisted transaction status to the console's plain-language state. */
const STATUS_META: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Pending", tone: "text-cream-100/60 border-white/15" },
  ALLOWED: { label: "Verified", tone: "text-signal-jade border-signal-jade/40 bg-signal-jade/10" },
  COMPLETED: { label: "Completed", tone: "text-signal-jade border-signal-jade/40 bg-signal-jade/10" },
  VERIFY_REQUIRED: { label: "Friction applied", tone: "text-signal-cyan border-signal-cyan/40 bg-signal-cyan/10" },
  WARNED: { label: "Friction applied", tone: "text-signal-amber border-signal-amber/40 bg-signal-amber/10" },
  COOLING_PERIOD: { label: "Cooling period", tone: "text-signal-coral border-signal-coral/40 bg-signal-coral/10" },
  PAUSED: { label: "Intervention", tone: "text-signal-crimson border-signal-crimson/40 bg-signal-crimson/10" },
  ESCALATED: { label: "Escalated", tone: "text-signal-crimson border-signal-crimson/40 bg-signal-crimson/10" },
  CANCELLED: { label: "Blocked", tone: "text-cream-100/50 border-white/15" },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: "text-cream-100/60 border-white/15" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

const ACTION_TONE: Record<GuardAction, string> = {
  ALLOW: "text-signal-jade border-signal-jade/40",
  VERIFY: "text-signal-cyan border-signal-cyan/40",
  WARN: "text-signal-amber border-signal-amber/40",
  COOLING_PERIOD: "text-signal-coral border-signal-coral/40",
  PAUSE: "text-signal-crimson border-signal-crimson/40",
};

export function ActionBadge({ action }: { action: GuardAction }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${ACTION_TONE[action]}`}>
      {action.replace("_", " ")}
    </span>
  );
}

/**
 * Decision Integrity dial.
 *
 * `decisionIntegrity` runs the opposite way to every other score in the
 * engine: it is `100 - decisionIntegrityRisk`, so higher is *healthier*, while
 * `decisionIntegrityLabel` describes the underlying RISK. Printing that label
 * raw under the number reads as "57 — MODERATE integrity" when it actually
 * means "moderate risk", so the label is always rendered with the word RISK
 * attached. The band thresholds below are the engine's own, inverted.
 */
export function IntegrityGauge({ value, riskLabel }: { value: number; riskLabel?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 62;
  const circumference = Math.PI * radius; // half turn
  const offset = circumference * (1 - clamped / 100);
  // Mirrors levelForScore on the inverted axis: risk <30 => integrity >70.
  const tone = clamped > 70 ? "#4ade80" : clamped > 45 ? "#f5b942" : "#f2685b";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 92" className="w-full max-w-[220px]" role="img" aria-label={`Decision integrity ${clamped} out of 100`}>
        <path
          d="M 18 82 A 62 62 0 0 1 142 82"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 18 82 A 62 62 0 0 1 142 82"
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1), stroke .6s ease" }}
        />
        <text x="80" y="72" textAnchor="middle" className="fill-cream-100 font-display" style={{ fontSize: 30, fontWeight: 600 }}>
          {clamped}
        </text>
      </svg>
      {riskLabel && (
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/45 -mt-1">
          {riskLabel.replace(/_/g, " ")} decision risk
        </p>
      )}
    </div>
  );
}

/** Horizontal contribution bar used across the risk breakdowns. */
export function AxisBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = pct >= 70 ? "bg-signal-coral" : pct >= 40 ? "bg-signal-amber" : "bg-signal-teal";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/50">{label}</span>
        <span className="font-mono text-xs text-cream-100/70 tabular-nums">{Math.round(value)}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${pct}%`, transition: "width 0.9s cubic-bezier(.2,.8,.2,1)" }}
        />
      </div>
    </div>
  );
}

export function Money({ value }: { value: number }) {
  return <span className="tabular-nums">{formatINR(value)}</span>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 px-5 py-10 text-center">
      <p className="text-sm text-cream-100/60">{title}</p>
      {hint && <p className="text-xs text-cream-100/35 mt-1.5">{hint}</p>}
    </div>
  );
}


/**
 * Estate risk posture.
 *
 * Sits directly beneath the integrity gauge because the gauge alone cannot
 * answer "is anything wrong right now". A mean can look comfortable while
 * severe cases are open, so this states the tail explicitly and takes its
 * colour from the worst outstanding level rather than from the average.
 */
export function PostureStrip({
  worstLevel,
  elevated,
  compromisedDecisions,
  total,
}: {
  worstLevel: RiskLevelName | null;
  elevated: number;
  compromisedDecisions: number;
  total: number;
}) {
  if (total === 0) {
    return (
      <p className="mt-4 rounded-xl border border-white/10 px-3.5 py-3 text-xs text-cream-100/45">
        Nothing scored yet.
      </p>
    );
  }

  const clear = elevated === 0;
  const meta = worstLevel ? RISK_LEVEL_META[worstLevel] : null;

  return (
    <div
      className={`mt-4 rounded-xl border px-3.5 py-3 ${
        clear ? "border-signal-jade/30 bg-signal-jade/[0.06]" : `${meta?.border ?? "border-white/10"} ${meta?.bg ?? ""}`
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/45">Estate posture</span>
        {worstLevel && <RiskBadge level={worstLevel} />}
      </div>
      <p className={`text-xs mt-2 leading-relaxed ${clear ? "text-signal-jade" : meta?.text ?? "text-cream-100/70"}`}>
        {clear
          ? `No payment scored above moderate across ${total} assessment${total === 1 ? "" : "s"}.`
          : `${elevated} of ${total} payment${total === 1 ? "" : "s"} scored HIGH or worse.`}
      </p>
      {compromisedDecisions > 0 && (
        <p className="text-xs text-cream-100/55 mt-1.5 leading-relaxed">
          {compromisedDecisions} showed signs of a compromised decision, not just an unusual transaction.
        </p>
      )}
    </div>
  );
}
