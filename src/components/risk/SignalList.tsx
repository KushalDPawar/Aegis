import { ConfidenceTag } from "@/components/ui/Badge";

export interface SignalItem {
  category: string;
  code: string;
  label: string;
  weight: number;
  contribution: number;
  detail: string;
  confidence: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  TRANSACTION: "Transaction",
  BENEFICIARY: "Beneficiary",
  BEHAVIORAL: "Behavioral",
  CONTEXT: "Context",
  SOCIAL_ENGINEERING: "Social Engineering",
};

export function SignalList({ signals }: { signals: SignalItem[] }) {
  if (signals.length === 0) {
    return <p className="text-sm text-cream-100/45">No contributing signals detected.</p>;
  }
  const sorted = [...signals].sort((a, b) => b.contribution - a.contribution);
  return (
    <ul className="space-y-3">
      {sorted.map((s, i) => (
        <li key={`${s.code}-${i}`} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
          <div className="mt-0.5 font-mono text-xs text-cream-100/40 w-9 shrink-0 text-right">+{s.contribution}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-signal-teal/70">
                {CATEGORY_LABEL[s.category] ?? s.category}
              </span>
              <ConfidenceTag confidence={s.confidence} />
            </div>
            <p className="text-sm font-medium text-cream-100 mt-1">{s.label}</p>
            <p className="text-xs text-cream-100/50 mt-0.5 leading-relaxed">{s.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
