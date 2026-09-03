"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Alert } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { addTrustedContactAction } from "@/lib/actions/trusted";

export function AddTrustedContactForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await addTrustedContactAction({ name, relationship, email, canApprove: true });
        setLoading(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setName("");
        setRelationship("");
        setEmail("");
        router.refresh();
      }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" htmlFor="tc-name">
          <Input id="tc-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </Field>
        <Field label="Relationship" htmlFor="tc-relationship">
          <Input id="tc-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} required placeholder="Daughter, Son, Spouse…" />
        </Field>
      </div>
      <Field label="Email" htmlFor="tc-email" hint="If this matches a registered trusted-contact account, they'll see paused payments in their own portal.">
        <Input id="tc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" loading={loading}>
        Add trusted contact
      </Button>
    </form>
  );
}
