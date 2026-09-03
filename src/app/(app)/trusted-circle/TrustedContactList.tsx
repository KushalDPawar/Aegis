"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TrustedContact } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { removeTrustedContactAction } from "@/lib/actions/trusted";

export function TrustedContactList({ contacts }: { contacts: TrustedContact[] }) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (contacts.length === 0) {
    return <p className="text-sm text-cream-100/45 py-6 text-center">No trusted contacts yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {contacts.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div>
            <p className="font-medium text-cream-100">{c.name}</p>
            <p className="text-xs text-cream-100/45">{c.relationship} · {c.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            loading={removingId === c.id}
            onClick={async () => {
              setRemovingId(c.id);
              await removeTrustedContactAction(c.id);
              setRemovingId(null);
              router.refresh();
            }}
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}
