"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, readSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export async function registerCustomerAction(input: unknown): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, password, fullName, age, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const vulnerabilityProfile = age >= 60 ? "VULNERABLE" : age >= 45 ? "ELEVATED" : "STANDARD";

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CUSTOMER",
      profile: {
        create: {
          fullName,
          age,
          phone,
          vulnerabilityProfile,
          avatarSeed: fullName,
        },
      },
      accounts: {
        create: {
          accountNumber: String(Math.floor(100000000000 + Math.random() * 899999999999)),
          nickname: "Primary Savings",
          balance: 250_000,
          avgTxnAmount: 8_000,
          status: "ACTIVE",
        },
      },
    },
  });

  await createSession({ sub: user.id, email: user.email, role: user.role as UserRole });
  await logAudit({ userId: user.id, actorRole: "CUSTOMER", action: "REGISTER", target: `user:${user.id}` });

  return { ok: true, data: { userId: user.id } };
}

export async function loginAction(input: unknown): Promise<ActionResult<{ userId: string; role: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-shape error regardless of which check fails, to avoid
  // leaking whether an email is registered.
  const passwordOk = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva");
  if (!user || !passwordOk) {
    return { ok: false, error: "Invalid email or password." };
  }

  await createSession({ sub: user.id, email: user.email, role: user.role as UserRole });

  await prisma.sessionEvent.create({
    data: {
      userId: user.id,
      type: "LOGIN",
      label: "Customer login",
      severity: 0,
      metadata: JSON.stringify({ simulated: true }),
    },
  });
  await logAudit({ userId: user.id, actorRole: user.role, action: "LOGIN", target: `user:${user.id}` });

  return { ok: true, data: { userId: user.id, role: user.role } };
}

export async function logoutAction(): Promise<ActionResult> {
  const session = await readSession();
  if (session) {
    await logAudit({ userId: session.sub, actorRole: session.role, action: "LOGOUT", target: `user:${session.sub}` });
  }
  await destroySession();
  return { ok: true, data: undefined };
}
