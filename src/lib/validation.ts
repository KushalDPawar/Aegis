import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().trim().min(2, "Enter your full name.").max(80),
  age: z.coerce.number().int().min(18, "Must be 18 or older.").max(110),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number."),
});

export const beneficiarySchema = z.object({
  name: z.string().trim().min(2).max(80),
  bankAccountNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{9,18}$/, "Enter a valid account number (9-18 digits)."),
  ifsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code."),
  relationship: z.string().trim().max(60).optional(),
  category: z.enum(["individual", "biller", "merchant"]).default("individual"),
});

export const paymentSchema = z.object({
  beneficiaryId: z.string().min(1, "Select a beneficiary."),
  amount: z.coerce.number().positive("Amount must be greater than zero.").max(10_000_000),
  purpose: z.string().trim().min(3, "Describe the purpose of this payment.").max(200),
});

export const intentAnswerSchema = z.object({
  transactionId: z.string().min(1),
  answer: z.string().trim().min(1, "Please share a short answer.").max(600),
});

export const trustedContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  relationship: z.string().trim().min(2).max(60),
  email: emailSchema,
  canApprove: z.coerce.boolean().default(true),
});

export const guardChoiceSchema = z.object({
  transactionId: z.string().min(1),
  choice: z.enum([
    "keep_paused",
    "contact_trusted",
    "continue_after_cooling",
    "cancel",
    "confirm_verification",
    "acknowledge_warning_continue",
  ]),
});

export const trustedActionSchema = z.object({
  transactionId: z.string().min(1),
  action: z.enum(["keep_paused", "contact_customer", "approve"]),
});
