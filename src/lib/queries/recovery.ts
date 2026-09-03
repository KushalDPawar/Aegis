import "server-only";
import { prisma } from "@/lib/db";
import { isBeneficiaryEssential } from "@/lib/continuity";

export async function getRecoveryData(accountId: string) {
  const [account, cases, beneficiaries] = await Promise.all([
    prisma.account.findUniqueOrThrow({ where: { id: accountId } }),
    prisma.recoveryCase.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      include: { events: { orderBy: { timestamp: "asc" } }, incident: { include: { scamPattern: true } } },
    }),
    prisma.beneficiary.findMany({ where: { accountId } }),
  ]);

  const activeCase = cases.find((c) => c.status !== "RESOLVED") ?? cases[0] ?? null;
  const essentialBeneficiaries = beneficiaries.filter((b) => isBeneficiaryEssential(b));
  const restrictedBeneficiaries = beneficiaries.filter((b) => !isBeneficiaryEssential(b));

  return { account, cases, activeCase, essentialBeneficiaries, restrictedBeneficiaries };
}
