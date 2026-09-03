import React, { useEffect, useRef, useState } from 'react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  TrendingUp,
  Cpu,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  Activity,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Radio
} from 'lucide-react';

export const SovereignCommandNexus: React.FC = () => {
  const { currentScenarioId, setActiveTab } = useIntelligence();
  const { user } = useAuth();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic telemetry based on active scenario
  const getScenarioTelemetry = () => {
    switch (currentScenarioId) {
      case 'digital_arrest':
        return {
          status: 'SYNDICATE INTERCEPT ACTIVE',
          statusTone: 'rose',
          metricTitle: 'Threat Coercion Deflected',
          metricValue: '₹2,40,000',
          metricSubtext: '12 min old Mule Account flagged & isolated',
          latency: '14ms Neural Intercept',
          targetSector: 'fraud' as const,
        };
      case 'fake_kyc':
        return {
          status: 'MALICIOUS GATEWAY QUARANTINED',
          statusTone: 'rose',
          metricTitle: 'Phishing Vector Blocked',
          metricValue: '₹45,000',
          metricSubtext: 'Fake NPCI PAN-linking payload neutralized',
          latency: '9ms Sandbox Isolate',
          targetSector: 'fraud' as const,
        };
      case 'financial_distress':
        return {
          status: 'LIQUIDITY STABILIZATION RUNNING',
          statusTone: 'amber',
          metricTitle: 'Emergency Runway Buffer',
          metricValue: '1.56 Months',
          metricSubtext: 'Discretionary outflows contracted by 28%',
          latency: 'Predictive Cashflow Model',
          targetSector: 'health' as const,
        };
      case 'legitimate_vendor':
      default:
        return {
          status: 'SOVEREIGN CAPITAL INSULATED',
          statusTone: 'emerald',
          metricTitle: 'Active Capital Shield',
          metricValue: `₹${(user?.balance || 2845000).toLocaleString('en-IN')}`,
          metricSubtext: 'Zero coercive friction across all channels',
          latency: '100% On-Device ZK Verified',
          targetSector: 'fraud' as const,
        };
    }
  };

  const tele = getScenarioTelemetry();

  // 3D Canvas Interactive Quantum Shield & Lattice (Emerald / Gold / Mint palette)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 380);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Quantum Lattice Nodes (Emerald & Gold)
    const NUM_HEX_POINTS = 64;
    const hexPoints: { x: number; y: number; z: number; ring: number; angle: number; speed: number }[] = [];

    for (let i = 0; i < NUM_HEX_POINTS; i++) {
      const ring = (i % 3) + 1;
      const angle = ((Math.PI * 2) / (NUM_HEX_POINTS / 3)) * (i % 21);
      const radius = ring * 45;
      hexPoints.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 80,
        ring: ring,
        angle: angle,
        speed: (0.008 / ring) * (i % 2 === 0 ? 1 : -1),
      });
    }

    // Orbiting Data Packets
    const packets = [
      { radius: 155, angle: 0, speed: 0.015, color: '#10b981', label: 'RTGS' },
      { radius: 190, angle: Math.PI / 2, speed: -0.012, color: '#f59e0b', label: 'UPI' },
      { radius: 220, angle: Math.PI, speed: 0.009, color: '#00d2ff', label: 'ZK-PROOF' },
    ];

    let time = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    const render = () => {
      time += 0.016;

      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      smoothMouseX += (mousePos.x - smoothMouseX) * 0.05;
      smoothMouseY += (mousePos.y - smoothMouseY) * 0.05;

      // ── Emerald & Gold Radial Core Glow ──
      const coreGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.min(width, height) * 0.48
      );
      coreGlow.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
      coreGlow.addColorStop(0.35, 'rgba(245, 158, 11, 0.05)');
      coreGlow.addColorStop(0.7, 'rgba(6, 78, 59, 0.02)');
      coreGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width, height) * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // ── Concentric Hexagonal Shield Rings ──
      const hexRadii = [60, 110, 160];
      for (let h = 0; h < hexRadii.length; h++) {
        const radius = hexRadii[h];
        const rot = time * (0.15 / (h + 1)) * (h % 2 === 0 ? 1 : -1) + smoothMouseX * 0.4;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rot);
        
        ctx.beginPath();
        for (let side = 0; side < 6; side++) {
          const a = (Math.PI / 3) * side;
          const px = Math.cos(a) * radius;
          const py = Math.sin(a) * radius;
          if (side === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        ctx.strokeStyle = h === 1 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 10]);
        ctx.stroke();
        ctx.restore();
      }

      // ── 3D Quantum Lattice Particles ──
      for (let i = 0; i < hexPoints.length; i++) {
        const p = hexPoints[i];
        p.angle += p.speed;

        const baseR = p.ring * 48;
        const x0 = Math.cos(p.angle) * baseR;
        const y0 = Math.sin(p.angle) * baseR;

        // 3D Tilt with mouse
        const tiltX = smoothMouseY * 0.35;
        const tiltY = smoothMouseX * 0.35;

        const cosY = Math.cos(time * 0.2 + tiltY);
        const sinY = Math.sin(time * 0.2 + tiltY);
        const cosX = Math.cos(tiltX);
        const sinX = Math.sin(tiltX);

        let x1 = x0 * cosY + p.z * sinY;
        let z1 = -x0 * sinY + p.z * cosY;
        let y1 = y0 * cosX - z1 * sinX;

        const fov = 350;
        const scale = fov / (fov + z1 + 50);
        const px = centerX + x1 * scale;
        const py = centerY + y1 * scale;

        const isGold = i % 3 === 0;
        const alpha = Math.max(0.2, Math.min(0.9, (z1 + 100) / 200));

        ctx.fillStyle = isGold
          ? `rgba(245, 158, 11, ${alpha})`
          : `rgba(52, 211, 153, ${alpha})`;
        
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, 2 * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Orbiting Encrypted Data Streams ──
      for (let k = 0; k < packets.length; k++) {
        const pkt = packets[k];
        pkt.angle += pkt.speed;

        const px = centerX + Math.cos(pkt.angle) * pkt.radius;
        const py = centerY + Math.sin(pkt.angle) * (pkt.radius * 0.52);

        // Orbit path line
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, pkt.radius, pkt.radius * 0.52, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.stroke();

        // Packet head glow
        ctx.fillStyle = pkt.color;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(pkt.label, px + 7, py + 3);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className="relative w-full rounded-3xl border border-emerald-500/30 bg-[#06080d] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-white select-none"
    >
      {/* Dynamic Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85 z-0"
      />

      {/* Cyberpunk Grid Mesh Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* ── FOREGROUND TELEMETRY & COMMAND CONTENT ── */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[320px] space-y-6">
        
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase">
                  SOVEREIGN DEFENSE NEXUS · CORE ONLINE
                </span>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>
              <p className="font-mono text-[10px] text-white/50">
                Continuous On-Device Zero-Knowledge Neural Monitoring
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 font-mono text-[10px] text-white/70 self-start sm:self-auto">
            <Radio className="h-3 w-3 text-emerald-400 animate-ping" />
            <span>{tele.latency}</span>
          </div>
        </div>

        {/* Center Live Telemetry Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
          
          {/* Left Hero Status (7 Cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] text-emerald-300 font-bold uppercase">
              <Sparkles className="h-3 w-3" />
              <span>{tele.status}</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Sovereign Capital Shielded.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 font-light">
                Zero Unauthorized Outflows.
              </span>
            </h2>

            <p className="font-sans text-xs sm:text-sm text-white/70 max-w-lg leading-relaxed font-light">
              Your accounts are currently protected by our multi-layered cognitive security fabric. All transaction patterns are vetted on-device without exposing personal banking keys.
            </p>
          </div>

          {/* Right Live Gauge Card (5 Cols) */}
          <div className="md:col-span-5 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-white/50 uppercase">
              <span>{tele.metricTitle}</span>
              <span className="text-emerald-400 font-bold">100% SECURE</span>
            </div>

            <div className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {tele.metricValue}
            </div>

            <p className="font-mono text-[11px] text-white/60">
              {tele.metricSubtext}
            </p>

            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full w-4/5 shadow-[0_0_10px_#34d399]" />
            </div>
          </div>

        </div>

        {/* Bottom Quick-Action Sector Launch Bar */}
        <div className="pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            DIRECT CAPABILITY LAUNCH:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('fraud')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-xs font-bold transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>01. Fraud Intercept</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold transition-all"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>02. Runway Health</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('ai-center')}
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-bold transition-all"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>03. ZK Governance</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
