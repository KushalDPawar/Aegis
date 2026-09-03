import { formatTime, formatDateTime } from "@/lib/format";

export interface TimelineItem {
  id: string;
  timestamp: Date | string;
  label: string;
  description: string;
  severity?: number;
  tag?: string;
}

export function Timeline({ items, dense = false }: { items: TimelineItem[]; dense?: boolean }) {
  return (
    <ol className="relative border-l border-white/10 pl-6 space-y-6">
      {items.map((item) => {
        const severity = item.severity ?? 0;
        const dotColor =
          severity >= 60 ? "bg-signal-crimson" : severity >= 35 ? "bg-signal-amber" : severity > 0 ? "bg-signal-cyan" : "bg-white/25";
        return (
          <li key={item.id} className="relative">
            <span
              className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full ring-4 ring-ink-900 ${dotColor}`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <time className="font-mono text-xs text-cream-100/45" dateTime={new Date(item.timestamp).toISOString()}>
                {dense ? formatTime(item.timestamp) : formatDateTime(item.timestamp)}
              </time>
              {item.tag && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-cream-100/40">{item.tag}</span>
              )}
            </div>
            <p className="font-medium text-cream-100 mt-0.5">{item.label}</p>
            <p className="text-sm text-cream-100/55 mt-0.5">{item.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
