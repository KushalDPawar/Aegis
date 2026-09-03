"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Alert } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { registerCustomerAction } from "@/lib/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await registerCustomerAction({ fullName, age: Number(age), phone, email, password });
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }}
    >
      <Field label="Full name" htmlFor="fullName">
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Age" htmlFor="age">
          <Input id="age" type="number" min={18} max={110} value={age} onChange={(e) => setAge(e.target.value)} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </Field>
      </div>
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </Field>
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Create account
      </Button>
    </form>
  );
}
