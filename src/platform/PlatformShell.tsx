"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { IntelligenceProvider } from "./context/IntelligenceContext";
import { AppContent } from "./App";
import { logoutAction } from "@/lib/actions/auth";
import type { DbUser } from "./services/db";
import type { PlatformSessionUser } from "./types/session";
import "./platform.css";

export type { PlatformSessionUser };

function toDbUser(session: PlatformSessionUser): DbUser {
  return {
    id: session.id,
    email: session.email,
    name: session.name,
    userId: session.email.split("@")[0] || session.id,
    passwordHash: "",
    salt: "",
    accountNumber: session.accountNumber,
    tier: session.tier ?? "ELITE",
    role: session.role,
    clearanceLevel: session.clearanceLevel ?? "Level 3 Sovereign Clearance",
    phone: session.phone ?? "",
    balance: session.balance,
    isDemoAccount: session.isDemoAccount ?? true,
    createdAt: new Date().toISOString(),
    lastLogin: "Active session",
    twoFactorEnabled: true,
  };
}

/**
 * Exact clone of the Ascend/Sentinel authenticated platform UI,
 * seeded from the Next.js session so landing/auth stay yours.
 */
export function PlatformShell({ sessionUser }: { sessionUser: PlatformSessionUser }) {
  const router = useRouter();
  const initialUser = toDbUser(sessionUser);

  const handleLogout = useCallback(async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <div className="platform-root dark min-h-screen">
      <ThemeProvider>
        <AuthProvider initialUser={initialUser} onLogout={handleLogout} persistSession={false}>
          <IntelligenceProvider>
            <AppContent />
          </IntelligenceProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
