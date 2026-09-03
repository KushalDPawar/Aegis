import React, { useEffect, useRef, useState } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import {
  ArrowUpRight,
  Play,
  ChevronDown,
  ArrowUp,
  Shield,
  Sparkles,
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Mail,
  Building
} from 'lucide-react';
import { ScenarioId } from '../../types';

export const CinematicHero: React.FC = () => {
  const { currentScenarioId, switchScenario, setActiveTab } = useIntelligence();
  const { signIn, signUp, switchDemoPersona, isAuthenticated } = useAuth();
  
  const trackRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse & Scroll State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mousePixel, setMousePixel] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auth Form State
  const [activeTab, setActiveAuthTab] = useState<'signin' | 'signup'>('signin');
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('Executive Sovereign Client');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Clean, sophisticated scenario descriptors
  const getScenarioData = () => {
    switch (currentScenarioId) {
      case 'digital_arrest':
        return {
          badge: 'THREAT INTERCEPTED',
          badgeTone: 'rose',
          titleHighlight: 'shields',
          headline: 'Digital Arrest Scam Intercepted',
          targetTab: 'fraud' as const,
        };
      case 'fake_kyc':
        return {
          badge: 'PHISHING VECTOR BLOCKED',
          badgeTone: 'rose',
          titleHighlight: 'neutralizes',
          headline: 'Fake KYC Phishing Quarantined',
          targetTab: 'fraud' as const,
        };
      case 'financial_distress':
        return {
          badge: 'BUFFER CONTRACTION',
          badgeTone: 'amber',
          titleHighlight: 'balances',
          headline: 'Predictive Runway Advisory Active',
          targetTab: 'health' as const,
        };
      case 'legitimate_vendor':
      default:
        return {
          badge: 'PERIMETER SECURE',
          badgeTone: 'emerald',
          titleHighlight: 'protects',
          headline: 'All Perimeters Clear',
          targetTab: 'fraud' as const,
        };
    }
  };

  const scenario = getScenarioData();

  // Native Scroll-Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackTop = rect.top;
      const trackHeight = rect.height;
      const windowHeight = window.innerHeight;

      const scrollableDist = trackHeight - windowHeight;
      if (scrollableDist <= 0) return;

      const progress = Math.min(1, Math.max(0, -trackTop / scrollableDist));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active scenario for canvas dynamic color lerping
  const scenarioRef = useRef(scenario);
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  // 3D Canvas Star & Particle Field Journey with Scroll-Warp
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ── 1. Warp Field Ambient Space Stars ──
    const NUM_WARP_STARS = 180;
    const warpStars: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < NUM_WARP_STARS; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * width * 2.4,
        y: (Math.random() - 0.5) * height * 2.4,
        z: Math.random() * 1200 - 200,
        size: Math.random() * 1.2 + 0.4,
      });
    }

    // ── 2. The 3D Neural Star Sphere Particles ──
    const NUM_STAR_NODES = 320;
    const starNodes: {
      origX: number;
      origY: number;
      origZ: number;
      radius: number;
      baseSize: number;
      alpha: number;
      pulseOffset: number;
    }[] = [];

    const baseRadius = Math.min(width, height) * 0.28;

    for (let i = 0; i < NUM_STAR_NODES; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NUM_STAR_NODES);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const r = baseRadius * (0.92 + Math.random() * 0.16);
      const nx = r * Math.sin(phi) * Math.cos(theta);
      const ny = r * Math.sin(phi) * Math.sin(theta);
      const nz = r * Math.cos(phi);

      starNodes.push({
        origX: nx,
        origY: ny,
        origZ: nz,
        radius: r,
        baseSize: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.5 + 0.4,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    // Color Lerp Engine
    let currentR = 56;
    let currentG = 189;
    let currentB = 248;

    const render = () => {
      time += 0.016;

      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, width, height);

      // Target Tone Color based on Active Scenario
      const sc = scenarioRef.current;
      let targetR = 56, targetG = 189, targetB = 248;
      if (sc.badgeTone === 'rose') {
        targetR = 244; targetG = 63; targetB = 94;
      } else if (sc.badgeTone === 'amber') {
        targetR = 245; targetG = 158; targetB = 11;
      } else if (sc.badgeTone === 'emerald') {
        targetR = 16; targetG = 185; targetB = 129;
      }

      currentR += (targetR - currentR) * 0.04;
      currentG += (targetG - currentG) * 0.04;
      currentB += (targetB - currentB) * 0.04;

      const rInt = Math.round(currentR);
      const gInt = Math.round(currentG);
      const bInt = Math.round(currentB);

      smoothMouseX += (mousePos.x - smoothMouseX) * 0.05;
      smoothMouseY += (mousePos.y - smoothMouseY) * 0.05;

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      const scrollVal = trackRef.current ? scrollProgress : 0;
      const speedMultiplier = 1 + scrollVal * 3.5;

      // ── Ambient Core Aura ──
      const coreRadius = baseRadius * (1.3 + scrollVal * 0.6);
      const coreGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius
      );
      coreGlow.addColorStop(0, `rgba(${rInt}, ${gInt}, ${bInt}, ${0.18 * (1 - scrollVal * 0.5)})`);
      coreGlow.addColorStop(0.5, `rgba(${rInt}, ${gInt}, ${bInt}, 0.05)`);
      coreGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // ── Render 3D Warp Stars (Zooms as you scroll) ──
      for (let i = 0; i < warpStars.length; i++) {
        const star = warpStars[i];
        star.z -= 0.8 * speedMultiplier;
        if (star.z < -200) star.z = 1000;

        const fov = 400;
        const scale = fov / (fov + star.z);
        const sx = centerX + star.x * scale;
        const sy = centerY + star.y * scale;

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          const alpha = Math.min(0.7, (1 - star.z / 1000) * 0.7);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.4, star.size * scale * (1 + scrollVal)), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Render 3D Neural Sphere Nodes ──
      const rotY = time * 0.25 + smoothMouseX * 0.6 + scrollVal * 1.5;
      const rotX = Math.sin(time * 0.15) * 0.12 - smoothMouseY * 0.6;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const sphereScaleFactor = 1 + scrollVal * 1.2;

      for (let i = 0; i < starNodes.length; i++) {
        const node = starNodes[i];

        let x1 = (node.origX * sphereScaleFactor) * cosY + (node.origZ * sphereScaleFactor) * sinY;
        let z1 = -(node.origX * sphereScaleFactor) * sinY + (node.origZ * sphereScaleFactor) * cosY;
        let y1 = (node.origY * sphereScaleFactor) * cosX - z1 * sinX;
        let z2 = (node.origY * sphereScaleFactor) * sinX + z1 * cosX;

        const fov = 500;
        const scale = fov / (fov + z2 + 100);
        const px = centerX + x1 * scale;
        const py = centerY + y1 * scale;

        const depthFactor = (z2 + baseRadius) / (baseRadius * 2);
        const pulse = Math.sin(time * 2 + node.pulseOffset) * 0.25 + 0.75;
        const alpha = Math.max(0.08, Math.min(0.85, (depthFactor * 0.7 + 0.2) * pulse * (1 - scrollVal * 0.4)));

        ctx.fillStyle = `rgba(${rInt}, ${gInt}, ${bInt}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, node.baseSize * scale * pulse), 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollProgress]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
    setMousePixel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const scrollToAuth = () => {
    if (!trackRef.current) return;
    const scrollTarget = trackRef.current.offsetTop + window.innerHeight * 0.95;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handlers
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await signIn(signInIdentifier, signInPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    const res = await signUp({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      role: signUpRole,
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const handleDemoAccountLogin = async (key: 'deepak' | 'priya' | 'vikram') => {
    setErrorMessage('');
    setIsLoading(true);
    await switchDemoPersona(key);
    setIsLoading(false);
  };

  // Smooth Interpolations for 2-Layer Cinematic Scroll Transition
  const heroFadeOut = Math.max(0, 1 - scrollProgress * 2.6);
  const heroTranslateY = -scrollProgress * 220;

  const authEmergeProgress = Math.min(1, Math.max(0, (scrollProgress - 0.3) * 2.4));
  const authEmergeScale = 0.94 + authEmergeProgress * 0.06;
  const authEmergeTranslateY = (1 - authEmergeProgress) * 70;
  const isAuthInteractive = authEmergeProgress > 0.45;

  return (
    <div
      ref={trackRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className="relative w-full h-[220vh] select-none"
    >
      {/* ── STICKY VIEWPORT STAGE ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#07090e] text-white shadow-2xl flex flex-col items-center justify-center">

        {/* Soft, Subtle Cursor Glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background: isHovered
              ? `radial-gradient(700px circle at ${mousePixel.x}px ${mousePixel.y}px, rgba(56, 189, 248, 0.04), transparent 70%)`
              : 'transparent',
          }}
        />

        {/* Background Star Dust Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* ── 3D CANVAS STAGE ── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* ════ LAYER 1: HERO HEADLINE & ACTIONS (Fades on scroll) ════ */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-between px-6 pt-12 pb-6 max-w-4xl mx-auto w-full text-center transition-all duration-150"
          style={{
            opacity: heroFadeOut,
            transform: `translateY(${heroTranslateY}px) scale(${1 + (1 - heroFadeOut) * 0.06})`,
            pointerEvents: heroFadeOut > 0.15 ? 'auto' : 'none',
          }}
        >
          {/* Top Headline & Pill Group */}
          <div className="flex flex-col items-center space-y-4 max-w-3xl pt-4">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl shadow-inner">
              <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
              <span className="font-mono text-[11px] font-semibold tracking-widest text-white/90 uppercase">
                {scenario.badge}
              </span>
              <span className="text-white/30">|</span>
              <span className="font-mono text-[11px] tracking-wider text-white/60 uppercase">
                AUTONOMOUS COGNITIVE DEFENSE
              </span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.01em] text-white leading-[1.08] text-balance">
              Intelligence that{' '}
              <span className="italic text-[1.05em] tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-teal-200 to-white pr-1">
                {scenario.titleHighlight}
              </span>{' '}
              <br className="hidden sm:inline" />
              <span className="font-medium tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300">
                your capital.
              </span>
            </h1>

            <p className="font-sans text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed max-w-xl mx-auto text-balance tracking-[-0.01em]">
              Next-generation scam interception and autonomous financial defense. Sentinel safeguards your transactions before money moves—transparently, explainably, and without friction.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => setActiveTab(scenario.targetTab)}
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-wide text-black transition-all duration-300 bg-white hover:bg-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95"
              >
                <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                <span>Test Live Safety Simulator</span>
                <ArrowUpRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={scrollToAuth}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-5 py-3 text-sm font-medium tracking-wide text-white/90 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10 active:scale-95"
              >
                <span>Authenticate / Enter Network</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </button>
            </div>
          </div>

          {/* Clean Center Scroll Cue */}
          <div className="relative my-auto flex flex-col items-center justify-center pointer-events-none pb-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-white/40 uppercase">
              <span>Scroll down to Enter Auth Center</span>
              <ChevronDown className="h-3 w-3 animate-bounce" />
            </div>
          </div>
        </div>

        {/* ════ LAYER 2: AUTHENTICATION CENTER (Emerges on scroll) ════ */}
        <div
          className="absolute inset-0 z-20 flex flex-col justify-start items-center px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full transition-all duration-200 ease-out overflow-y-auto"
          style={{
            opacity: authEmergeProgress,
            transform: `scale(${authEmergeScale}) translateY(${authEmergeTranslateY}px)`,
            pointerEvents: isAuthInteractive ? 'auto' : 'none',
          }}
        >
          {/* Header Bar & Orbit Return */}
          <div className="w-full flex items-center justify-between border-b border-white/15 pb-3 mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_8px_#00d2ff] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-accent-cyan font-bold">
                {'// ENTER THE AEGIS INTELLIGENCE NETWORK'}
              </span>
            </div>

            <button
              onClick={scrollToHero}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-white transition-colors bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full hover:bg-white/20 shadow-sm"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Orbit View</span>
            </button>
          </div>

          {/* Main Auth Form Box with High-Contrast Dark Theme */}
          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#070b14]/95 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative shrink-0 ring-1 ring-white/10">
            
            {/* Tab Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-5">
              <div className="flex items-center gap-2 rounded-xl bg-black/50 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setActiveAuthTab('signin'); setErrorMessage(''); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                    activeTab === 'signin'
                      ? 'bg-accent-cyan text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign In to Platform
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveAuthTab('signup'); setErrorMessage(''); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
                    activeTab === 'signup'
                      ? 'bg-accent-cyan text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Create Real Account
                </button>
              </div>

              <span className="font-mono text-[10px] text-white/50 hidden sm:inline-flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" />
                PBKDF2-SHA256
              </span>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-400 animate-soft-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                    Email Address or User ID
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 h-4 w-4 text-white/50" />
                    <input
                      type="text"
                      required
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder="e.g. deepak.sharma or user@domain.com"
                      className="w-full rounded-xl border border-white/20 bg-[#0d1322] pl-10 pr-3.5 py-2.5 font-sans text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/80">
                      Password
                    </label>
                    <span className="font-mono text-[10px] text-accent-cyan/80 font-medium">Demo pass: aegis2026</span>
                  </div>
                  <div className="relative flex items-center">
                    <Key className="absolute left-3.5 h-4 w-4 text-white/50" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-white/20 bg-[#0d1322] pl-10 pr-10 py-2.5 font-sans text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3.5 text-white/50 hover:text-white transition-colors"
                    >
                      {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-cyan text-black py-3 font-sans text-sm font-bold shadow-lg hover:bg-accent-cyan/90 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="font-mono text-xs animate-pulse">CRYPTOGRAPHIC VERIFICATION…</span>
                  ) : (
                    <>
                      <span>Authenticate & Access Platform</span>
                      <ArrowRight className="h-4 w-4 text-black" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full rounded-xl border border-white/20 bg-[#0d1322] px-3.5 py-2.5 font-sans text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="alex.vance@sovereign.bank"
                      className="w-full rounded-xl border border-white/20 bg-[#0d1322] px-3.5 py-2.5 font-sans text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                      Password (6+ chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl border border-white/20 bg-[#0d1322] px-3.5 py-2.5 font-sans text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Confirm"
                      className="w-full rounded-xl border border-white/20 bg-[#0d1322] px-3.5 py-2.5 font-sans text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-cyan text-black py-3 font-sans text-sm font-bold shadow-lg hover:bg-accent-cyan/90 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="font-mono text-xs animate-pulse">CREATING SOVEREIGN ACCOUNT…</span>
                  ) : (
                    <>
                      <span>Create Real Account</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-950" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── 3 DISTINCT COLOR DEMO ACCOUNTS DIRECTLY BELOW AUTH ── */}
          <div className="w-full max-w-4xl mt-6 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                Demo Accounts · 1-Click Direct Login:
              </span>
              <span className="font-mono text-[9px] text-white/40">Select account to enter platform</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Account 1: Deepak (Emerald / Wealth) */}
              <div
                onClick={() => handleDemoAccountLogin('deepak')}
                className="group rounded-2xl border border-emerald-500/30 bg-[#04130e] hover:bg-[#07241b] p-3.5 cursor-pointer transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-between text-left shadow-lg"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 font-display font-bold text-xs border border-emerald-500/40 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    DS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {DEMO_PERSONAS.deepak.name}
                    </span>
                    <span className="font-mono text-[9px] text-emerald-400/80 truncate">
                      {DEMO_PERSONAS.deepak.role}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>

              {/* Account 2: Priya (Hyper Cyan / Treasury) */}
              <div
                onClick={() => handleDemoAccountLogin('priya')}
                className="group rounded-2xl border border-accent-cyan/30 bg-[#031522] hover:bg-[#06243b] p-3.5 cursor-pointer transition-all duration-300 hover:border-accent-cyan hover:shadow-[0_0_25px_rgba(0,210,255,0.25)] flex items-center justify-between text-left shadow-lg"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/15 text-accent-cyan font-display font-bold text-xs border border-accent-cyan/40 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(0,210,255,0.2)]">
                    PN
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs font-bold text-white group-hover:text-accent-cyan transition-colors truncate">
                      {DEMO_PERSONAS.priya.name}
                    </span>
                    <span className="font-mono text-[9px] text-cyan-300/80 truncate">
                      {DEMO_PERSONAS.priya.role}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-accent-cyan opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>

              {/* Account 3: Vikram (Sovereign Amber / Risk Officer) */}
              <div
                onClick={() => handleDemoAccountLogin('vikram')}
                className="group rounded-2xl border border-amber-500/30 bg-[#1a1205] hover:bg-[#2c1e08] p-3.5 cursor-pointer transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-between text-left shadow-lg"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 font-display font-bold text-xs border border-amber-500/40 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    VM
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {DEMO_PERSONAS.vikram.name}
                    </span>
                    <span className="font-mono text-[9px] text-amber-400/80 truncate">
                      {DEMO_PERSONAS.vikram.role}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
