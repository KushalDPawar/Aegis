import clsx from "clsx";
import type { RiskLevelName } from "@/lib/risk/types";
import { RISK_LEVEL_META } from "@/lib/risk/colors";

export function RiskLevelBadge({ level, size = "md" }: { level: RiskLevelName; size?: "sm" | "md" | "lg" }) {
  const meta = RISK_LEVEL_META[level];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wide",
        meta.text,
        meta.bg,
        meta.border,
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        size === "lg" && "text-sm px-3.5 py-1.5"
      )}
    >
      <span aria-hidden="true">{meta.symbol}</span>
      {meta.label}
    </span>
  );
}

export function ConfidenceTag({ confidence }: { confidence: string }) {
  const styles: Record<string, string> = {
    DETECTED: "text-signal-cyan bg-signal-cyan/10 border-signal-cyan/30",
    INFERRED: "text-signal-amber bg-signal-amber/10 border-signal-amber/30",
    SIMULATED: "text-cream-100/60 bg-white/5 border-white/15",
    CONFIRMED: "text-signal-teal bg-signal-teal/10 border-signal-teal/30",
  };
  const className = styles[confidence] ?? "text-cream-100/60 bg-white/5 border-white/15";
  return (
    <span className={clsx("font-mono text-[10px] uppercase tracking-wider rounded border px-1.5 py-0.5", className)}>
      {confidence}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "text-cream-100/70 bg-white/5 border-white/15" },
    ALLOWED: { label: "Allowed", className: "text-signal-jade bg-signal-jade/10 border-signal-jade/30" },
    VERIFY_REQUIRED: { label: "Verification Required", className: "text-signal-cyan bg-signal-cyan/10 border-signal-cyan/30" },
    WARNED: { label: "Warned", className: "text-signal-amber bg-signal-amber/10 border-signal-amber/30" },
    COOLING_PERIOD: { label: "Cooling Period", className: "text-signal-coral bg-signal-coral/10 border-signal-coral/30" },
    PAUSED: { label: "Paused", className: "text-signal-crimson bg-signal-crimson/10 border-signal-crimson/30" },
    ESCALATED: { label: "Escalated", className: "text-signal-crimson bg-signal-crimson/10 border-signal-crimson/30" },
    COMPLETED: { label: "Completed", className: "text-signal-jade bg-signal-jade/10 border-signal-jade/30" },
    CANCELLED: { label: "Cancelled", className: "text-cream-100/50 bg-white/5 border-white/15" },
    ACTIVE: { label: "Active", className: "text-signal-crimson bg-signal-crimson/10 border-signal-crimson/30" },
    CONTAINED: { label: "Contained", className: "text-signal-cyan bg-signal-cyan/10 border-signal-cyan/30" },
    RESOLVED: { label: "Resolved", className: "text-signal-jade bg-signal-jade/10 border-signal-jade/30" },
  };
  const meta = map[status] ?? { label: status, className: "text-cream-100/70 bg-white/5 border-white/15" };
  return (
    <span className={clsx("inline-flex items-center rounded-full border font-mono text-xs px-2.5 py-1 uppercase tracking-wide", meta.className)}>
      {meta.label}
    </span>
  );
}
