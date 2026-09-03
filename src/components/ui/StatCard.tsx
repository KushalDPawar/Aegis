import clsx from "clsx";

export function StatCard({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    neutral: "text-cream-100",
    good: "text-signal-jade",
    warn: "text-signal-amber",
    bad: "text-signal-crimson",
  }[tone];

  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-100/45 mb-2">{label}</p>
      <p className={clsx("font-display text-2xl md:text-3xl font-semibold", toneClass)}>{value}</p>
      {sublabel && <p className="text-xs text-cream-100/45 mt-1.5">{sublabel}</p>}
    </div>
  );
}
