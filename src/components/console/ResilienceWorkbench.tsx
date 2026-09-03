"use client";

import { useMemo, useState } from "react";
import type { CustomerResilience } from "@/lib/queries/health";
import {
  NEUTRAL_INPUTS,
  nextMonths,
  projectForward,
  ratingForScore,
  type ScenarioInputs,
  type TimelinePoint,
} from "@/lib/health/resilience";
import { Panel, Metric, EmptyState } from "./primitives";
import { formatINR } from "@/lib/format";

const RATING_TONE: Record<string, string> = {
  Robust: "text-signal-jade border-signal-jade/40 bg-signal-jade/10",
  Resilient: "text-signal-teal border-signal-teal/40 bg-signal-teal/10",
  Vulnerable: "text-signal-amber border-signal-amber/40 bg-signal-amber/10",
  Critical: "text-signal-crimson border-signal-crimson/40 bg-signal-crimson/10",
};

/**
 * Resilience workbench.
 *
 * The projection recomputes on every slider move with no server round-trip —
 * the model is pure arithmetic over a handful of numbers, so the operator gets
 * an immediate answer to "what if their income drops 30%", which is the only
 * way a what-if tool actually gets used.
 */
export function ResilienceWorkbench({ customers }: { customers: CustomerResilience[] }) {
  const [selectedId, setSelectedId] = useState(customers[0]?.accountId ?? "");
  const [inputs, setInputs] = useState<ScenarioInputs>(NEUTRAL_INPUTS);

  const customer = customers.find((c) => c.accountId === selectedId) ?? customers[0];

  const projection = useMemo(() => {
    if (!customer) return [];
    const latest =
      customer.history[customer.history.length - 1] ??
      ({
        month: "now",
        essential: customer.summary.essentialExpenses,
        discretionary: customer.summary.discretionaryExpenses,
        savingsBuffer: customer.summary.liquidEmergencyBuffer,
        resilienceScore: customer.summary.resilienceScore,
      } as TimelinePoint);
    return projectForward(latest, customer.summary.monthlyIncome, inputs, nextMonths(new Date()));
  }, [customer, inputs]);

  if (!customer) return <EmptyState title="No customer data" />;

  const series = [...customer.history, ...projection];
  const endScore = projection[projection.length - 1]?.resilienceScore ?? customer.summary.resilienceScore;
  const endRating = ratingForScore(endScore);
  const delta = endScore - customer.summary.resilienceScore;
  const touched = JSON.stringify(inputs) !== JSON.stringify(NEUTRAL_INPUTS);

  const maxBuffer = Math.max(...series.map((p) => p.savingsBuffer), 1);

  return (
    <div className="space-y-6">
      {/* ---------------- Customer picker ---------------- */}
      <div className="flex flex-wrap gap-2">
        {customers.map((c) => (
          <button
            key={c.accountId}
            onClick={() => {
              setSelectedId(c.accountId);
              setInputs(NEUTRAL_INPUTS);
            }}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              c.accountId === customer.accountId
                ? "border-signal-teal/45 bg-signal-teal/10 text-signal-teal"
                : "border-white/12 text-cream-100/60 hover:text-cream-100"
            }`}
          >
            {c.name}
            {c.vulnerabilityProfile !== "STANDARD" && (
              <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.1em] text-signal-amber/80">
                {c.vulnerabilityProfile}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-100/40">Resilience score</p>
          <p className="value-in font-display text-3xl font-semibold text-cream-100 mt-2 tabular-nums">
            {customer.summary.resilienceScore}
          </p>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] mt-2 ${RATING_TONE[customer.summary.rating]}`}
          >
            {customer.summary.rating}
          </span>
        </div>
        <Metric
          label="Buffer runway"
          value={`${customer.summary.bufferRunwayMonths.toFixed(1)} mo`}
          sub="Essentials covered by liquid balance"
          tone={customer.summary.bufferRunwayMonths >= 6 ? "good" : customer.summary.bufferRunwayMonths >= 3 ? "warn" : "bad"}
        />
        <Metric
          label="Emergency buffer"
          value={formatINR(customer.summary.liquidEmergencyBuffer)}
          sub="Account balance"
        />
        <Metric
          label="Savings rate"
          value={`${customer.summary.savingsRate}%`}
          sub="Of assumed monthly income"
          tone={customer.summary.savingsRate >= 15 ? "good" : customer.summary.savingsRate >= 5 ? "warn" : "bad"}
        />
      </div>

      <Panel eyebrow="Shock absorption" title="Where this customer stands">
        <p className="text-sm text-cream-100/70 leading-relaxed">{customer.summary.shockAbsorption}</p>
        <div className="grid gap-3 sm:grid-cols-3 mt-4">
          <Figure label="Essential / month" value={formatINR(customer.summary.essentialExpenses)} />
          <Figure label="Discretionary / month" value={formatINR(customer.summary.discretionaryExpenses)} />
          <Figure
            label="Income / month"
            value={formatINR(customer.summary.monthlyIncome)}
            note={customer.summary.incomeIsAssumed ? "Assumed — no credit data in this schema" : undefined}
          />
        </div>
      </Panel>

      {/* ---------------- Projection ---------------- */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel eyebrow="Projection" title="Six months forward">
          <Chart series={series} maxBuffer={maxBuffer} />
          <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/40">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-signal-teal" aria-hidden="true" /> Observed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t border-dashed border-signal-cyan" aria-hidden="true" /> Projected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-white/15" aria-hidden="true" /> Buffer
            </span>
          </div>
        </Panel>

        <Panel eyebrow="What if" title="Adjust the levers">
          <div className="space-y-5">
            <Slider
              label="Income shock"
              suffix="%"
              min={0}
              max={60}
              value={inputs.incomeShock}
              onChange={(v) => setInputs({ ...inputs, incomeShock: v })}
            />
            <Slider
              label="Cut discretionary"
              suffix="%"
              min={0}
              max={60}
              value={inputs.discretionaryReduction}
              onChange={(v) => setInputs({ ...inputs, discretionaryReduction: v })}
            />
            <Slider
              label="Debt prepayment"
              prefix="₹"
              min={0}
              max={30000}
              step={1000}
              value={inputs.debtPrepayment}
              onChange={(v) => setInputs({ ...inputs, debtPrepayment: v })}
            />
            <Slider
              label="Auto-sweep to buffer"
              prefix="₹"
              min={0}
              max={30000}
              step={1000}
              value={inputs.emergencyAutoSweep}
              onChange={(v) => setInputs({ ...inputs, emergencyAutoSweep: v })}
            />
          </div>

          <div className="mt-5 rounded-xl border border-white/10 px-4 py-3.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">In six months</p>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="font-display text-2xl font-semibold text-cream-100 tabular-nums">{endScore}</span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                  delta > 0 ? "text-signal-jade" : delta < 0 ? "text-signal-coral" : "text-cream-100/40"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {delta} pts
              </span>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] mt-2 ${RATING_TONE[endRating]}`}
            >
              {endRating}
            </span>
          </div>

          {touched && (
            <button
              onClick={() => setInputs(NEUTRAL_INPUTS)}
              className="mt-3 w-full rounded-full border border-white/15 px-4 py-2 text-xs text-cream-100/70 hover:text-cream-100 transition-colors"
            >
              Reset levers
            </button>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-white/8 px-3.5 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35">{label}</p>
      <p className="font-mono text-sm text-cream-100/85 mt-1 tabular-nums">{value}</p>
      {note && <p className="text-[10px] text-signal-amber/70 mt-1 leading-snug">{note}</p>}
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/50">{label}</span>
        <span className="font-mono text-xs text-cream-100/80 tabular-nums">
          {prefix}
          {value.toLocaleString("en-IN")}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-signal-teal"
      />
    </label>
  );
}

/**
 * Inline SVG chart — buffer as bars, resilience score as a line, with the
 * projected span drawn dashed so a forecast can never be mistaken for history.
 */
function Chart({ series, maxBuffer }: { series: TimelinePoint[]; maxBuffer: number }) {
  const W = 620;
  const H = 190;
  const padX = 8;
  const padY = 14;
  const n = series.length;
  if (n === 0) return <EmptyState title="No history yet" />;

  const step = (W - padX * 2) / Math.max(1, n - 1);
  const x = (i: number) => padX + i * step;
  const yScore = (s: number) => padY + (1 - s / 100) * (H - padY * 2);

  const firstProjected = series.findIndex((p) => p.projected);
  const observed = firstProjected === -1 ? series : series.slice(0, firstProjected);
  const projected = firstProjected === -1 ? [] : series.slice(Math.max(0, firstProjected - 1));

  const path = (pts: TimelinePoint[], offset: number) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i + offset).toFixed(1)} ${yScore(p.resilienceScore).toFixed(1)}`).join(" ");

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full min-w-[520px]" role="img" aria-label="Resilience projection">
        {[25, 50, 75].map((g) => (
          <line key={g} x1={padX} x2={W - padX} y1={yScore(g)} y2={yScore(g)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}

        {series.map((p, i) => {
          const h = (p.savingsBuffer / maxBuffer) * (H - padY * 2);
          return (
            <rect
              key={`${p.month}-${i}`}
              x={x(i) - step * 0.28}
              y={H - padY - h}
              width={Math.max(3, step * 0.56)}
              height={Math.max(0, h)}
              rx="2"
              fill={p.projected ? "rgba(103,232,249,0.14)" : "rgba(255,255,255,0.10)"}
            />
          );
        })}

        <path d={path(observed, 0)} fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {projected.length > 1 && (
          <path
            d={path(projected, Math.max(0, firstProjected - 1))}
            fill="none"
            stroke="#67e8f9"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {series.map((p, i) => (
          <text
            key={`l-${p.month}-${i}`}
            x={x(i)}
            y={H + 14}
            textAnchor="middle"
            className="fill-cream-100/30"
            style={{ fontSize: 8, fontFamily: "var(--font-mono), monospace" }}
          >
            {p.month}
          </text>
        ))}
      </svg>
    </div>
  );
}
