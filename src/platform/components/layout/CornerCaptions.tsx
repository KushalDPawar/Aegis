import React from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';

export const CornerCaptions: React.FC = () => {
  const { currentScenario, activeTab } = useIntelligence();

  // Keep hero stage completely clean without telemetry overlap
  if (activeTab === 'command') return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden select-none p-4 lg:flex justify-between font-mono text-[11px] text-ink-dim/80">
      {/* Bottom Left */}
      <div className="flex items-center gap-2 bg-paper-surface/60 backdrop-blur-sm px-3 py-1 rounded border border-hairline/40">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
        <span>Safety System Active</span>
        <span className="text-ink-faint">|</span>
        <span>Response: 14ms</span>
        <span className="text-ink-faint">|</span>
        <span>Your data stays on this device</span>
      </div>

      {/* Bottom Right */}
      <div className="flex items-center gap-2 bg-paper-surface/60 backdrop-blur-sm px-3 py-1 rounded border border-hairline/40">
        <span className="text-ink-dim">User: Deepak S.</span>
        <span className="text-ink-faint">|</span>
        <span className="text-accent-emerald">Protection: Maximum</span>
        <span className="text-ink-faint">|</span>
        <span className="uppercase">{currentScenario.badge}</span>
      </div>
    </div>

  );
};
