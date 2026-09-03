import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { DEMO_SCENARIOS } from '../../data/mockScenarios';
import { ScenarioId } from '../../types';
import { Sparkles, ShieldCheck, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

export const ScenarioBar: React.FC = () => {
  const { currentScenarioId, switchScenario, activeTab } = useIntelligence();

  // If on homepage/command center, do not render scenario bar
  if (activeTab === 'command') return null;

  // Filter scenarios based on the active feature
  const getFeatureScenarios = () => {
    if (activeTab === 'fraud') {
      return {
        featureName: 'Fraud Intelligence Scenarios',
        list: [
          {
            id: 'legitimate_vendor' as ScenarioId,
            label: '1. Legitimate Transfer (₹18.5k)',
            icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />,
          },
          {
            id: 'digital_arrest' as ScenarioId,
            label: '2. "Digital Arrest" Coercion (₹2.4L)',
            icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />,
          },
          {
            id: 'fake_kyc' as ScenarioId,
            label: '3. Fake KYC Phish (₹45k)',
            icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
          },
        ]
      };
    }

    if (activeTab === 'health') {
      return {
        featureName: 'Financial Health Scenarios',
        list: [
          {
            id: 'financial_distress' as ScenarioId,
            label: '1. Impending Distress Alert (1.56 Mo)',
            icon: <TrendingDown className="h-3.5 w-3.5 text-rose-400" />,
          },
          {
            id: 'legitimate_vendor' as ScenarioId,
            label: '2. Healthy Solvency Baseline (6.2 Mo)',
            icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
          },
        ]
      };
    }

    // For AI Center and History: show all scenarios to inspect audit transcripts
    return {
      featureName: 'Simulated Scenario Telemetry',
      list: [
        {
          id: 'legitimate_vendor' as ScenarioId,
          label: '1. Legitimate (₹18.5k)',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />,
        },
        {
          id: 'digital_arrest' as ScenarioId,
          label: '2. Digital Arrest (₹2.4L)',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />,
        },
        {
          id: 'fake_kyc' as ScenarioId,
          label: '3. Fake KYC (₹45k)',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
        },
        {
          id: 'financial_distress' as ScenarioId,
          label: '4. Runway Distress (1.56 Mo)',
          icon: <TrendingDown className="h-3.5 w-3.5 text-amber-400" />,
        },
      ]
    };
  };

  const featureScenarios = getFeatureScenarios();

  const handleSelectScenario = (id: ScenarioId) => {
    switchScenario(id);
  };

  return (
    <aside
      aria-label="Feature Scenario Switcher"
      className="w-full border-b border-hairline/70 bg-paper-surface/40 backdrop-blur-sm pr-4 sm:pr-6 lg:pr-8 pl-16 sm:pl-20 py-2.5 transition-all duration-300 select-none"
    >
      <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Label + Feature Specific Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent-cyan/15 text-accent-cyan">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {featureScenarios.featureName}:
            </span>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {featureScenarios.list.map((sc) => {
              const isSelected = currentScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`
                    flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-ink text-paper-bottom shadow-sm font-semibold ring-1 ring-accent-cyan/40'
                        : 'bg-paper-elevated/70 text-ink-muted hover:text-ink hover:bg-paper-elevated border border-hairline'
                    }
                  `}
                >
                  {sc.icon}
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Telemetry Guidance */}
        <div className="hidden xl:flex items-center gap-1.5 font-mono text-[10px] text-ink-dim">
          <span>INSTANTLY RE-RUNS NEURAL CHECKS & REASONING TOKENS</span>
        </div>
      </div>
    </aside>
  );
};
