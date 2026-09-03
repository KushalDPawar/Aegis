"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className={className ?? "text-sm text-cream-100/50 hover:text-cream-100 transition-colors"}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await logoutAction();
        router.push("/");
        router.refresh();
      }}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
