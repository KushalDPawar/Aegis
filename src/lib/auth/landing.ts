import type { UserRole } from "@/lib/enums";

/**
 * Where each role belongs after authenticating.
 *
 * Customers and bank ops land on the Ascend platform clone (/platform).
 * Trusted contacts keep their dedicated review portal.
 */
export function landingPathForRole(role: UserRole | string): string {
  switch (role) {
    case "TRUSTED_CONTACT":
      return "/trusted/dashboard";
    case "BANK_OPS":
    case "CUSTOMER":
    default:
      return "/platform";
  }
}
