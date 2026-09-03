import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "./guard";
import type { PlatformSessionUser } from "@/platform/types/session";

/**
 * Any authenticated non–trusted-contact user may enter the cloned
 * Ascend platform shell (customers + bank ops).
 */
export async function requirePlatformUser(): Promise<PlatformSessionUser> {
  const session = await requireSession();
  if (session.role === "TRUSTED_CONTACT") {
    redirect("/trusted/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true, accounts: true },
  });
  if (!user) redirect("/login");

  const account = user.accounts[0];
  const roleLabel =
    session.role === "BANK_OPS"
      ? "Chief Risk & Compliance Officer"
      : "Executive Retail Client";
  const clearance =
    session.role === "BANK_OPS"
      ? "Full Fraud Forensic Override"
      : "Level 3 Sovereign Clearance";
  const tier = session.role === "BANK_OPS" ? "RISK OFFICER" : "ELITE";

  return {
    id: user.id,
    email: user.email,
    name: user.profile?.fullName ?? user.email.split("@")[0] ?? "Operator",
    role: roleLabel,
    accountNumber: account
      ? `ACC #${account.accountNumber.slice(-4)} · ${tier}`
      : `ACC #OPS · ${tier}`,
    balance: account?.balance ?? 5_210_000,
    phone: user.profile?.phone ?? null,
    clearanceLevel: clearance,
    tier,
    isDemoAccount: true,
  };
}
