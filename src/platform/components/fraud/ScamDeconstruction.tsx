import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HairlineCard } from '../common/HairlineCard';
import { StatusBadge } from '../common/StatusBadge';
import { AlertOctagon, HelpCircle, ShieldAlert, CheckCircle2, Scale, ExternalLink } from 'lucide-react';

export const ScamDeconstruction: React.FC = () => {
  const { simulationState, currentScenario } = useIntelligence();
  const scam = simulationState.identifiedScam || currentScenario.scamVector;

  // Use engine-computed riskTier from the activeTransaction so custom inputs
  // correctly suppress or expose the scam deconstruction panel.
  const isLowRisk = simulationState.activeTransaction.riskTier === 'low';

  if (!scam || isLowRisk) {
    return (
      <HairlineCard className="space-y-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <h3 className="font-display text-xl font-bold text-ink">
            No Scam Patterns Found
          </h3>
        </div>
        <p className="font-sans text-sm text-ink-muted leading-relaxed">
          We did not find any known scam patterns that match this transfer. The stated reason and recipient details look routine and legitimate.
        </p>
      </HairlineCard>
    );
  }

  return (
    <HairlineCard className="space-y-5 border-rose-500/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-xl font-bold text-ink">
              ⚠ Scam Pattern Identified: {scam.patternName}
            </h3>
          </div>
          <p className="font-sans text-sm text-ink-dim mt-1">
            This matches a fraud pattern seen in {scam.historicalInterceptsCount.toLocaleString()} real reported cases.
          </p>
        </div>

        <StatusBadge
          label={`THREAT LEVEL: ${scam.threatLevel}`}
          tone="rose"
          pulse={true}
          size="sm"
        />
      </div>

      {/* Psychological Pressure Tactics */}
      <div className="space-y-2.5">
        <h4 className="font-sans text-sm font-bold text-ink">
          How this scam pressures victims:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {scam.psychologicalTriggers.map((trigger, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3"
            >
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-sans text-sm text-ink">{trigger}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works vs What's real */}
      <div className="space-y-4 rounded-xl border border-hairline bg-paper-elevated/60 p-5">
        <div>
          <div className="font-sans text-sm font-bold text-rose-500 mb-1.5">
            How this scam works:
          </div>
          <p className="font-sans text-sm text-ink-muted leading-relaxed">
            {scam.modusOperandi}
          </p>
        </div>

        <div className="pt-3 border-t border-hairline">
          <div className="flex items-center gap-1.5 font-sans text-sm font-bold text-emerald-500 mb-1.5">
            <Scale className="h-4 w-4" />
            <span>What banks and police actually do:</span>
          </div>
          <p className="font-sans text-sm text-ink-muted leading-relaxed font-medium">
            {scam.officialProtocolDiscrepancy}
          </p>
        </div>
      </div>

      {/* What to do now */}
      <div className="space-y-2.5">
        <h4 className="font-sans text-sm font-bold text-ink">
          What you should do right now:
        </h4>
        <ul className="space-y-2">
          {scam.immediateSafetyGuidance.map((guide, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper-elevated/40 px-4 py-3">
              <span className="font-display text-sm font-black text-accent-cyan shrink-0">{i + 1}.</span>
              <span className="font-sans text-sm text-ink leading-snug">{guide}</span>
            </li>
          ))}
        </ul>
      </div>
    </HairlineCard>
  );
};
