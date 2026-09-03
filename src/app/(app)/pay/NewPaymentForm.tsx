"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Beneficiary } from "@prisma/client";
import { Field, Input, Select, Textarea, Alert } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { addBeneficiaryAction } from "@/lib/actions/beneficiaries";
import { createPaymentAction } from "@/lib/actions/payments";
import { maskAccountNumber, formatINR } from "@/lib/format";

export function NewPaymentForm({
  beneficiaries,
  accountBalance,
}: {
  beneficiaries: Beneficiary[];
  accountBalance: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "new">(beneficiaries.length ? "existing" : "new");
  const [beneficiaryId, setBeneficiaryId] = useState(beneficiaries[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [relationship, setRelationship] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let targetBeneficiaryId = beneficiaryId;

      if (mode === "new") {
        const result = await addBeneficiaryAction({
          name: newName,
          bankAccountNumber: newAccount,
          ifsc: newIfsc,
          relationship,
          category: "individual",
        });
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
        targetBeneficiaryId = result.data.beneficiaryId;
      }

      if (!targetBeneficiaryId) {
        setError("Select or add a beneficiary.");
        setLoading(false);
        return;
      }

      const paymentResult = await createPaymentAction({
        beneficiaryId: targetBeneficiaryId,
        amount: Number(amount),
        purpose,
      });
      if (!paymentResult.ok) {
        setError(paymentResult.error);
        setLoading(false);
        return;
      }

      router.push(`/pay/${paymentResult.data.transactionId}/risk`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex gap-2" role="tablist" aria-label="Beneficiary selection mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "existing"}
          onClick={() => setMode("existing")}
          disabled={beneficiaries.length === 0}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium border transition-colors disabled:opacity-40 ${
            mode === "existing" ? "border-signal-teal/60 bg-signal-teal/10 text-cream-100" : "border-white/12 text-cream-100/60"
          }`}
        >
          Existing beneficiary
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "new"}
          onClick={() => setMode("new")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium border transition-colors ${
            mode === "new" ? "border-signal-teal/60 bg-signal-teal/10 text-cream-100" : "border-white/12 text-cream-100/60"
          }`}
        >
          New beneficiary
        </button>
      </div>

      {mode === "existing" ? (
        <Field label="Beneficiary" htmlFor="beneficiaryId">
          <Select id="beneficiaryId" value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)} required>
            {beneficiaries.length === 0 && <option value="">No beneficiaries yet</option>}
            {beneficiaries.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {maskAccountNumber(b.bankAccountNumber)}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <div className="space-y-4">
          <Field label="Beneficiary name" htmlFor="newName">
            <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} required minLength={2} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Account number" htmlFor="newAccount">
              <Input id="newAccount" value={newAccount} onChange={(e) => setNewAccount(e.target.value)} required inputMode="numeric" />
            </Field>
            <Field label="IFSC" htmlFor="newIfsc">
              <Input id="newIfsc" value={newIfsc} onChange={(e) => setNewIfsc(e.target.value.toUpperCase())} required placeholder="HDFC0001234" />
            </Field>
          </div>
          <Field label="Relationship (optional)" htmlFor="relationship" hint="e.g. Contractor, Friend, Family">
            <Input id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          </Field>
        </div>
      )}

      <Field label="Amount (₹)" htmlFor="amount" hint={`Available balance: ${formatINR(accountBalance)}`}>
        <Input id="amount" type="number" min={1} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </Field>

      <Field label="Purpose" htmlFor="purpose" hint="A short description of what this payment is for.">
        <Textarea id="purpose" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} required minLength={3} />
      </Field>

      {error && <Alert tone="error">{error}</Alert>}

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Continue to Sentinel review
      </Button>
    </form>
  );
}
