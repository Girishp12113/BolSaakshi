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

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
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
