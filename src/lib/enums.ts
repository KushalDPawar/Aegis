// SQLite has no native enum support, so these mirror the "enum-like" string
// columns in prisma/schema.prisma. Keep in sync with that file.

export type UserRole = "CUSTOMER" | "TRUSTED_CONTACT" | "BANK_OPS";
export type VulnerabilityProfile = "STANDARD" | "ELEVATED" | "VULNERABLE";
export type AccountStatus = "ACTIVE" | "PROTECTED" | "RESTRICTED";
export type TransactionStatus =
  | "PENDING"
  | "ALLOWED"
  | "VERIFY_REQUIRED"
  | "WARNED"
  | "COOLING_PERIOD"
  | "PAUSED"
  | "ESCALATED"
  | "COMPLETED"
  | "CANCELLED";
export type IncidentStatus = "ACTIVE" | "CONTAINED" | "RESOLVED";
export type RecoveryStatus = "OPENED" | "CONTAINED" | "BANK_REVIEW" | "RESTORATION" | "RESOLVED";
