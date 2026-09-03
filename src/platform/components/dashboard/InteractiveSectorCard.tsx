import React, { useState, useRef } from 'react';
import {
  Shield,
  TrendingUp,
  Cpu,
  ArrowRight,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  Radio,
  BarChart3,
  Layers
} from 'lucide-react';

interface SectorCardProps {
  sectorId: 'fraud' | 'health' | 'ai-center';
  indexNumber: string;
  badgeLabel: string;
  title: string;
  description: string;
  capabilities: string[];
  ctaText: string;
  onEnter: () => void;
  colorTheme: 'rose' | 'emerald' | 'sky';
}

export const InteractiveSectorCard: React.FC<SectorCardProps> = ({
  sectorId,
  indexNumber,
  badgeLabel,
  title,
  description,
  capabilities,
  ctaText,
  onEnter,
  colorTheme,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeChipIndex, setActiveChipIndex] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  // Color mappings
  const themeStyles = {
    rose: {
      border: 'border-rose-500/30 hover:border-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      iconBox: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      hoverGlow: 'rgba(244, 63, 94, 0.22)',
      activeText: 'group-hover:text-rose-400',
      chipActive: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
      chipInactive: 'bg-rose-500/5 border-rose-500/20 text-white/70 hover:bg-rose-500/15 hover:text-white',
      dotColor: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
      ctaBorder: 'border-rose-500/30 group-hover:border-rose-400/70',
      ctaText: 'text-rose-400 group-hover:text-rose-300',
      meterBg: 'bg-rose-500',
      tickerTitle: 'REAL-TIME SHIELD',
      tickerValue: '99.8% DEFLECTED',
      icon: Shield,
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      iconBox: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      hoverGlow: 'rgba(16, 185, 129, 0.22)',
      activeText: 'group-hover:text-emerald-400',
      chipActive: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      chipInactive: 'bg-emerald-500/5 border-emerald-500/20 text-white/70 hover:bg-emerald-500/15 hover:text-white',
      dotColor: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      ctaBorder: 'border-emerald-500/30 group-hover:border-emerald-400/70',
      ctaText: 'text-emerald-400 group-hover:text-emerald-300',
      meterBg: 'bg-emerald-500',
      tickerTitle: 'RUNWAY VELOCITY',
      tickerValue: '6.2 MO INSULATED',
      icon: TrendingUp,
    },
    sky: {
      border: 'border-sky-500/30 hover:border-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
      iconBox: 'bg-sky-500/15 text-sky-400 border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]',
      hoverGlow: 'rgba(56, 189, 248, 0.22)',
      activeText: 'group-hover:text-sky-300',
      chipActive: 'bg-sky-500/20 border-sky-500/50 text-sky-300',
      chipInactive: 'bg-sky-500/5 border-sky-500/20 text-white/70 hover:bg-sky-500/15 hover:text-white',
      dotColor: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
      ctaBorder: 'border-sky-500/30 group-hover:border-sky-400/70',
      ctaText: 'text-sky-400 group-hover:text-sky-300',
      meterBg: 'bg-sky-400',
      tickerTitle: 'ZK GOVERNANCE',
      tickerValue: '100% EXPLAINABLE',
      icon: Cpu,
    },
  }[colorTheme];

  const MainIcon = themeStyles.icon;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveChipIndex(null);
      }}
      onClick={onEnter}
      className={`
        group relative flex flex-col justify-between overflow-hidden rounded-3xl border ${themeStyles.border}
        bg-[#070b14]/95 p-6 sm:p-7 backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]
        cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]
        select-none font-sans text-white
      `}
    >
      {/* ── DYNAMIC CURSOR-FOLLOW SPOTLIGHT AURA ── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${themeStyles.hoverGlow}, transparent 70%)`,
        }}
      />

      {/* Cyber Grid Background */}
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* ── CARD CONTENT ── */}
      <div className="relative z-10 space-y-5">
        
        {/* Top Header: Badge + Animated Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full border ${themeStyles.badgeBg} flex items-center gap-1.5 shadow-sm`}>
              <span className={`h-1.5 w-1.5 rounded-full ${themeStyles.dotColor} animate-pulse`} />
              {badgeLabel}
            </span>
          </div>

          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${themeStyles.iconBox} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <MainIcon className="h-5 w-5" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className={`font-display text-xl sm:text-2xl font-bold text-white ${themeStyles.activeText} transition-colors tracking-tight`}>
            {title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
            {description}
          </p>
        </div>

        {/* Live Mini-Telemetry Ticker Display */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 flex items-center justify-between font-mono text-[11px] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radio className={`h-3.5 w-3.5 ${themeStyles.ctaText} animate-pulse`} />
            <span className="text-white/60 uppercase text-[10px]">{themeStyles.tickerTitle}</span>
          </div>
          <span className={`font-bold ${themeStyles.ctaText} tracking-wider`}>
            {themeStyles.tickerValue}
          </span>
        </div>

        {/* Interactive Capabilities Chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] text-white/50 uppercase tracking-wider">
            <span>ENGINE CAPABILITIES</span>
            <span className="text-[9px] text-white/30">HOVER TO EXPLORE</span>
          </div>

          <div className="space-y-1.5">
            {capabilities.map((cap, idx) => {
              const isChipActive = activeChipIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setActiveChipIndex(idx);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setActiveChipIndex(null);
                  }}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-mono transition-all duration-200
                    ${isChipActive ? themeStyles.chipActive : themeStyles.chipInactive}
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-1.5 w-1.5 rounded-full ${isChipActive ? themeStyles.dotColor : 'bg-white/30'} shrink-0`} />
                    <span className="truncate">{cap}</span>
                  </div>
                  
                  <span className={`text-[9px] font-bold ${isChipActive ? 'opacity-100' : 'opacity-0'} transition-opacity shrink-0 ml-1.5`}>
                    ACTIVE
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── CARD BOTTOM LAUNCH CTA BUTTON ── */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs font-bold transition-colors">
        <span className={themeStyles.ctaText}>
          {ctaText}
        </span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${themeStyles.ctaBorder} bg-white/[0.04] group-hover:bg-white/10 transition-all duration-200`}>
          <ArrowRight className={`h-3.5 w-3.5 ${themeStyles.ctaText} transition-transform duration-200 group-hover:translate-x-1`} />
        </div>
      </div>

    </div>
  );
};
