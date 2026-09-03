import { redirect } from "next/navigation";
import Link from "next/link";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { landingPathForRole } from "@/lib/auth/landing";
import { LoginForm } from "./LoginForm";
import { ShieldMark } from "@/components/layout/Sidebar";

export default async function LoginPage() {
  const session = await readSession();
  // Only bounce an already-authenticated visitor onward if their user still
  // exists. A cookie can verify cryptographically and still be stale — after a
  // reseed, or once a user is deleted — and blindly trusting it deadlocks the
  // app: /login sends them to their dashboard, the dashboard finds no user and
  // sends them back, and the browser gives up on a blank page.
  if (session) {
    const stillExists = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true } });
    if (stillExists) redirect(landingPathForRole(session.role));
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <ShieldMark />
          <span className="font-display text-xl font-semibold text-cream-100">Aegis</span>
        </Link>
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-cream-100">Welcome back</h1>
          <p className="text-cream-100/55 text-sm mt-1.5">Sign in to your simulated banking session.</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <LoginForm />
        </div>
        <p className="text-center text-sm text-cream-100/45">
          New here?{" "}
          <Link href="/register" className="text-signal-teal hover:underline">
            Create a customer account
          </Link>
        </p>
      </div>
    </div>
  );
}
