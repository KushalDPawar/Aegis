import { SCENARIOS } from "@/lib/scenarios/definitions";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { RunScenarioButton } from "./RunScenarioButton";

export default function LabPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rise">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-teal/70 mb-2">Scenario Lab</p>
        <h1 className="font-display text-2xl font-semibold text-cream-100">Run a demo scenario</h1>
        <p className="text-cream-100/55 mt-1.5 text-sm max-w-2xl">
          Each scenario materializes a real, deterministic sequence of session and transaction events for your
          account, then runs it through the same Sentinel → MIND → GUARD pipeline as a live payment. Nothing calls
          an external banking, telecom, or SMS API.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SCENARIOS.map((s, i) => (
          <Panel key={s.code} className="rise flex flex-col" style={{ animationDelay: `${80 + i * 50}ms` }}>
            <PanelHeader eyebrow={s.subtitle} title={s.title} />
            <p className="text-sm text-cream-100/60 leading-relaxed flex-1 mb-4">{s.description}</p>
            <p className="text-xs text-cream-100/40 mb-4 font-mono">{s.expectedOutcome}</p>
            <RunScenarioButton code={s.code} isLegitimate={s.scamCategory === null} />
          </Panel>
        ))}
      </div>
    </div>
  );
}
