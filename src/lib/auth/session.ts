import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/enums";

const COOKIE_NAME = "aegis_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret =
    process.env.AUTH_SECRET ||
    // Soft fallback so a fresh Vercel deploy still boots; set AUTH_SECRET in the
    // Vercel project env for any real/public demo.
    (process.env.VERCEL ? "aegis-vercel-demo-secret-set-AUTH_SECRET-in-dashboard" : "");
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured. Set it in .env before starting the app.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch {
    // Expired, tampered, or malformed token — treat as logged out rather than throwing.
    return null;
  }
}
