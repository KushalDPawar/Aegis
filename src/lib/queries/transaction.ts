import "server-only";
import { prisma } from "@/lib/db";

export async function getTransactionDetail(transactionId: string) {
  return prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      account: true,
      beneficiary: true,
      events: { orderBy: { createdAt: "asc" } },
      riskAssessments: { orderBy: { createdAt: "desc" }, include: { signals: true } },
      intentChecks: { orderBy: { sequence: "asc" } },
      interventions: { orderBy: { createdAt: "desc" } },
      incidents: { include: { scamPattern: true, recoveryCase: true } },
    },
  });
}

export type TransactionDetail = NonNullable<Awaited<ReturnType<typeof getTransactionDetail>>>;
