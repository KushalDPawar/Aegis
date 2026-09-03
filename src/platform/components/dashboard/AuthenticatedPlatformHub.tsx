import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useIntelligence } from '../../context/IntelligenceContext';
import {
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { SovereignCommandNexus } from './SovereignCommandNexus';
import { InteractiveSectorCard } from './InteractiveSectorCard';

export const AuthenticatedPlatformHub: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useIntelligence();

  return (
    <div className="space-y-10 font-sans animate-fade-up">
      
      {/* ── USER EXECUTIVE PLATFORM HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-hairlineStrong bg-paper-surface/90 dark:bg-[#080b12]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* User Welcome & Clearance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 font-mono text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                AEGIS INTELLIGENCE PLATFORM ACTIVE
              </span>
              <StatusBadge
                label={user?.isDemoAccount ? `DEMO ACCOUNT (${user.tier})` : `SOVEREIGN VERIFIED`}
                tone={user?.isDemoAccount ? 'amber' : 'emerald'}
                size="sm"
              />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-teal-400 to-emerald-400">{user?.name || 'Executive User'}</span>
            </h1>

            <p className="font-mono text-xs text-ink-dim">
              {user?.role || 'Executive Member'} · {user?.accountNumber || 'ACC #4912'} · {user?.clearanceLevel || 'Level 3 Clearance'}
            </p>
          </div>

          {/* Quick Portfolio Balance Card */}
          <div className="flex items-center gap-4 bg-paper-elevated/70 border border-hairline p-4 rounded-2xl shrink-0">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase text-ink-dim tracking-wider">
                Total Sovereign Liquidity
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
                ₹{(user?.balance || 2845000).toLocaleString('en-IN')}
              </span>
              <span className="font-mono text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Zero-Knowledge Verified
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── SOVEREIGN DEFENSE NEXUS (Distinct Emerald / Gold Interactive Canvas) ── */}
      <SovereignCommandNexus />

      {/* ── THE THREE MAJOR AEGIS PLATFORM SECTORS ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_6px_#00d2ff]" />
              <span className="font-mono text-xs uppercase tracking-widest text-ink-dim font-bold">
                AEGIS PLATFORM SECTORS
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mt-1">
              Core Intelligence Engines
            </h2>
          </div>
          <span className="font-mono text-[10px] text-ink-dim hidden sm:block">
            SELECT A CAPABILITY ENGINE TO LAUNCH
          </span>
        </div>

        {/* 3 Major Interactive Product Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ════ SECTOR 01: PROTECT — Fraud Intelligence ════ */}
          <InteractiveSectorCard
            sectorId="fraud"
            indexNumber="01"
            badgeLabel="SECTOR 01 · PROTECT"
            title="Fraud Intelligence"
            description="Detect and understand suspicious financial situations before vulnerable users lose money. Scans real-time beneficiary mismatches, mule accounts, and coercive syndicate playbooks."
            capabilities={[
              'Transaction Intercept Simulation',
              'Confirmation of Payee Registry',
              'Digital Arrest & Phishing Deconstruction'
            ]}
            ctaText="ENTER FRAUD INTELLIGENCE"
            onEnter={() => setActiveTab('fraud')}
            colorTheme="rose"
          />

          {/* ════ SECTOR 02: STABILIZE — Financial Health ════ */}
          <InteractiveSectorCard
            sectorId="health"
            indexNumber="02"
            badgeLabel="SECTOR 02 · STABILIZE"
            title="Financial Health"
            description="Identify early financial stress signals and help users understand their financial resilience before problems become crises. Balances essential burn vs discretionary outflows."
            capabilities={[
              'Financial Resilience Score (0-100)',
              'Emergency Runway Velocity Modeling',
              'Autonomous Buffer Sweep Actions'
            ]}
            ctaText="EXPLORE FINANCIAL HEALTH"
            onEnter={() => setActiveTab('health')}
            colorTheme="emerald"
          />

          {/* ════ SECTOR 03: GOVERN — AI Governance & Audit ════ */}
          <InteractiveSectorCard
            sectorId="ai-center"
            indexNumber="03"
            badgeLabel="SECTOR 03 · GOVERN"
            title="AI Governance & Audit"
            description="Provide explainability, decision history, transparency, and trust around AI-generated recommendations. Complete cryptographic ledger with zero private banking data leakage."
            capabilities={[
              'Explainable SHAP Reasoning Tokens',
              'Immutable Cryptographic Audit Trail',
              'Local Edge Inference Safeguards'
            ]}
            ctaText="OPEN GOVERNANCE CENTER"
            onEnter={() => setActiveTab('ai-center')}
            colorTheme="sky"
          />

        </div>
      </div>

    </div>
  );
};
