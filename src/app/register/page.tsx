import { redirect } from "next/navigation";
import Link from "next/link";
import { readSession } from "@/lib/auth/session";
import { RegisterForm } from "./RegisterForm";
import { ShieldMark } from "@/components/layout/Sidebar";

export default async function RegisterPage() {
  const session = await readSession();
  if (session) redirect(session.role === "TRUSTED_CONTACT" ? "/trusted/dashboard" : "/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <ShieldMark />
          <span className="font-display text-xl font-semibold text-cream-100">Aegis</span>
        </Link>
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-cream-100">Create your account</h1>
          <p className="text-cream-100/55 text-sm mt-1.5">A new simulated banking profile — no real financial data required.</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-cream-100/45">
          Already have an account?{" "}
          <Link href="/login" className="text-signal-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
