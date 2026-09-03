import { formatINR } from "@/lib/format";

function formatValue(value: number, unit: string): string {
  if (unit === "INR") return formatINR(value);
  return `${new Intl.NumberFormat("en-IN").format(Math.round(value))} ${unit}`;
}

export function ImpactChart({ data }: { data: { label: string; value: number; unit: string }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-cream-100/45">No baseline metrics seeded.</p>;
  }

  return (
    <ul className="divide-y divide-white/6">
      {data.map((d) => (
        <li key={d.label} className="flex items-center justify-between gap-4 py-3">
          <span className="text-sm text-cream-100/75">{d.label}</span>
          <span className="font-mono text-sm text-signal-teal shrink-0">{formatValue(d.value, d.unit)}</span>
        </li>
      ))}
    </ul>
  );
}
