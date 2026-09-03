import { requireBankOps } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { ConsoleShell } from "@/components/console/ConsoleShell";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireBankOps();
  const alertCount = await prisma.incident.count({ where: { status: "ACTIVE" } });

  return (
    <ConsoleShell operatorName={profile?.fullName ?? "Operator"} alertCount={alertCount}>
      {children}
    </ConsoleShell>
  );
}
