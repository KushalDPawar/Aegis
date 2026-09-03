import React, { useState, useRef, useEffect } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Shield,
  TrendingUp,
  Cpu,
  History,
  Sun,
  Moon,
  ChevronRight,
  Lock,
  User as UserIcon,
  Sparkles,
  Zap
} from 'lucide-react';

// Bespoke AEGIS geometric emblem icon: ||D
export const AegisTriggerIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    strokeWidth="2.2"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* First vertical stroke */}
    <line x1="4.5" y1="4.5" x2="4.5" y2="19.5" />
    {/* Second vertical stroke */}
    <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" />
    {/* Third chamfered polygon/D shape */}
    <path d="M14.5 4.5 H17 L20 7.5 V19.5 H14.5 Z" />
  </svg>
);

interface NavItem {
  id: 'command' | 'fraud' | 'health' | 'ai-center' | 'history';
  label: string;
  sublabel: string;
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  accentColor: string;
  glowColor: string;
}

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, currentScenarioId } = useIntelligence();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, openAuthModal, openProfileDrawer } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'command',
      label: 'Home',
      sublabel: 'Executive Command & Orbit',
      index: '01',
      icon: Home,
      accentColor: 'text-accent-cyan',
      glowColor: 'rgba(0, 210, 255, 0.25)',
    },
    {
      id: 'fraud',
      label: 'Fraud Intelligence',
      sublabel: 'Real-Time Intercept Engine',
      index: '02',
      icon: Shield,
      badge: currentScenarioId !== 'legitimate_vendor' ? '1 Alert' : undefined,
      accentColor: 'text-rose-400',
      glowColor: 'rgba(244, 63, 94, 0.25)',
    },
    {
      id: 'health',
      label: 'Financial Health',
      sublabel: 'Predictive Resilience Runway',
      index: '03',
      icon: TrendingUp,
      accentColor: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.25)',
    },
    {
      id: 'ai-center',
      label: 'AI Intelligence Center',
      sublabel: 'Explainable Neural Telemetry',
      index: '04',
      icon: Cpu,
      accentColor: 'text-sky-400',
      glowColor: 'rgba(56, 189, 248, 0.25)',
    },
    {
      id: 'history',
      label: 'Insights & History',
      sublabel: 'Forensic Audit Transcript',
      index: '05',
      icon: History,
      accentColor: 'text-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.25)',
    },
  ];

  const hasAlert = currentScenarioId !== 'legitimate_vendor';

  // Smooth hover enter with immediate expansion and timer clearance
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsExpanded(true);
  };

  // Intentional 220ms debounce before collapsing to prevent jitter
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 220);
  };

  const handleSelectTab = (tabId: 'command' | 'fraud' | 'health' | 'ai-center' | 'history') => {
    setActiveTab(tabId);
    setIsExpanded(false);
  };

  // Click outside listener for touch devices
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* ── TOP-LEFT COMPACT HOVER-EXPANDABLE NAVIGATION (ONLY ON MODULE PAGES) ── */}
      {isAuthenticated && activeTab !== 'command' && (
        <div
          ref={navContainerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed top-3.5 left-4 z-50 select-none font-sans"
        >
          {/* Main Morphing Container */}
          <div
            className={`
              relative overflow-hidden rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${
                isExpanded
                  ? 'w-[320px] sm:w-[340px] border-white/20 bg-[#070b14]/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl ring-1 ring-white/10'
                  : 'w-11 h-11 flex items-center justify-center border-white/20 bg-[#070b14]/90 shadow-[0_8px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl hover:border-accent-cyan/70 hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] cursor-pointer group'
              }
            `}
          >
            {/* Collapsed State Icon Trigger */}
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                aria-label="Open Navigation Menu"
                className="relative flex h-full w-full items-center justify-center text-white/70 group-hover:text-white transition-colors"
              >
                <AegisTriggerIcon className="h-4.5 w-4.5 text-accent-cyan transition-transform duration-200 group-hover:scale-110" />
                {hasAlert && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-rose opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-rose border-2 border-[#070b14]" />
                  </span>
                )}
              </button>
            ) : (
              /* Expanded Panel View */
              <div className="w-full animate-soft-in">
                {/* Header inside expanded panel */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 shadow-[0_0_12px_rgba(0,210,255,0.25)]">
                      <AegisTriggerIcon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-black tracking-tight text-white">
                          AEGIS
                        </span>
                        <span className="font-mono text-[9px] font-bold tracking-widest text-accent-cyan uppercase">
                          {'// OS'}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] tracking-wider text-white/50">
                        AUTONOMOUS INTELLIGENCE
                      </span>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTheme();
                    }}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition-colors shadow-sm"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-accent-amber" />
                    ) : (
                      <Moon className="h-4 w-4 text-sky-300" />
                    )}
                  </button>
                </div>

                {/* Navigation Items List */}
                <div className="p-2 space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`
                          group/btn w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-accent-cyan/15 via-white/[0.08] to-white/[0.02] border border-accent-cyan/40 shadow-[0_0_20px_rgba(0,210,255,0.15)] text-white'
                              : 'border border-transparent hover:border-white/10 hover:bg-white/[0.05] text-white/60 hover:text-white'
                          }
                        `}
                      >
                        {/* Active Indicator Bar on Left */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent-cyan shadow-[0_0_8px_#00d2ff]" />
                        )}

                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`
                              flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all
                              ${
                                isActive
                                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                                  : 'bg-white/[0.05] border border-white/10 text-white/50 group-hover/btn:text-white group-hover/btn:bg-white/[0.09]'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-accent-cyan' : 'text-white/40'}`}>
                                {item.index}
                              </span>
                              <span className={`font-sans text-xs font-bold truncate ${isActive ? 'text-white' : 'text-white/80 group-hover/btn:text-white'}`}>
                                {item.label}
                              </span>
                            </div>
                            <span
                              className={`
                                font-mono text-[9px] truncate
                                ${isActive ? 'text-accent-cyan/80' : 'text-white/45 group-hover/btn:text-white/60'}
                              `}
                            >
                              {item.sublabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.badge && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-accent-rose text-white font-bold animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`
                              h-3.5 w-3.5 transition-all duration-200
                              ${
                                isActive
                                  ? 'text-accent-cyan translate-x-0.5 opacity-100'
                                  : 'text-white/30 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5'
                              }
                            `}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer Security Badge */}
                <div className="px-4 py-2.5 border-t border-white/10 bg-black/40 flex items-center justify-between font-mono text-[9px] text-white/50">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
                    <span className="text-emerald-400/90 font-semibold">ZK-STARK VERIFIED</span>
                  </div>
                  <span>EDGE LOCAL v2.4</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOP-RIGHT FLOATING AUTH & TELEMETRY CAPSULE ── */}
      <aside aria-label="System status" className="fixed top-3.5 right-4 z-50 flex items-center gap-2 select-none">
        
        {/* Interactive Authentication Profile Capsule (Shown only after login) */}
        {isAuthenticated && user && (
          <button
            onClick={openProfileDrawer}
            className="group flex items-center gap-2.5 rounded-full border border-white/15 bg-[#070b14]/90 px-3.5 py-1.5 backdrop-blur-xl shadow-lg hover:border-accent-cyan/60 hover:shadow-[0_0_15px_rgba(0,210,255,0.2)] transition-all"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-cyan text-black text-[10px] font-display font-black shadow-[0_0_8px_rgba(0,210,255,0.4)]">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-sans text-xs font-bold text-white leading-tight group-hover:text-accent-cyan transition-colors">
                {user.name.split(' ')[0]}
              </span>
              <span className="font-mono text-[8px] text-white/50 leading-none">
                {user.tier}
              </span>
            </div>

            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald shadow-[0_0_6px_#10b981]" />
          </button>
        )}

        {/* Global Latency Capsule */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-[#070b14]/80 px-3.5 py-1.5 font-mono text-[11px] text-white/60 backdrop-blur-md shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="text-white font-semibold">14ms</span>
          <span className="opacity-40">|</span>
          <span className="tracking-wider text-emerald-400">CORE SECURE</span>
        </div>
      </aside>
    </>
  );
};
