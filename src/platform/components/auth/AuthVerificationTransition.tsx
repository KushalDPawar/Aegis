import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

export const AuthVerificationTransition: React.FC = () => {
  const { isVerifying, verificationStep, user } = useAuth();

  if (!isVerifying) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-soft-in select-none font-sans text-white">
      {/* Background Cyber Scanning Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#00d2ff_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Center Holographic Verification Capsule */}
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-md w-full mx-4 rounded-3xl border border-accent-cyan/30 bg-[#07090e]/90 shadow-[0_0_80px_rgba(0,210,255,0.25)] ring-1 ring-white/10">
        
        {/* Animated Cyber Shield Hexagon */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ink border border-accent-cyan/50 text-accent-cyan shadow-[0_0_30px_rgba(0,210,255,0.4)] animate-pulse">
            {verificationStep === 'identifying' ? (
              <Shield className="h-10 w-10 text-accent-cyan animate-spin-slow" />
            ) : (
              <Cpu className="h-10 w-10 text-emerald-400 animate-bounce" />
            )}
          </div>
          
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400" />
          </span>
        </div>

        {/* Verification Status Feedback */}
        {verificationStep === 'identifying' ? (
          <div className="space-y-2 animate-soft-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 font-mono text-[10px] text-accent-cyan tracking-widest uppercase">
              <Sparkles className="h-3 w-3" />
              <span>CRYPTOGRAPHIC HANDSHAKE</span>
            </div>
            
            <h3 className="font-display text-2xl font-bold tracking-tight text-white mt-2">
              IDENTITY VERIFIED
            </h3>
            
            <p className="font-mono text-xs text-white/60">
              SHA-256 Signature Validated · Sovereign Key Matched
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-soft-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400 tracking-widest uppercase">
              <CheckCircle2 className="h-3 w-3" />
              <span>ACCESS GRANTED</span>
            </div>
            
            <h3 className="font-display text-2xl font-bold tracking-tight text-white mt-2">
              INITIALIZING AEGIS
            </h3>
            
            <p className="font-mono text-xs text-white/60">
              Loading Sovereign Defense Intelligence Matrix…
            </p>
          </div>
        )}

        {/* Dynamic Scanning Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              verificationStep === 'identifying'
                ? 'w-1/2 bg-accent-cyan shadow-[0_0_10px_#00d2ff]'
                : 'w-full bg-emerald-400 shadow-[0_0_10px_#34d399]'
            }`}
          />
        </div>

        {/* Terminal Telemetry Code Stamp */}
        <div className="mt-4 font-mono text-[10px] text-white/40 flex items-center justify-between w-full pt-2 border-t border-white/10">
          <span>PORT: 443 (TLS 1.3)</span>
          <span>ON-DEVICE ZERO-KNOWLEDGE</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
