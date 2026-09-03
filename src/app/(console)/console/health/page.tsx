import { getCustomerResilience } from "@/lib/queries/health";
import { EmptyState, Panel } from "@/components/console/primitives";
import { ResilienceWorkbench } from "@/components/console/ResilienceWorkbench";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const customers = await getCustomerResilience();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70">Financial health</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100 mt-1.5">Resilience predictor</h1>
        <p className="text-sm text-cream-100/50 mt-1.5 max-w-2xl">
          How much shock each customer could absorb before a crisis. Thin runway is a fraud signal in its own right —
          urgency lands hardest on people with no cushion, which is the exact lever &ldquo;your account will be
          frozen&rdquo; scams pull.
        </p>
      </header>

      {customers.length === 0 ? (
        <Panel>
          <EmptyState title="No customer accounts" />
        </Panel>
      ) : (
        <ResilienceWorkbench customers={customers} />
      )}
    </div>
  );
}
