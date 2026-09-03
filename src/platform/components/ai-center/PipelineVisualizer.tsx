import React, { useState } from 'react';
import { AI_PIPELINE_STEPS } from '../../data/mockPipeline';
import { HairlineCard } from '../common/HairlineCard';
import { StatusBadge } from '../common/StatusBadge';
import { Cpu, ArrowDown, Shield, Database, Lock, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { AIPipelineStep } from '../../types';

export const PipelineVisualizer: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<AIPipelineStep>(AI_PIPELINE_STEPS[1]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-accent-cyan" />
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              Autonomous AI Intelligence Architecture
            </h2>
          </div>
          <p className="font-sans text-xs text-ink-dim">
            Interactive cognitive pipeline detailing sub-millisecond data transformation from event ingestion to sovereign resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge label="PIPELINE: ACTIVE (18.2ms AVG)" tone="emerald" size="sm" pulse={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Pipeline Flow (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="font-mono text-[11px] text-ink-dim uppercase tracking-wider mb-2">
            COGNITIVE DECISION PIPELINE (CLICK ANY NODE TO INSPECT TELEMETRY)
          </div>

          {AI_PIPELINE_STEPS.map((step, idx) => {
            const isSelected = selectedStep.id === step.id;
            const isLast = idx === AI_PIPELINE_STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => setSelectedStep(step)}
                  className={`
                    cursor-pointer rounded-xl border p-4 transition-all duration-200 relative
                    ${
                      isSelected
                        ? 'border-accent-cyan bg-accent-cyan/10 shadow-[0_0_20px_-3px_rgba(0,210,255,0.2)] ring-1 ring-accent-cyan/50'
                        : 'border-hairline bg-paper-surface hover:border-hairlineStrong hover:bg-paper-elevated'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                          isSelected
                            ? 'bg-accent-cyan text-paper-bottom'
                            : 'bg-paper-elevated text-ink-dim border border-hairline'
                        }`}
                      >
                        0{step.layer}
                      </div>

                      <div>
                        <div className="font-display text-sm font-bold text-ink">
                          {step.name}
                        </div>
                        <div className="font-sans text-xs text-ink-muted">
                          {step.subhead}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs text-accent-cyan">
                        {step.latencyMs}ms
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-ink-dim transition-transform ${
                          isSelected ? 'rotate-90 text-accent-cyan' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Connecting Down Arrow */}
                {!isLast && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="h-4 w-4 text-ink-dim/40 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Deep Node Inspector (6 cols) */}
        <div className="lg:col-span-6">
          <HairlineCard className="h-full flex flex-col justify-between space-y-5 border-accent-cyan/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                  <span className="font-mono text-[10px] text-ink-dim uppercase">
                    STAGE INSPECTION // LAYER 0{selectedStep.layer}
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {selectedStep.name}
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan">
                  {selectedStep.latencyMs} ms Latency
                </span>
              </div>

              {/* Core Algorithm */}
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-medium text-ink-dim uppercase">
                  Underlying Intelligence Engine
                </span>
                <div className="rounded-lg border border-hairline bg-paper-elevated p-3 font-mono text-xs text-ink font-semibold">
                  {selectedStep.algorithm}
                </div>
              </div>

              {/* Input Tokens */}
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-medium text-ink-dim uppercase">
                  Ingested Invariant Signals & Tokens
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {selectedStep.inputTokens.map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-hairline/30 text-ink-muted border border-hairline"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </div>

              {/* Output Tensor */}
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-medium text-ink-dim uppercase">
                  Synthesized Output Representation
                </span>
                <div className="rounded-lg border border-accent-cyan/30 bg-accent-cyan/5 p-3 font-mono text-xs text-accent-cyan font-bold">
                  {selectedStep.outputTensor}
                </div>
              </div>

              {/* Institutional Safeguard */}
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-medium text-accent-emerald uppercase flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Institutional Compliance & Cryptographic Safeguard</span>
                </span>
                <p className="font-sans text-xs text-ink-muted leading-relaxed bg-paper-elevated p-3 rounded-lg border border-hairline">
                  {selectedStep.safeguard}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex items-center justify-between font-mono text-[11px] text-ink-dim">
              <span>COMPLIANCE: RBI / DPDP ACT READY</span>
              <span>ZERO RAW PII EXPOSURE</span>
            </div>
          </HairlineCard>
        </div>
      </div>
    </div>
  );
};
