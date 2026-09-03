"use client";

import { useState } from "react";
import type { PipelineStep } from "@/lib/ai/pipeline";

/**
 * The decision pipeline, layer by layer.
 *
 * Expanding one layer at a time rather than rendering six dense blocks at
 * once: the point of this screen is that a reviewer can follow the path a
 * payment takes, and six simultaneous walls of tensor shapes defeats that.
 * The selected layer stays open so it can be read against the timeline.
 */
export function PipelineVisualizer({
  steps,
  totalLatencyMs,
}: {
  steps: PipelineStep[];
  totalLatencyMs: number;
}) {
  const [openId, setOpenId] = useState<string>(steps[0]?.id ?? "");

  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal-teal/70">Decision pipeline</p>
          <h2 className="font-display text-base font-medium text-cream-100 mt-1">Six layers, end to end</h2>
        </div>
        <p className="font-mono text-xs text-cream-100/50 tabular-nums">
          {totalLatencyMs.toFixed(1)} ms total
        </p>
      </div>

      {/* Latency ribbon — each layer sized by its share of the budget. */}
      <div className="mt-4 flex gap-1 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setOpenId(s.id)}
            aria-label={`Layer ${s.layer}: ${s.name}`}
            title={`${s.name} — ${s.latencyMs} ms`}
            style={{ flexGrow: s.latencyMs }}
            className={`h-full transition-colors duration-300 ${
              s.id === openId ? "bg-signal-teal" : i % 2 === 0 ? "bg-signal-teal/30" : "bg-signal-cyan/30"
            } hover:bg-signal-teal/70`}
          />
        ))}
      </div>

      <ol className="mt-5 space-y-2">
        {steps.map((s) => {
          const open = s.id === openId;
          return (
            <li key={s.id} className="rounded-xl border border-white/8 overflow-hidden">
              <button
                onClick={() => setOpenId(open ? "" : s.id)}
                aria-expanded={open}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] tabular-nums ${
                    open ? "border-signal-teal/50 bg-signal-teal/10 text-signal-teal" : "border-white/12 text-cream-100/50"
                  }`}
                >
                  {s.layer}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-cream-100">{s.name}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-cream-100/35 mt-0.5 truncate">
                    {s.subhead}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-cream-100/40 tabular-nums shrink-0 hidden sm:block">
                  {s.latencyMs} ms
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  className={`shrink-0 text-cream-100/35 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {open && (
                <div className="value-in border-t border-white/8 px-4 py-4 space-y-4">
                  <Row label="Algorithm" value={s.algorithm} mono />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35 mb-1.5">
                      Input signals
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.inputTokens.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-cream-100/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Row label="Output" value={s.outputTensor} mono />
                  <div className="rounded-xl border border-signal-jade/25 bg-signal-jade/[0.05] px-3.5 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal-jade mb-1.5">
                      Safeguard
                    </p>
                    <p className="text-xs text-cream-100/65 leading-relaxed">{s.safeguard}</p>
                  </div>
                  <Row label="Implemented in" value={s.implementedIn} mono />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35 mb-1">{label}</p>
      <p className={`text-xs text-cream-100/70 leading-relaxed ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
