import React from 'react';
import { HairlineCard } from '../common/HairlineCard';
import { ShieldCheck, Lock, Eye, Scale, UserCheck, Heart } from 'lucide-react';

export const EthicalSafeguards: React.FC = () => {
  const pillars = [
    {
      icon: <UserCheck className="h-5 w-5 text-accent-cyan" />,
      title: 'Intelligent Friction, Not Financial Restriction',
      detail:
        'Sentinel never acts as an authoritarian gatekeeper. We introduce deliberate cognitive pauses—such as cooling-off escrows or trusted contact reviews—while preserving ultimate user sovereignty through informed override pledges.'
    },
    {
      icon: <Lock className="h-5 w-5 text-accent-emerald" />,
      title: 'Cryptographic Privacy & Zero PII Exposure',
      detail:
        'All linguistic semantic evaluation and graph walks run within confidential enclave hardware. Account numbers and names are one-way hashed via HMAC-SHA256, strictly adhering to India’s DPDP Act and international banking standards.'
    },
    {
      icon: <Eye className="h-5 w-5 text-amber-500" />,
      title: 'Transparent Neuro-Symbolic Explainability',
      detail:
        'No opaque black-box risk numbers. Sentinel isolates exact SHAP feature attributions and explains in plain language what law enforcement protocols actually require, eliminating fear-based cognitive overload.'
    },
    {
      icon: <Heart className="h-5 w-5 text-rose-400" />,
      title: 'Proactive Early Buffer vs Retrospective Distress',
      detail:
        'Traditional banking profits from overdraft fees and revolving debt spirals. Sentinel turns the bank into a proactive guardian, catching runway depletion 90 days before missed payments or credit degradation.'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-ink">
          Institutional Governance & Constitutional AI Safeguards
        </h3>
        <p className="font-sans text-xs text-ink-dim">
          Core architectural principles designed to meet the strict fiduciary standards of tier-1 global financial institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar, i) => (
          <HairlineCard key={i} className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-elevated border border-hairline shrink-0">
                {pillar.icon}
              </div>
              <h4 className="font-display text-base font-bold text-ink">
                {pillar.title}
              </h4>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed pl-12">
              {pillar.detail}
            </p>
          </HairlineCard>
        ))}
      </div>
    </div>
  );
};
