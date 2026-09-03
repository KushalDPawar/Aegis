import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { ShieldCheck, ShieldAlert, Sparkles, ArrowUpRight, Cpu } from 'lucide-react';
import { PillButton } from '../common/PillButton';
import { StatusBadge } from '../common/StatusBadge';

export const FinancialBriefing: React.FC = () => {
  const { currentScenarioId, setActiveTab } = useIntelligence();

  // Dynamic contextual hero briefing depending on current scenario
  const getBriefingContent = () => {
    switch (currentScenarioId) {
      case 'legitimate_vendor':
        return {
          statusBadge: { label: 'ALL SYSTEMS NOMINAL', tone: 'emerald' as const },
          title: 'Good evening, Deepak.',
          leadText: 'Your banking perimeter is calm and resilient today.',
          subText:
            'All recent transfers have cleared with zero friction, including your ₹18,500 disbursement to Chroma Studios LLP. Your monthly core cashflow is balanced, and no social engineering threats are detected.',
          primaryAction: { label: 'Review Monthly Cashflow', tab: 'health' as const },
          secondaryAction: { label: 'Inspect Security Perimeter', tab: 'ai-center' as const }
        };
      case 'digital_arrest':
        return {
          statusBadge: { label: 'HIGH-PRIORITY COERCION INTERCEPT', tone: 'rose' as const },
          title: 'Good evening, Deepak.',
          leadText: 'One pending high-value transaction requires your immediate attention.',
          subText:
            'Our cognitive defense layer intercepted a ₹2,40,000 transfer request to an alleged "Government Escrow". The context strongly matches a syndicated Digital Arrest scam using psychological intimidation.',
          primaryAction: { label: 'Examine Fraud Intercept & Context', tab: 'fraud' as const },
          secondaryAction: { label: 'Review Emergency Buffer', tab: 'health' as const }
        };
      case 'fake_kyc':
        return {
          statusBadge: { label: 'ACTIVE PHISHING INTERCEPT', tone: 'rose' as const },
          title: 'Good evening, Deepak.',
          leadText: 'Phishing attack intercepted before account compromise.',
          subText:
            'A fraudulent SMS attempting to solicit ₹45,000 under the guise of an "Urgent PAN / KYC suspension" was blocked. No funds have left your account.',
          primaryAction: { label: 'Inspect Phishing Pattern', tab: 'fraud' as const },
          secondaryAction: { label: 'Audit Security Access', tab: 'ai-center' as const }
        };
      case 'financial_distress':
      default:
        return {
          statusBadge: { label: 'RESILIENCE INFLECTION DETECTED', tone: 'amber' as const },
          title: 'Good evening, Deepak.',
          leadText: 'Your financial resilience is contracting silently.',
          subText:
            'Over the last 90 days, discretionary outflows have expanded by 28% while your liquid buffer dropped to 1.56 months. An unexpected financial shock could create acute liquidity pressure unless balanced early.',
          primaryAction: { label: 'Open Scenario Navigator', tab: 'health' as const },
          secondaryAction: { label: 'Review Today’s Interventions', tab: 'command' as const }
        };
    }
  };

  const briefing = getBriefingContent();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-paper-surface via-paper-surface to-paper-elevated p-6 sm:p-8 shadow-sm">
      {/* Subtle radial ambient bloom in top-right */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={briefing.statusBadge.label}
              tone={briefing.statusBadge.tone}
              pulse={briefing.statusBadge.tone !== 'emerald'}
            />
            <span className="font-mono text-xs text-ink-dim">
              REALTIME AI BRIEFING · SYNCED 14 SECONDS AGO
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
            {briefing.title}
          </h1>

          <p className="font-display text-lg sm:text-xl font-medium text-ink-muted leading-snug">
            {briefing.leadText}
          </p>

          <p className="font-sans text-sm sm:text-base text-ink-dim leading-relaxed max-w-2xl">
            {briefing.subText}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex shrink-0 flex-col sm:flex-row lg:flex-col gap-3">
          <PillButton
            variant="primary"
            size="md"
            onClick={() => setActiveTab(briefing.primaryAction.tab)}
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            {briefing.primaryAction.label}
          </PillButton>
          <PillButton
            variant="secondary"
            size="md"
            onClick={() => setActiveTab(briefing.secondaryAction.tab)}
            icon={<Cpu className="h-4 w-4" />}
          >
            {briefing.secondaryAction.label}
          </PillButton>
        </div>
      </div>
    </div>
  );
};
