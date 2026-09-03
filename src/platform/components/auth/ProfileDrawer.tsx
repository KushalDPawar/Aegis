import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import {
  Shield,
  User,
  LogOut,
  Sparkles,
  Lock,
  X,
  CreditCard,
  CheckCircle2,
  KeyRound,
  Building
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const ProfileDrawer: React.FC = () => {
  const { user, isProfileDrawerOpen, closeProfileDrawer, logout, switchDemoPersona } = useAuth();

  if (!isProfileDrawerOpen || !user) return null;

  const handleSwitchPersona = async (personaKey: 'deepak' | 'priya' | 'vikram') => {
    await switchDemoPersona(personaKey);
  };

  const handleLogout = async () => {
    closeProfileDrawer();
    await logout();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-soft-in select-none">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={closeProfileDrawer} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-hairlineStrong bg-paper-surface/95 dark:bg-[#090c14]/95 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/10 font-sans max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeProfileDrawer}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-paper-elevated text-ink-dim hover:text-ink hover:border-hairlineStrong transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* User Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-paper-bottom shadow-lg border border-accent-cyan/30 text-xl font-display font-black">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          <div className="flex flex-col min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg sm:text-xl font-bold text-ink truncate">
                {user.name}
              </h3>
              <StatusBadge
                label={user.tier}
                tone={user.tier === 'ELITE' ? 'emerald' : user.tier === 'CORPORATE' ? 'cyan' : 'amber'}
                size="sm"
              />
            </div>
            <span className="font-mono text-xs text-ink-dim mt-0.5">
              {user.role} · {user.accountNumber}
            </span>
            <span className="font-mono text-[10px] text-accent-cyan mt-1 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {user.clearanceLevel}
            </span>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="rounded-2xl border border-hairline bg-paper-elevated/60 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between border-b border-hairline/60 pb-2.5">
            <span className="font-mono text-[11px] text-ink-dim uppercase">Total Sovereign Balance</span>
            <span className="font-display text-lg font-bold text-ink">
              ₹{(user.balance || 2845000).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-ink-dim text-[10px] block">EMAIL / USER ID</span>
              <span className="text-ink font-semibold truncate block">{user.email || user.userId}</span>
            </div>
            <div>
              <span className="text-ink-dim text-[10px] block">DATABASE PERSISTENCE</span>
              <span className="text-emerald-500 font-semibold">STORED ON-DEVICE DB</span>
            </div>
            <div>
              <span className="text-ink-dim text-[10px] block">ACCOUNT TYPE</span>
              <span className="text-ink">{user.isDemoAccount ? 'Demo Account' : 'Real Sovereign'}</span>
            </div>
            <div>
              <span className="text-ink-dim text-[10px] block">LAST SESSION</span>
              <span className="text-ink">{user.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* ── DEMO ACCOUNT SWITCHER ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-dim flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent-cyan" />
              Switch Active Demo Account:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['deepak', 'priya', 'vikram'] as const).map((key) => {
              const p = DEMO_PERSONAS[key];
              const isCurrent = user.userId === p.user.userId;

              return (
                <button
                  key={key}
                  onClick={() => handleSwitchPersona(key)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'border-accent-cyan/60 bg-accent-cyan/10 ring-1 ring-accent-cyan/30'
                      : 'border-hairline bg-paper-surface/60 hover:bg-paper-elevated hover:border-hairlineStrong'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-sans text-xs font-bold text-ink truncate">
                      {p.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-ink-dim truncate">
                    {p.role.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-hairline">
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-2.5 font-sans text-xs font-bold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of Terminal</span>
          </button>

          <button
            onClick={closeProfileDrawer}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-ink text-paper-bottom hover:bg-ink/90 py-2.5 font-sans text-xs font-bold transition-colors"
          >
            <span>Close Window</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
