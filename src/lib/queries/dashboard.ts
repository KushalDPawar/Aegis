import "server-only";
import { prisma } from "@/lib/db";

export async function getDashboardData(userId: string, accountId: string) {
  const [account, transactions, activeIncidents, recentInterventions, trustedContacts] = await Promise.all([
    prisma.account.findUniqueOrThrow({ where: { id: accountId } }),
    prisma.transaction.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        beneficiary: true,
        riskAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.incident.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { scamPattern: true, transaction: true },
    }),
    prisma.intervention.findMany({
      where: { transaction: { accountId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { transaction: { include: { beneficiary: true } } },
    }),
    prisma.trustedContact.count({ where: { accountId } }),
  ]);

  const pendingTransactions = transactions.filter((t) =>
    ["PENDING", "VERIFY_REQUIRED", "WARNED", "COOLING_PERIOD", "PAUSED"].includes(t.status)
  );

  return { account, transactions, activeIncidents, recentInterventions, trustedContacts, pendingTransactions };
}
