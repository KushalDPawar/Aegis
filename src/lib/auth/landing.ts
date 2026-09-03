import type { UserRole } from "@/lib/enums";

/**
 * Where each role belongs after authenticating.
 *
 * Single source of truth: the login page, the login form and the guards all
 * read this. Previously the mapping was written out twice as a ternary that
 * only knew about TRUSTED_CONTACT, so a BANK_OPS user was sent to /dashboard —
 * which bounces non-customers straight back out, leaving the console
 * unreachable by signing in.
 */
export function landingPathForRole(role: UserRole | string): string {
  switch (role) {
    case "TRUSTED_CONTACT":
      return "/trusted/dashboard";
    case "BANK_OPS":
      return "/console";
    default:
      return "/dashboard";
  }
}
