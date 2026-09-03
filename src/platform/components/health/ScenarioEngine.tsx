import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { PillButton } from '../common/PillButton';
import { Sliders, Sparkles, RefreshCw, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { CURRENT_RESILIENCE_SUMMARY } from '../../data/mockHealthTimeline';

export const ScenarioEngine: React.FC = () => {
  const { scenarioSliders, updateScenarioSlider } = useIntelligence();

  // Dynamic simulation outcomes
  const currentDiscretionary = CURRENT_RESILIENCE_SUMMARY.discretionaryExpenses;
  const currentBuffer = CURRENT_RESILIENCE_SUMMARY.liquidEmergencyBuffer;
  const essential = CURRENT_RESILIENCE_SUMMARY.essentialExpenses;

  const monthlySpendSaved = Math.round(currentDiscretionary * (scenarioSliders.discretionaryReduction / 100));
  const newDiscretionary = currentDiscretionary - monthlySpendSaved;

  // 6-month projected buffer
  const monthlyNetCashflow =
    (CURRENT_RESILIENCE_SUMMARY.monthlyIncome * (1 - scenarioSliders.incomeShock / 100)) -
    essential -
    newDiscretionary -
    scenarioSliders.debtPrepayment +
    scenarioSliders.emergencyAutoSweep;

  const projectedBuffer6M = Math.max(0, currentBuffer + monthlyNetCashflow * 6);
  const projectedRunwayMonths = essential > 0 ? (projectedBuffer6M / essential).toFixed(1) : '0';

  // Projected 6M Resilience Score
  const projectedScore = Math.min(
    100,
    Math.max(
      15,
      Math.round(
        Number(projectedRunwayMonths) * 14 +
        (monthlyNetCashflow > 0 ? (monthlyNetCashflow / 165000) * 120 : 0) +
        (100 - scenarioSliders.incomeShock * 0.8) * 0.4
      )
    )
  );

  const applyPreset = (preset: 'current' | 'moderate' | 'aggressive') => {
    if (preset === 'current') {
      updateScenarioSlider('discretionaryReduction', 0);
      updateScenarioSlider('incomeShock', 0);
      updateScenarioSlider('debtPrepayment', 0);
      updateScenarioSlider('emergencyAutoSweep', 0);
    } else if (preset === 'moderate') {
      updateScenarioSlider('discretionaryReduction', 15);
      updateScenarioSlider('incomeShock', 0);
      updateScenarioSlider('debtPrepayment', 4000);
      updateScenarioSlider('emergencyAutoSweep', 3000);
    } else if (preset === 'aggressive') {
      updateScenarioSlider('discretionaryReduction', 25);
      updateScenarioSlider('incomeShock', 0);
      updateScenarioSlider('debtPrepayment', 8000);
      updateScenarioSlider('emergencyAutoSweep', 6000);
    }
  };

  return (
    <HairlineCard className="space-y-6 border-accent-cyan/30 shadow-[0_0_30px_-5px_rgba(0,210,255,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-accent-cyan" />
            <h3 className="font-display text-lg font-bold text-ink">
              Interactive Future Scenario Simulator (&quot;What-If&quot; Engine)
            </h3>
          </div>
          <p className="font-sans text-xs text-ink-dim">
            Adjust behavioral and liquidity parameters to project your resilience trajectory 6 months forward in real time.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-ink-dim hidden sm:inline">PRESETS:</span>
          <button
            onClick={() => applyPreset('current')}
            className={`px-2.5 py-1 rounded border transition-all ${
              scenarioSliders.discretionaryReduction === 0
                ? 'bg-ink text-paper-bottom font-semibold border-transparent'
                : 'border-hairline bg-paper-elevated text-ink-muted hover:text-ink'
            }`}
          >
            Current Trend
          </button>
          <button
            onClick={() => applyPreset('moderate')}
            className={`px-2.5 py-1 rounded border transition-all ${
              scenarioSliders.discretionaryReduction === 15
                ? 'bg-ink text-paper-bottom font-semibold border-transparent'
                : 'border-hairline bg-paper-elevated text-ink-muted hover:text-ink'
            }`}
          >
            Conservative (-15%)
          </button>
          <button
            onClick={() => applyPreset('aggressive')}
            className={`px-2.5 py-1 rounded border transition-all ${
              scenarioSliders.discretionaryReduction === 25
                ? 'bg-ink text-paper-bottom font-semibold border-transparent'
                : 'border-hairline bg-paper-elevated text-ink-muted hover:text-ink'
            }`}
          >
            Resilience Surge (-25%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider 1: Discretionary Spending Reduction */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-ink font-medium">DISCRETIONARY EXPENSE REDUCTION</span>
              <span className="font-bold text-accent-cyan">
                -{scenarioSliders.discretionaryReduction}% (Saves ₹{monthlySpendSaved.toLocaleString('en-IN')}/mo)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={scenarioSliders.discretionaryReduction}
              onChange={(e) => updateScenarioSlider('discretionaryReduction', parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim">
              <span>0% (Status Quo)</span>
              <span>-20% (Optimized Dining & Subscriptions)</span>
              <span>-40% (Lean Shield)</span>
            </div>
          </div>

          {/* Slider 2: Emergency Auto-Sweep */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-ink font-medium">EMERGENCY AUTO-SWEEP TO HIGH-YIELD VAULT</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +₹{scenarioSliders.emergencyAutoSweep.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12000"
              step="1000"
              value={scenarioSliders.emergencyAutoSweep}
              onChange={(e) => updateScenarioSlider('emergencyAutoSweep', parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim">
              <span>₹0/mo</span>
              <span>₹5,000/mo</span>
              <span>₹12,000/mo</span>
            </div>
          </div>

          {/* Slider 3: Accelerated Debt Prepayment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-ink font-medium">HIGH-INTEREST DEBT ACCELERATION</span>
              <span className="font-bold text-amber-500">
                +₹{scenarioSliders.debtPrepayment.toLocaleString('en-IN')}/mo (Cuts 42% APR)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="1000"
              value={scenarioSliders.debtPrepayment}
              onChange={(e) => updateScenarioSlider('debtPrepayment', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim">
              <span>₹0/mo</span>
              <span>₹7,500/mo</span>
              <span>₹15,000/mo (Full Roll-off in 4 Months)</span>
            </div>
          </div>

          {/* Slider 4: Income Shock Stress Test */}
          <div className="space-y-2 pt-2 border-t border-hairline/60">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-ink font-medium flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                <span>INCOME SHOCK STRESS-TEST</span>
              </span>
              <span className="font-bold text-rose-500">
                -{scenarioSliders.incomeShock}% Temporary Dip
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="10"
              value={scenarioSliders.incomeShock}
              onChange={(e) => updateScenarioSlider('incomeShock', parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-dim">
              <span>0% (Full Salary)</span>
              <span>-20% (Bonus Freeze)</span>
              <span>-40% (Severe Shock)</span>
            </div>
          </div>
        </div>

        {/* Right: Projected Outcomes Display (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-hairline bg-paper-elevated/70 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
                PROJECTED 6-MONTH OUTCOMES
              </span>
              <span className="font-mono text-[10px] text-accent-cyan px-2 py-0.5 rounded bg-accent-cyan/15">
                MARCH 2027
              </span>
            </div>

            <div className="space-y-4">
              {/* Metric 1: Resilience Inflection */}
              <div>
                <div className="font-mono text-xs text-ink-dim mb-1">
                  PROJECTED RESILIENCE INDEX
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold text-ink">
                    {projectedScore}/100
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      projectedScore >= 75
                        ? 'text-emerald-500'
                        : projectedScore >= 55
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {projectedScore >= 75 ? 'ROBUST BUFFER' : projectedScore >= 55 ? 'STABLE' : 'VULNERABLE'}
                  </span>
                </div>
                <p className="font-sans text-xs text-ink-muted mt-0.5">
                  Shift from current 59/100 to {projectedScore}/100 within 180 days.
                </p>
              </div>

              {/* Metric 2: Emergency Runway */}
              <div className="pt-3 border-t border-hairline">
                <div className="font-mono text-xs text-ink-dim mb-1">
                  PREDICTED EMERGENCY RUNWAY
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-accent-cyan">
                    {projectedRunwayMonths} Months
                  </span>
                  <span className="font-mono text-xs text-ink-dim">
                    (₹{Math.round(projectedBuffer6M).toLocaleString('en-IN')} total reserves)
                  </span>
                </div>
              </div>

              {/* Metric 3: Debt Finance Savings */}
              <div className="pt-3 border-t border-hairline">
                <div className="font-mono text-xs text-ink-dim mb-1">
                  CUMULATIVE FINANCE INTEREST PREVENTED
                </div>
                <div className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{Math.round((monthlySpendSaved * 0.4 + scenarioSliders.debtPrepayment * 0.25) * 6).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-paper-surface p-3 border border-hairline text-xs font-sans text-ink-muted">
            <span className="font-semibold text-ink">AI Recommendation:</span> Reducing discretionary outflows by 15% and establishing a ₹3,000 monthly auto-sweep will rebuild your 4-month resilience runway before next quarter.
          </div>
        </div>
      </div>
    </HairlineCard>
  );
};
