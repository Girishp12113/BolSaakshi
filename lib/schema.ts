// BolSaakshi – Data model with TypeScript and Zod
// Unknown facts stay null. Never invent data.

import { z } from "zod"

export type AgreementLanguage = "english" | "hindi" | "telugu"
export type AgreementStatus = "draft" | "acknowledged"
export type MaterialsResponsibility = "worker" | "customer" | "shared"

export const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number().nonnegative(),
  date: z.string(), // ISO date YYYY-MM-DD
  note: z.string(),
})
export type Payment = z.infer<typeof PaymentSchema>

export const AgreementSchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.enum(["english", "hindi", "telugu"]),
  workerName: z.string(),
  customerName: z.string(),
  description: z.string(),
  workLocation: z.string().nullable(),
  startDate: z.string().nullable(),
  completionDate: z.string().nullable(),
  currency: z.literal("INR"),
  totalAmount: z.number().nullable(),
  advanceAmount: z.number().nullable(),
  materialsResponsibility: z.enum(["worker", "customer", "shared"]).nullable(),
  includedWork: z.array(z.string()),
  excludedWork: z.array(z.string()),
  additionalTerms: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
  sourceTranscript: z.string(),
  status: z.enum(["draft", "acknowledged"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  payments: z.array(PaymentSchema),
})
export type Agreement = z.infer<typeof AgreementSchema>

export const ExtractionResultSchema = z.object({
  title: z.string().default("Work Agreement"),
  workerName: z.string().default(""),
  customerName: z.string().default(""),
  description: z.string().default(""),
  workLocation: z.string().nullable().default(null),
  startDate: z.string().nullable().default(null),
  completionDate: z.string().nullable().default(null),
  totalAmount: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }, z.number().nullable().default(null)),
  advanceAmount: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }, z.number().nullable().default(null)),
  materialsResponsibility: z.preprocess((val) => {
    if (val === "worker" || val === "customer" || val === "shared") return val
    return null
  }, z.enum(["worker", "customer", "shared"]).nullable().default(null)),
  includedWork: z.array(z.string()).default([]),
  excludedWork: z.array(z.string()).default([]),
  additionalTerms: z.array(z.string()).default([]),
  clarificationQuestions: z.array(z.string()).default([]),
})
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>

// Calculated helpers – never mutate stored data
export function totalPaid(agreement: Agreement): number {
  return agreement.payments.reduce((sum, p) => sum + p.amount, 0)
}

export function outstandingAmount(agreement: Agreement): number | null {
  if (agreement.totalAmount === null) return null
  return Math.max(0, agreement.totalAmount - totalPaid(agreement))
}

export function overpaymentAmount(agreement: Agreement): number {
  if (agreement.totalAmount === null) return 0
  const paid = totalPaid(agreement)
  return paid > agreement.totalAmount ? paid - agreement.totalAmount : 0
}

export function formatINR(amount: number | null): string {
  if (amount === null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Strict validation for calendar dates in YYYY-MM-DD format.
 * Rejects free text, natural language (e.g. "next Friday"), invalid calendar dates (e.g. 2026-02-30),
 * and incomplete date strings.
 */
export function isValidISODate(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== "string") return false
  const trimmed = dateStr.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false
  const [yearStr, monthStr, dayStr] = trimmed.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (isNaN(year) || isNaN(month) || isNaN(day)) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  const d = new Date(year, month - 1, day)
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  )
}

/**
 * Formats a date string safely for display in the Indian locale (en-IN).
 * NEVER throws RangeError: Invalid time value on invalid, malformed, or legacy natural-language dates.
 * If the date is invalid or free-text, returns the string safely without crashing client rendering.
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr || typeof dateStr !== "string") return "—"
  const trimmed = dateStr.trim()
  if (!trimmed) return "—"

  // Standard YYYY-MM-DD date format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number)
    const d = new Date(year, month - 1, day)
    if (!isNaN(d.getTime())) {
      try {
        return new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(d)
      } catch {
        return trimmed
      }
    }
  }

  // Handle ISO timestamp format (e.g. 2026-11-03T18:00:00.000Z) or standard parseable dates
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(parsed)
    } catch {
      return trimmed
    }
  }

  // Safe fallback for legacy natural text or unparseable inputs: display string without crashing
  return trimmed
}

export function getStatusLabel(status: AgreementStatus): string {
  if (status === "draft") return "Draft Record"
  return "Acknowledged (Self-Reported)"
}

export function getStatusDescription(status: AgreementStatus): string {
  if (status === "draft") {
    return "Currently an unconfirmed draft record on this device. To confirm mutual agreement, share the written summary via WhatsApp or printout with the other party."
  }
  return "Self-reported as acknowledged by this device's user. Does not establish verified two-party legal consent unless independently confirmed or physically signed by both parties."
}

export function emptyExtraction(): ExtractionResult {
  return {
    title: "",
    workerName: "",
    customerName: "",
    description: "",
    workLocation: null,
    startDate: null,
    completionDate: null,
    totalAmount: null,
    advanceAmount: null,
    materialsResponsibility: null,
    includedWork: [],
    excludedWork: [],
    additionalTerms: [],
    clarificationQuestions: [],
  }
}
