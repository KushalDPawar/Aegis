"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Alert } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/lib/actions/auth";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { landingPathForRole } from "@/lib/auth/landing";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setLoading(true);
    setError(null);
    const result = await loginAction({ email: loginEmail, password: loginPassword });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push(landingPathForRole(result.data.role));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          doLogin(email, password);
        }}
      >
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-cream-100/40 mb-2 text-center">Demo accounts</p>
        <div className="grid gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={loading}
              onClick={() => doLogin(acc.email, DEMO_PASSWORD)}
              className="text-left rounded-xl border border-white/10 hover:border-signal-teal/40 px-4 py-2.5 transition-colors disabled:opacity-50"
            >
              <span className="block text-sm text-cream-100">{acc.label}</span>
              <span className="block text-xs text-cream-100/45">{acc.hint} · {acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
