import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Mail
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, switchDemoPersona } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please provide both your Email/User ID and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await signIn(identifier, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
    } else {
      setIdentifier('');
      setPassword('');
      closeAuthModal();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await signUp({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    } else {
      closeAuthModal();
    }
  };

  const handleDemoLogin = async (key: 'deepak' | 'priya' | 'vikram') => {
    setErrorMessage('');
    setIsLoading(true);
    await switchDemoPersona(key);
    setIsLoading(false);
    closeAuthModal();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-soft-in select-none">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-[#070b14]/95 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 font-sans text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-accent-cyan border border-accent-cyan/30 shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-black tracking-tight text-white">
                AEGIS
              </span>
              <span className="font-mono text-[10px] font-bold tracking-widest text-accent-cyan uppercase">
                {'// SOVEREIGN AUTH GATEWAY'}
              </span>
            </div>
            <p className="font-mono text-[10px] text-white/50 tracking-wider">
              PERSISTENT DATABASE-BACKED ENCRYPTION
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 rounded-xl bg-black/50 p-1 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
              activeTab === 'signin'
                ? 'bg-accent-cyan text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition-all ${
              activeTab === 'signup'
                ? 'bg-accent-cyan text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-400 animate-soft-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-sans leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                Email Address or User ID
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. deepak.sharma or user@domain.com"
                  className="w-full rounded-xl border border-white/20 bg-[#0d1322] pl-10 pr-3.5 py-2 font-sans text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Key className="absolute left-3.5 h-4 w-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (e.g. aegis2026)"
                  className="w-full rounded-xl border border-white/20 bg-[#0d1322] pl-10 pr-10 py-2 font-sans text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-cyan text-black py-2.5 font-sans text-xs sm:text-sm font-bold shadow-md hover:bg-accent-cyan/90 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="font-mono text-xs animate-pulse">CRYPTOGRAPHIC VERIFICATION…</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="h-4 w-4 text-black" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                Full Legal Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full rounded-xl border border-white/20 bg-[#0d1322] pl-10 pr-3.5 py-2 font-sans text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-white/50" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="alex.vance@sovereign.bank"
                  className="w-full rounded-xl border border-white/20 bg-[#0d1322] pl-10 pr-3.5 py-2 font-sans text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                  Password (6+ chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/20 bg-[#0d1322] px-3 py-2 font-sans text-xs text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="Confirm"
                  className="w-full rounded-xl border border-white/20 bg-[#0d1322] px-3 py-2 font-sans text-xs text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-cyan text-black py-2.5 font-sans text-xs sm:text-sm font-bold shadow-md hover:bg-accent-cyan/90 active:scale-[0.99] transition-all disabled:opacity-50"
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

        {/* ── DEMO ACCOUNTS ── */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent-cyan" />
              Demo Accounts (Direct Login):
            </span>
            <span className="font-mono text-[9px] text-white/40">PWD: aegis2026</span>
          </div>

          <div className="space-y-1.5">
            {(['deepak', 'priya', 'vikram'] as const).map((key) => {
              const p = DEMO_PERSONAS[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDemoLogin(key)}
                  className="group w-full flex items-center justify-between p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-accent-cyan/50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white font-display font-bold text-xs border border-accent-cyan/40">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans text-xs font-bold text-white group-hover:text-accent-cyan transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="font-mono text-[9px] text-white/50">
                          ({p.accountNumber})
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-white/60 truncate">
                        {p.role} · ₹{p.balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    Sign In →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-white/40">
          <div className="flex items-center gap-1 text-emerald-400">
            <Lock className="h-2.5 w-2.5" />
            <span>256-BIT PBKDF2 HASHING</span>
          </div>
          <span>PERSISTENT DATABASE BACKED</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
