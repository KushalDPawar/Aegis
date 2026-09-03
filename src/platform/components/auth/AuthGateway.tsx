import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import { useIntelligence } from '../../context/IntelligenceContext';
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
  Building,
  TrendingUp,
  Cpu,
  Mail
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const AuthGateway: React.FC = () => {
  const { signIn, signUp, switchDemoPersona, isVerifying, verificationStep } = useAuth();
  const { setActiveTab } = useIntelligence();

  const [activeTab, setActiveAuthTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('Executive Sovereign Client');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sign In Action
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInIdentifier.trim() || !signInPassword.trim()) {
      setErrorMessage('Please enter both your Email/User ID and password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const res = await signIn(signInIdentifier, signInPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Sign Up Action
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const res = await signUp({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      role: signUpRole,
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed. Please try again.');
    }
  };

  // 1-Click Demo Persona Login
  const handleDemoAccountLogin = async (key: 'deepak' | 'priya' | 'vikram') => {
    setErrorMessage('');
    setIsLoading(true);
    await switchDemoPersona(key);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-10 font-sans text-ink">
      
      {/* ── TOP BANNER & PLATFORM INTRO ── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 font-mono text-xs font-bold text-accent-cyan uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AEGIS SOVEREIGN INTELLIGENCE NETWORK</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-ink leading-tight">
          Secure Authentication &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-teal-400 to-emerald-400">
            Platform Gateway
          </span>
        </h1>

        <p className="font-sans text-sm sm:text-base text-ink-dim max-w-2xl mx-auto leading-relaxed font-light">
          Sign in using your institutional credentials or create a new account. Your identity and security preferences are hashed on-device using PBKDF2 with SHA-256 and stored securely in local database storage.
        </p>
      </div>

      {/* ── MAIN TWO-COLUMN AUTHENTICATION INTERFACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: REAL CREDENTIALS FORM (SIGN IN / SIGN UP) - 7 Cols */}
        <div className="lg:col-span-7 rounded-3xl border border-hairlineStrong bg-paper-surface/90 dark:bg-[#080b12]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
          
          {/* Header Switcher */}
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div className="flex items-center gap-2 rounded-xl bg-paper-elevated/70 p-1 border border-hairline">
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signin'); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all ${
                  activeTab === 'signin'
                    ? 'bg-ink text-paper-bottom shadow-md'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Sign In to Account
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signup'); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all ${
                  activeTab === 'signup'
                    ? 'bg-ink text-paper-bottom shadow-md'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Create New Account
              </button>
            </div>

            <span className="font-mono text-[10px] text-ink-dim hidden sm:inline-flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              PBKDF2-SHA256 SECURED
            </span>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-500 animate-soft-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Authentication Notice:</span>
                <p className="font-sans text-ink-muted">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* ════ TAB 1: SIGN IN FORM ════ */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Email Address or User ID
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-ink-dim" />
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="e.g. deepak.sharma or user@domain.com"
                    className="w-full rounded-xl border border-hairline bg-paper-elevated/70 pl-10 pr-4 py-2.5 font-sans text-xs sm:text-sm text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Account Password
                  </label>
                  <span className="font-mono text-[9px] text-ink-dim">
                    Demo Pass: <strong className="text-accent-cyan">aegis2026</strong>
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Key className="absolute left-3.5 h-4 w-4 text-ink-dim" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full rounded-xl border border-hairline bg-paper-elevated/70 pl-10 pr-10 py-2.5 font-sans text-xs sm:text-sm text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 text-ink-dim hover:text-ink transition-colors"
                  >
                    {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-ink text-paper-bottom py-3 font-sans text-xs sm:text-sm font-bold shadow-lg hover:bg-ink/90 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="font-mono text-xs animate-pulse">CRYPTOGRAPHIC VERIFICATION IN PROGRESS…</span>
                ) : (
                  <>
                    <span>Verify Credentials & Enter Platform</span>
                    <ArrowRight className="h-4 w-4 text-accent-cyan" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* ════ TAB 2: SIGN UP FORM ════ */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Full Legal Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 h-4 w-4 text-ink-dim" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full rounded-xl border border-hairline bg-paper-elevated/70 pl-10 pr-3.5 py-2.5 font-sans text-xs text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-ink-dim" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="alex.vance@sovereign.bank"
                      className="w-full rounded-xl border border-hairline bg-paper-elevated/70 pl-10 pr-3.5 py-2.5 font-sans text-xs text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Password (6+ chars)
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-hairline bg-paper-elevated/70 px-3.5 py-2.5 font-sans text-xs text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    Confirm Password
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-hairline bg-paper-elevated/70 px-3.5 py-2.5 font-sans text-xs text-ink placeholder:text-ink-dim focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Institutional Profile / Account Role
                </label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-paper-elevated/70 px-3.5 py-2.5 font-sans text-xs text-ink focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all"
                >
                  <option value="Executive Retail Client">Executive Retail Client (Personal Account)</option>
                  <option value="Corporate Treasury Officer">Corporate Treasury Officer (Multi-Sig)</option>
                  <option value="Chief Risk & Compliance Officer">Chief Risk & Compliance Officer (Admin / Auditor)</option>
                </select>
              </div>

              {/* Submit Sign Up */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-ink text-paper-bottom py-3 font-sans text-xs sm:text-sm font-bold shadow-lg hover:bg-ink/90 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="font-mono text-xs animate-pulse">CREATING SOVEREIGN ACCOUNT IN DATABASE…</span>
                ) : (
                  <>
                    <span>Create Persistent Account</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Security Guarantee Strip */}
          <div className="pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-ink-dim">
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-3 w-3" />
              IndexedDB Persistent Local Storage
            </span>
            <span>100,000 Iterations PBKDF2</span>
          </div>

        </div>

        {/* RIGHT COLUMN: REASSURANCE & FEATURES - 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="rounded-3xl border border-hairlineStrong bg-paper-surface/90 dark:bg-[#080b12]/90 p-6 sm:p-7 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_6px_#00d2ff]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink-dim">
                WHY AUTHENTICATION MATTERS
              </span>
            </div>

            <h3 className="font-display text-xl font-bold text-ink">
              Multi-Layered Sovereign Protection
            </h3>

            <p className="font-sans text-xs sm:text-sm text-ink-dim leading-relaxed font-light">
              AEGIS creates an isolated cognitive security vault for each account. Your financial health telemetry, behavioral risk parameters, and fraud rules remain encrypted locally on your browser.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl border border-hairline bg-paper-elevated/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-ink">Persistent Browser Storage</h4>
                  <p className="font-mono text-[10px] text-ink-dim mt-0.5">
                    No need to re-type credentials every time. Sessions persist safely.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl border border-hairline bg-paper-elevated/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-ink">Zero Data Leakage</h4>
                  <p className="font-mono text-[10px] text-ink-dim mt-0.5">
                    Passwords are never stored in plaintext. Cryptographic salts protect hashes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl border border-hairline bg-paper-elevated/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs">
                  03
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-ink">Demo & Real Separation</h4>
                  <p className="font-mono text-[10px] text-ink-dim mt-0.5">
                    Test hackathon scenarios with demo personas, or use your real workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 3 DISTINCT COLORED DEMO ACCOUNTS ── */}
      <div className="pt-6 border-t border-hairline space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-cyan" />
            <h3 className="font-display text-lg font-bold text-ink">
              1-Click Demo Accounts (Select to Enter Platform)
            </h3>
          </div>
          <span className="font-mono text-xs text-ink-dim">
            Default Password for all: <strong className="text-accent-cyan">aegis2026</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Account 1: Deepak Sharma (Emerald / Mint) */}
          <div
            onClick={() => handleDemoAccountLogin('deepak')}
            className="group rounded-3xl border border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-950/20 p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 font-display font-black text-sm border border-emerald-500/40 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  DS
                </div>
                <span className="font-mono text-[9px] text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-bold uppercase">
                  ELITE CLIENT
                </span>
              </div>

              <div>
                <h4 className="font-display text-base sm:text-lg font-bold text-ink group-hover:text-emerald-400 transition-colors">
                  {DEMO_PERSONAS.deepak.name}
                </h4>
                <span className="font-mono text-xs text-emerald-500/80 block mt-0.5">
                  {DEMO_PERSONAS.deepak.role}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-ink-dim border-t border-hairline pt-3">
                <div className="flex justify-between">
                  <span>ACCOUNT</span>
                  <span className="text-ink font-semibold">{DEMO_PERSONAS.deepak.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLEARANCE</span>
                  <span className="text-ink font-semibold">{DEMO_PERSONAS.deepak.clearanceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>LIQUIDITY</span>
                  <span className="text-emerald-400 font-semibold">₹{(DEMO_PERSONAS.deepak.balance).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-emerald-500/20 flex items-center justify-between font-mono text-xs font-bold text-emerald-400">
              <span>Sign In as Deepak</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Account 2: Priya Nair (Hyper Cyan / Electric Sky) */}
          <div
            onClick={() => handleDemoAccountLogin('priya')}
            className="group rounded-3xl border border-accent-cyan/30 bg-cyan-950/10 hover:bg-cyan-950/20 p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:border-accent-cyan hover:shadow-[0_0_25px_rgba(0,210,255,0.2)] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-cyan/15 text-accent-cyan font-display font-black text-sm border border-accent-cyan/40 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(0,210,255,0.2)]">
                  PN
                </div>
                <span className="font-mono text-[9px] text-accent-cyan px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 font-bold uppercase">
                  TREASURY
                </span>
              </div>

              <div>
                <h4 className="font-display text-base sm:text-lg font-bold text-ink group-hover:text-accent-cyan transition-colors">
                  {DEMO_PERSONAS.priya.name}
                </h4>
                <span className="font-mono text-xs text-cyan-400/80 block mt-0.5">
                  {DEMO_PERSONAS.priya.role}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-ink-dim border-t border-hairline pt-3">
                <div className="flex justify-between">
                  <span>ACCOUNT</span>
                  <span className="text-ink font-semibold">{DEMO_PERSONAS.priya.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLEARANCE</span>
                  <span className="text-ink font-semibold">{DEMO_PERSONAS.priya.clearanceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>LIQUIDITY</span>
                  <span className="text-emerald-400 font-semibold">₹{(DEMO_PERSONAS.priya.balance).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-accent-cyan/20 flex items-center justify-between font-mono text-xs font-bold text-accent-cyan">
              <span>Sign In as Priya</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Account 3: Vikram Malhotra (Sovereign Amber / Gold) */}
          <div
            onClick={() => handleDemoAccountLogin('vikram')}
            className="group rounded-3xl border border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/20 p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 font-display font-black text-sm border border-amber-500/40 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                  VM
                </div>
                <span className="font-mono text-[9px] text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-bold uppercase">
                  RISK & COMPLIANCE
                </span>
              </div>

              <div>
                <h4 className="font-display text-base sm:text-lg font-bold text-ink group-hover:text-amber-400 transition-colors">
                  {DEMO_PERSONAS.vikram.name}
                </h4>
                <span className="font-mono text-xs text-amber-400/80 block mt-0.5">
                  {DEMO_PERSONAS.vikram.role}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-ink-dim border-t border-hairline pt-3">
                <div className="flex justify-between">
                  <span>ACCOUNT</span>
                  <span className="text-ink font-semibold">{DEMO_PERSONAS.vikram.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLEARANCE</span>
                  <span className="text-ink font-semibold">{DEMO_PERSONAS.vikram.clearanceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>LIQUIDITY</span>
                  <span className="text-emerald-400 font-semibold">₹{(DEMO_PERSONAS.vikram.balance).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-amber-500/20 flex items-center justify-between font-mono text-xs font-bold text-amber-400">
              <span>Sign In as Vikram</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
