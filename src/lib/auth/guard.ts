import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { readSession, type SessionPayload } from "./session";

export class AuthorizationError extends Error {}

/**
 * A cookie that verifies but no longer points at a real user.
 *
 * The cookie deliberately is *not* cleared here: Next.js forbids writing
 * cookies during a Server Component render, so the attempt would throw. The
 * loop this used to cause is broken on the /login side instead, which
 * re-checks that the session's user still exists before redirecting anyone
 * back into the app. See `src/app/login/page.tsx`.
 */
function abandonStaleSession(): never {
  redirect("/login");
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireCustomer() {
  const session = await requireSession();
  if (session.role !== "CUSTOMER") redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true, accounts: true },
  });
  if (!user || !user.profile || user.accounts.length === 0) return abandonStaleSession();
  return { session, user, profile: user.profile, account: user.accounts[0] };
}

/**
 * Bank operations console access. The console reads across *every* customer,
 * so this is the one guard that intentionally has no per-account ownership
 * check — which is exactly why it must be gated on the role and nothing else.
 */
export async function requireBankOps() {
  const session = await requireSession();
  if (session.role !== "BANK_OPS") redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { profile: true },
  });
  if (!user) return abandonStaleSession();
  return { session, user, profile: user.profile };
}

export async function requireTrustedContact() {
  const session = await requireSession();
  if (session.role !== "TRUSTED_CONTACT") redirect("/");
  return session;
}

/**
 * Confirms `userId` owns `accountId` before any privileged read/write.
 * Throws rather than silently no-op'ing so callers can't accidentally
 * proceed against another customer's account.
 */
export async function assertOwnsAccount(userId: string, accountId: string) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId) {
    throw new AuthorizationError("You do not have access to this account.");
  }
  return account;
}

export async function assertOwnsTransaction(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true },
  });
  if (!transaction || transaction.account.userId !== userId) {
    throw new AuthorizationError("You do not have access to this transaction.");
  }
  return transaction;
}
