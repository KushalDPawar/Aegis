import { prisma } from "@/lib/db";

let counter = 0;
function unique(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createTestCustomer(overrides?: { balance?: number; avgTxnAmount?: number }) {
  const user = await prisma.user.create({
    data: {
      email: `${unique("customer")}@test.local`,
      passwordHash: "test-hash-not-a-real-password",
      role: "CUSTOMER",
      profile: {
        create: {
          fullName: "Test Customer",
          age: 40,
          phone: "+91 90000 00000",
          vulnerabilityProfile: "STANDARD",
          avatarSeed: "Test Customer",
        },
      },
      accounts: {
        create: {
          accountNumber: unique("acct"),
          nickname: "Primary",
          balance: overrides?.balance ?? 500_000,
          avgTxnAmount: overrides?.avgTxnAmount ?? 10_000,
          status: "ACTIVE",
        },
      },
    },
    include: { accounts: true },
  });
  return { user, account: user.accounts[0] };
}

export async function createTestBeneficiary(
  accountId: string,
  overrides?: Partial<{ isFirstTime: boolean; trustScore: number; suspiciousFlag: boolean }>
) {
  return prisma.beneficiary.create({
    data: {
      accountId,
      name: "Test Beneficiary",
      bankAccountNumber: unique("bank"),
      ifsc: "TEST0001234",
      isFirstTime: overrides?.isFirstTime ?? true,
      trustScore: overrides?.trustScore ?? 40,
      suspiciousFlag: overrides?.suspiciousFlag ?? false,
      category: "individual",
    },
  });
}

export async function createTestTransaction(accountId: string, beneficiaryId: string, amount = 10_000) {
  return prisma.transaction.create({
    data: { accountId, beneficiaryId, amount, purpose: "Test payment", status: "PENDING" },
  });
}
