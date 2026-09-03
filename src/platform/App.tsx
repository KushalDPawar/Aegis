"use client";

import React, { useEffect } from 'react';
import { useIntelligence } from './context/IntelligenceContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { ScenarioBar } from './components/layout/ScenarioBar';
import { CornerCaptions } from './components/layout/CornerCaptions';
import { CustomCursor } from './components/layout/CustomCursor';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileDrawer } from './components/auth/ProfileDrawer';
import { AuthVerificationTransition } from './components/auth/AuthVerificationTransition';
import { AuthenticatedPlatformHub } from './components/dashboard/AuthenticatedPlatformHub';

// Command Center components
import { CinematicHero } from './components/command/CinematicHero';

// Fraud Intelligence components
import { TransactionSimulator } from './components/fraud/TransactionSimulator';
import { ProgressiveAnalysis } from './components/fraud/ProgressiveAnalysis';
import { ContextInterview } from './components/fraud/ContextInterview';
import { ScamDeconstruction } from './components/fraud/ScamDeconstruction';
import { FrictionDecision } from './components/fraud/FrictionDecision';
import { RiskSignalPanel } from './components/fraud/RiskSignalPanel';

// Financial Health components
import { ResilienceTimeline } from './components/health/ResilienceTimeline';
import { AIInsightEngine } from './components/health/AIInsightEngine';
import { ScenarioEngine } from './components/health/ScenarioEngine';
import { ActionPlan } from './components/health/ActionPlan';

// AI Center components
import { PipelineVisualizer } from './components/ai-center/PipelineVisualizer';
import { EthicalSafeguards } from './components/ai-center/EthicalSafeguards';

// History components
import { AuditLedger } from './components/history/AuditLedger';

// Protected Gate Icon
import { Shield, Lock, ArrowRight } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useIntelligence();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Reset scroll position on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <div className="relative min-h-screen bg-paper-bottom text-ink selection:bg-accent-cyan/20 selection:text-ink pb-16">
      {/* Interactive Luxury Custom Cursor */}
      <CustomCursor />

      {/* Authentication Gateway, Profile & Verification Modals */}
      <AuthModal />
      <ProfileDrawer />
      <AuthVerificationTransition />

      {/* Ascend Grain and Radial Ambient Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 ascend-grain" />
      <div className="pointer-events-none fixed inset-0 z-0 ambient-glow" />

      {/* Main App Shell */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <Header />
        
        {/* Interactive Scenario Bar only visible AFTER authentication */}
        {isAuthenticated && <ScenarioBar />}

        {/* Viewport Content */}
        {activeTab === 'command' ? (
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-up">
            {!isAuthenticated ? (
              /* Unauthenticated: Cinematic Hero with smooth scroll into Auth Center */
              <CinematicHero />
            ) : (
              /* Authenticated: Three-Sector Platform Hub */
              <div className="space-y-8">
                <AuthenticatedPlatformHub />
              </div>
            )}
          </main>
        ) : (
          /* Protected Route Handling for Internal Platform Modules */
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-up">
            
            {/* Protected Route Security Guard */}
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-hairlineStrong bg-paper-surface/90 dark:bg-[#080b12]/90 shadow-2xl backdrop-blur-xl max-w-xl mx-auto space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-paper-bottom border border-accent-cyan/40 shadow-lg">
                  <Lock className="h-8 w-8 text-accent-cyan" />
                </div>
                
                <h3 className="font-display text-2xl font-bold text-ink">
                  Authentication Required
                </h3>
                
                <p className="font-sans text-sm text-ink-dim max-w-md">
                  This sovereign intelligence module requires an authenticated session or an active demo account.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={openAuthModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-ink text-paper-bottom px-5 py-2.5 text-xs font-bold shadow-md hover:bg-ink/90 transition-all"
                  >
                    <span>Sign In or Select Demo Account</span>
                    <ArrowRight className="h-3.5 w-3.5 text-accent-cyan" />
                  </button>
                  <button
                    onClick={() => setActiveTab('command')}
                    className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated px-4 py-2.5 text-xs font-bold text-ink hover:border-hairlineStrong transition-all"
                  >
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated Modules */
              <>
                {activeTab === 'fraud' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left Column: Simulation Form & Decisions (6 cols) */}
                      <div className="lg:col-span-6 space-y-8">
                        <TransactionSimulator />
                        <FrictionDecision />
                      </div>

                      {/* Right Column: Progressive Analysis, Risk Signals & Context Interview (6 cols) */}
                      <div className="lg:col-span-6 space-y-8">
                        <ProgressiveAnalysis />
                        <RiskSignalPanel />
                        <ContextInterview />
                      </div>
                    </div>

                    {/* Full Width Bottom: Scam Pattern Deconstruction */}
                    <ScamDeconstruction />
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="space-y-8">
                    <ResilienceTimeline />
                    <ScenarioEngine />
                    <AIInsightEngine />
                    <ActionPlan />
                  </div>
                )}

                {activeTab === 'ai-center' && (
                  <div className="space-y-8">
                    <PipelineVisualizer />
                    <EthicalSafeguards />
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-8">
                    <AuditLedger />
                  </div>
                )}
              </>
            )}
          </main>
        )}

        {/* Fixed Corner Captions */}
        <CornerCaptions />
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
