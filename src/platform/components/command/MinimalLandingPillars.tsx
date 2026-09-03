import React, { useState, useRef, useEffect } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { Shield, TrendingUp, Cpu, ArrowUpRight } from 'lucide-react';

interface CardTilt {
  x: number;
  y: number;
  px: number;
  py: number;
  hovered: boolean;
}

export const MinimalLandingPillars: React.FC = () => {
  const { setActiveTab } = useIntelligence();
  const [scrollY, setScrollY] = useState(0);

  // Individual card tilt tracking
  const [cardTilts, setCardTilts] = useState<CardTilt[]>([
    { x: 0, y: 0, px: 0, py: 0, hovered: false },
    { x: 0, y: 0, px: 0, py: 0, hovered: false },
    { x: 0, y: 0, px: 0, py: 0, hovered: false },
  ]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setCardTilts(prev => {
      const next = [...prev];
      next[index] = { x, y, px, py, hovered: true };
      return next;
    });
  };

  const handleMouseLeave = (index: number) => {
    setCardTilts(prev => {
      const next = [...prev];
      next[index] = { x: 0, y: 0, px: 0, py: 0, hovered: false };
      return next;
    });
  };

  const pillars = [
    {
      icon: Shield,
      title: 'Fraud Intelligence',
      tag: 'REAL-TIME CHECK',
      description: 'Test live transfers against our Core Banking Registry. Spots name mismatches, mule accounts, and coercive scam patterns before money moves.',
      actionLabel: 'Launch Simulator',
      tab: 'fraud' as const,
      color: 'text-rose-500',
      borderHover: 'hover:border-rose-500/40',
      glowColor: 'rgba(244, 63, 94, 0.12)',
    },
    {
      icon: TrendingUp,
      title: 'Financial Health',
      tag: 'RESILIENCE MATRIX',
      description: 'Track runway velocity, liquid buffers, and shock absorption. Balances essential vs discretionary burn with predictive stress testing.',
      actionLabel: 'Explore Health Matrix',
      tab: 'health' as const,
      color: 'text-emerald-500',
      borderHover: 'hover:border-emerald-500/40',
      glowColor: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: Cpu,
      title: 'AI Governance & Audit',
      tag: 'ZERO-KNOWLEDGE',
      description: 'Audit explainable neural reasoning, bias safeguards, and cryptographic verification ledger. Zero private banking data leaves your device.',
      actionLabel: 'Inspect Pipeline',
      tab: 'ai-center' as const,
      color: 'text-accent-cyan',
      borderHover: 'hover:border-accent-cyan/40',
      glowColor: 'rgba(0, 210, 255, 0.12)',
    },
  ];

  // 3D Scroll tilt calculation for pillars
  const scrollProgress = Math.min(1, Math.max(0, (scrollY - 100) / 400));
  const entranceTilt = (1 - scrollProgress) * 6;

  return (
    <div
      id="platform-pillars"
      className="pt-8 pb-12 space-y-8 will-change-transform"
      style={{
        transform: `perspective(1000px) rotateX(${entranceTilt}deg)`,
        transition: 'transform 0.4s ease-out',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-hairline pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-dim">
            {'// PLATFORM CAPABILITIES'}
          </span>
          <h2 className="font-display text-2xl font-light tracking-tight text-ink mt-1">
            Engineered for <span className="font-bold">Total Capital Sovereignty.</span>
          </h2>
        </div>
        <p className="font-sans text-xs text-ink-dim max-w-sm">
          Select an intelligence enclave to observe real-time cognitive defense in action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((item, i) => {
          const Icon = item.icon;
          const tilt = cardTilts[i];
          const rotateX = -tilt.y * 12;
          const rotateY = tilt.x * 12;

          return (
            <div
              key={i}
              onMouseMove={(e) => handleMouseMove(i, e)}
              onMouseLeave={() => handleMouseLeave(i)}
              onClick={() => setActiveTab(item.tab)}
              style={{
                transform: tilt.hovered
                  ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`
                  : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                transition: tilt.hovered
                  ? 'transform 0.1s ease-out, box-shadow 0.2s ease-out'
                  : 'transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.5s ease-out',
              }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-hairline bg-paper-surface/60 p-6 sm:p-7 backdrop-blur-md shadow-lg cursor-pointer ${item.borderHover}`}
            >
              {/* Dynamic Interactive Cursor Glow Flare on each card */}
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  background: tilt.hovered
                    ? `radial-gradient(350px circle at ${tilt.px}px ${tilt.py}px, ${item.glowColor}, transparent 70%)`
                    : 'transparent',
                }}
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-hairline bg-paper-elevated text-ink group-hover:scale-110 transition-transform">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-ink-dim uppercase">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed mt-2 font-light">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-hairline/60 flex items-center justify-between font-mono text-xs font-semibold text-ink group-hover:text-accent-cyan transition-colors">
                <span>{item.actionLabel}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
