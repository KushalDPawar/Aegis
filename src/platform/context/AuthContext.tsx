"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseService, DbUser } from '../services/db';

export interface DemoPersona {
  type: 'deepak' | 'priya' | 'vikram';
  name: string;
  role: string;
  accountNumber: string;
  tier: string;
  email: string;
  clearanceLevel: string;
  balance: number;
  badgeTone: 'emerald' | 'cyan' | 'amber';
  user: DbUser;
}

export const DEMO_PERSONAS: Record<'deepak' | 'priya' | 'vikram', DemoPersona> = {
  deepak: {
    type: 'deepak',
    name: 'Deepak Sharma',
    role: 'Executive Retail Client',
    accountNumber: 'ACC #4912 · ELITE',
    tier: 'ELITE',
    email: 'deepak.sharma@ascend.bank',
    clearanceLevel: 'Level 3 Sovereign Clearance',
    balance: 2845000,
    badgeTone: 'emerald',
    user: {
      id: 'usr-demo-vulnerable',
      userId: 'deepak.sharma',
      email: 'deepak.sharma@ascend.bank',
      name: 'Deepak Sharma',
      passwordHash: '',
      salt: '',
      accountNumber: 'ACC #4912 · ELITE',
      tier: 'ELITE',
      role: 'Executive Retail Client',
      clearanceLevel: 'Level 3 Sovereign Clearance',
      phone: '+91 98450 12948',
      balance: 2845000,
      isDemoAccount: true,
      createdAt: new Date().toISOString(),
      lastLogin: 'Today, 14:22 IST (Terminal 01)',
      twoFactorEnabled: true,
    },
  },
  priya: {
    type: 'priya',
    name: 'Priya Nair',
    role: 'Corporate Treasury Officer',
    accountNumber: 'ACC #8821 · TREASURY',
    tier: 'CORPORATE',
    email: 'priya.nair@chromastudios.com',
    clearanceLevel: 'Multi-Sig Corporate Approver',
    balance: 14500000,
    badgeTone: 'cyan',
    user: {
      id: 'usr-demo-stressed',
      userId: 'priya.treasury',
      email: 'priya.nair@chromastudios.com',
      name: 'Priya Nair',
      passwordHash: '',
      salt: '',
      accountNumber: 'ACC #8821 · TREASURY',
      tier: 'CORPORATE',
      role: 'Corporate Treasury Officer',
      clearanceLevel: 'Multi-Sig Corporate Approver',
      phone: '+91 98200 48192',
      balance: 14500000,
      isDemoAccount: true,
      createdAt: new Date().toISOString(),
      lastLogin: 'Today, 11:05 IST (Corporate Portal)',
      twoFactorEnabled: true,
    },
  },
  vikram: {
    type: 'vikram',
    name: 'Vikram Malhotra',
    role: 'Chief Risk & Compliance Officer',
    accountNumber: 'ACC #1004 · COMPLIANCE',
    tier: 'RISK OFFICER',
    email: 'vikram.malhotra@sentinel.ai',
    clearanceLevel: 'Full Fraud Forensic Override',
    balance: 5210000,
    badgeTone: 'amber',
    user: {
      id: 'usr-demo-healthy',
      userId: 'vikram.admin',
      email: 'vikram.malhotra@sentinel.ai',
      name: 'Vikram Malhotra',
      passwordHash: '',
      salt: '',
      accountNumber: 'ACC #1004 · COMPLIANCE',
      tier: 'RISK OFFICER',
      role: 'Chief Risk & Compliance Officer',
      clearanceLevel: 'Full Fraud Forensic Override',
      phone: '+91 99100 37190',
      balance: 5210000,
      isDemoAccount: true,
      createdAt: new Date().toISOString(),
      lastLogin: 'Today, 09:30 IST (Risk Station)',
      twoFactorEnabled: true,
    },
  },
};

interface AuthContextType {
  user: DbUser | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  verificationStep: 'idle' | 'identifying' | 'initializing';
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { name: string; email: string; password: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void | Promise<void>;
  switchDemoPersona: (personaType: 'deepak' | 'priya' | 'vikram') => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isProfileDrawerOpen: boolean;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser?: DbUser | null;
  onLogout?: () => void | Promise<void>;
  /** When false, skip IndexedDB/localStorage session (Next.js owns auth). */
  persistSession?: boolean;
}> = ({ children, initialUser = null, onLogout, persistSession = true }) => {
  const [user, setUser] = useState<DbUser | null>(initialUser);
  const [isInitializing, setIsInitializing] = useState(!initialUser);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'identifying' | 'initializing'>('idle');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsInitializing(false);
      return;
    }
    if (!persistSession) {
      setIsInitializing(false);
      return;
    }

    const initSession = async () => {
      try {
        const savedUserId = localStorage.getItem('aegis_session_userId');
        if (savedUserId) {
          const found = await DatabaseService.findUser(savedUserId);
          if (found) {
            setUser(found);
          }
        }
      } catch (err) {
        console.error('Error reading persistent session:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, [initialUser, persistSession]);

  useEffect(() => {
    if (!persistSession) return;
    if (user) {
      localStorage.setItem('aegis_session_userId', user.id);
    } else {
      localStorage.removeItem('aegis_session_userId');
    }
  }, [user, persistSession]);

  const triggerVerificationSequence = async (targetUser: DbUser) => {
    setIsVerifying(true);
    setVerificationStep('identifying');

    await new Promise((r) => setTimeout(r, 450));
    setVerificationStep('initializing');

    await new Promise((r) => setTimeout(r, 400));
    setUser(targetUser);
    setIsVerifying(false);
    setVerificationStep('idle');
    setIsAuthModalOpen(false);
    setIsProfileDrawerOpen(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const signIn = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!identifier.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both your email/user ID and password.' };
    }

    try {
      const res = await DatabaseService.verifyCredentials(identifier, password);
      if (!res.user) {
        return { success: false, error: res.error || 'Authentication failed. Please check credentials.' };
      }

      await DatabaseService.createSession(res.user.id);
      await triggerVerificationSequence(res.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Database handshake error. Please try again.' };
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return { success: false, error: 'Please provide a valid corporate or personal email address.' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters in length.' };
    }

    try {
      const res = await DatabaseService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'Executive Sovereign Client',
      });

      if (!res.user) {
        return { success: false, error: res.error || 'Failed to create user account.' };
      }

      await DatabaseService.createSession(res.user.id);
      await triggerVerificationSequence(res.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Database creation error. Please try again.' };
    }
  };

  const switchDemoPersona = async (personaType: 'deepak' | 'priya' | 'vikram') => {
    const persona = DEMO_PERSONAS[personaType];
    if (persona) {
      const dbUser = persistSession
        ? (await DatabaseService.findUser(persona.user.userId)) || persona.user
        : persona.user;
      await triggerVerificationSequence(dbUser);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsProfileDrawerOpen(false);
    if (onLogout) {
      await onLogout();
    }
  };

  // Avoid flashing unauthenticated chrome while hydrating a seeded session.
  if (isInitializing && !initialUser) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerifying,
        verificationStep,
        signIn,
        signUp,
        logout,
        switchDemoPersona,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileDrawerOpen,
        openProfileDrawer: () => setIsProfileDrawerOpen(true),
        closeProfileDrawer: () => setIsProfileDrawerOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
