import { requireCustomer } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { formatDateTime } from "@/lib/format";

export default async function StatusPage() {
  const { session } = await requireCustomer();
  const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  const recentAudit = await prisma.auditLog.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const checks = [
    { label: "Database connection", status: "OK", detail: "SQLite (local, self-contained) via Prisma." },
    { label: "Authentication", status: "OK", detail: "Signed, httpOnly session cookie (HS256)." },
    { label: "Sentinel risk engine", status: "OK", detail: "Deterministic scoring — always available, no external dependency." },
    {
      label: "MIND AI Intent Check",
      status: aiConfigured ? "AI PROVIDER ACTIVE" : "FALLBACK ACTIVE",
      detail: aiConfigured
        ? "Requests are classified by Claude, with strict schema validation and automatic fallback on any error."
        : "No ANTHROPIC_API_KEY configured — using the deterministic pattern-matching classifier. The product remains fully functional.",
    },
    { label: "GUARD authorization", status: "OK", detail: "All payment state transitions are enforced server-side, never by the AI layer." },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">System Status</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Security & AI status</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm max-w-2xl">
          This is a simulation environment. No real bank accounts, telecom, SMS, or fraud-provider APIs are connected.
        </p>
      </div>

      <Panel className="rise" style={{ animationDelay: "80ms" }}>
        <PanelHeader eyebrow="Checks" title="Component status" />
        <ul className="divide-y divide-white/6">
          {checks.map((c) => (
            <li key={c.label} className="py-3.5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-cream-100">{c.label}</p>
                <p className="text-xs text-cream-100/45 mt-0.5 max-w-md">{c.detail}</p>
              </div>
              <span className="font-mono text-xs uppercase tracking-wide text-signal-jade shrink-0 mt-0.5">{c.status}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="rise" style={{ animationDelay: "140ms" }}>
        <PanelHeader eyebrow="Audit Log" title="Your recent account activity" />
        {recentAudit.length === 0 ? (
          <p className="text-sm text-cream-100/45 py-6 text-center">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-2 font-mono text-xs">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 text-cream-100/60">
                <span>{formatDateTime(a.createdAt)}</span>
                <span className="text-cream-100/80">{a.action}</span>
                <span className="truncate max-w-[160px] text-cream-100/40">{a.target}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
