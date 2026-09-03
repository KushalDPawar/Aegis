import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { assertOwnsAccount, assertOwnsTransaction, AuthorizationError } from "@/lib/auth/guard";
import { createTestBeneficiary, createTestCustomer, createTestTransaction } from "./factory";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("authorization boundaries", () => {
  it("allows a user to access their own account", async () => {
    const { user, account } = await createTestCustomer();
    await expect(assertOwnsAccount(user.id, account.id)).resolves.toMatchObject({ id: account.id });
  });

  it("rejects a user attempting to access another customer's account", async () => {
    const { account: accountA } = await createTestCustomer();
    const { user: userB } = await createTestCustomer();
    await expect(assertOwnsAccount(userB.id, accountA.id)).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("rejects access to a transaction belonging to another customer's account", async () => {
    const { user: userA, account: accountA } = await createTestCustomer();
    const beneficiary = await createTestBeneficiary(accountA.id);
    const transaction = await createTestTransaction(accountA.id, beneficiary.id);

    const { user: userB } = await createTestCustomer();

    await expect(assertOwnsTransaction(userA.id, transaction.id)).resolves.toMatchObject({ id: transaction.id });
    await expect(assertOwnsTransaction(userB.id, transaction.id)).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("rejects access to a transaction that does not exist", async () => {
    const { user } = await createTestCustomer();
    await expect(assertOwnsTransaction(user.id, "does-not-exist")).rejects.toBeInstanceOf(AuthorizationError);
  });
});
