import type { RiskLevelName } from "./types";

export const RISK_LEVEL_META: Record<
  RiskLevelName,
  { label: string; text: string; bg: string; border: string; symbol: string }
> = {
  LOW: { label: "Low", text: "text-signal-jade", bg: "bg-signal-jade/10", border: "border-signal-jade/40", symbol: "●" },
  MODERATE: { label: "Moderate", text: "text-signal-cyan", bg: "bg-signal-cyan/10", border: "border-signal-cyan/40", symbol: "◆" },
  HIGH: { label: "High", text: "text-signal-amber", bg: "bg-signal-amber/10", border: "border-signal-amber/40", symbol: "▲" },
  VERY_HIGH: { label: "Very High", text: "text-signal-coral", bg: "bg-signal-coral/10", border: "border-signal-coral/40", symbol: "▲▲" },
  CRITICAL: { label: "Critical", text: "text-signal-crimson", bg: "bg-signal-crimson/10", border: "border-signal-crimson/40", symbol: "✕" },
};

export const GUARD_ACTION_META: Record<string, { label: string; description: string }> = {
  ALLOW: { label: "Allow", description: "Payment proceeds with standard verification." },
  VERIFY: { label: "Verify", description: "Additional quick verification required before proceeding." },
  WARN: { label: "Warn & Explain", description: "Customer must review a clear warning before continuing." },
  COOLING_PERIOD: { label: "Cooling Period", description: "A short mandatory pause before the payment can proceed." },
  PAUSE: { label: "Pause", description: "Payment paused; trusted contact and recovery options offered." },
};
