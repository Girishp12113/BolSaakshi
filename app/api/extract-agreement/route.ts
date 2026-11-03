// POST /api/extract-agreement
// Server-side structured agreement extraction using official groq-sdk
// with openai/gpt-oss-120b and Zod schema validation.

import {
  getGroqClient,
  isGroqConfigured,
  GROQ_MODELS,
  ProviderUnconfiguredError,
} from "@/lib/ai/provider"
import { ExtractionResultSchema } from "@/lib/schema"

const SYSTEM_PROMPT = `You are an expert civic-tech & legaltech AI analyst for BolSaakshi.
Your mission is to convert spoken or written work arrangements between Indian trade workers (electricians, plumbers, carpenters, painters, masons, local contractors) and their customers into a factual, structured agreement record.

The arrangement may be in Hindi, Telugu, or English (or a mix).

Extract the terms and return ONLY a valid JSON object matching this schema:
{
  "title": string, // Descriptive title, e.g. "Electrical Wiring for 3 Rooms"
  "workerName": string, // Name and trade of worker, e.g. "Ramesh Kumar (Electrician)". Empty string if unknown.
  "customerName": string, // Customer/client name. Empty string if unknown.
  "description": string, // Factual summary of the agreed work.
  "workLocation": string or null, // Location, house number, area or city if mentioned. Null if unstated.
  "startDate": string or null, // Start date in YYYY-MM-DD format if mentioned. Null if unstated.
  "completionDate": string or null, // Deadline in YYYY-MM-DD format if mentioned. Null if unstated.
  "totalAmount": number or null, // Total agreed price in INR as a pure integer number (e.g. 18500, NOT "18500 INR"). Null if unstated.
  "advanceAmount": number or null, // Advance/deposit agreed in INR as a pure integer number (e.g. 5000). Null if unstated.
  "materialsResponsibility": "worker" or "customer" or "shared" or null, // Who provides/purchases materials. Null if ambiguous or unstated.
  "includedWork": string[], // Explicit tasks agreed to be completed. Empty array [] if none.
  "excludedWork": string[], // Explicit tasks stated as NOT included (e.g. "civil plastering", "tile cutting"). Empty array [] if none.
  "additionalTerms": string[], // Stated terms (e.g. work hours, cleanup, payment milestones). Empty array [] if none.
  "clarificationQuestions": string[] // 1-4 targeted questions identifying ambiguities, missing dates, unstated materials responsibility, unclear payment timelines, or contradictions.
}

CRITICAL RULES:
1. NEVER hallucinate or invent names, prices, advance amounts, deadlines, or scope not present in the transcript.
2. If total amount or advance is not clearly stated, leave it as null.
3. If materials responsibility is not explicitly decided, leave materialsResponsibility as null AND add a question to clarificationQuestions.
4. If completion date is missing, leave completionDate as null AND add a question to clarificationQuestions.
5. All numeric values must be pure numbers, never strings with currency symbols.
6. Output raw JSON only.`

// Helper to sanitize error messages and ensure no API keys or sensitive authorization tokens leak
function redactSecrets(text: string): string {
  return text
    .replace(/gsk_[a-zA-Z0-9_-]+/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, "Bearer [REDACTED_TOKEN]")
}

// Helper to repair and sanitize model outputs before Zod validation
function sanitizeRawModelOutput(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...raw }

  // Coerce amounts: extract numeric digits if returned as string like "24000 INR"
  const parseAmount = (val: unknown): number | null => {
    if (val === null || val === undefined || val === "") return null
    if (typeof val === "number" && !isNaN(val)) return val
    if (typeof val === "string") {
      const digits = val.replace(/[^0-9.]/g, "")
      const n = parseFloat(digits)
      return isNaN(n) ? null : Math.round(n)
    }
    return null
  }

  sanitized.totalAmount = parseAmount(raw.totalAmount)
  sanitized.advanceAmount = parseAmount(raw.advanceAmount)

  // Coerce strings
  sanitized.workerName = typeof raw.workerName === "string" ? raw.workerName.trim() : ""
  sanitized.customerName = typeof raw.customerName === "string" ? raw.customerName.trim() : ""
  sanitized.description = typeof raw.description === "string" ? raw.description.trim() : ""
  sanitized.workLocation = typeof raw.workLocation === "string" && raw.workLocation.trim().length > 0 ? raw.workLocation.trim() : null
  sanitized.startDate = typeof raw.startDate === "string" && raw.startDate.trim().length > 0 ? raw.startDate.trim() : null
  sanitized.completionDate = typeof raw.completionDate === "string" && raw.completionDate.trim().length > 0 ? raw.completionDate.trim() : null

  // Coerce title
  if (!raw.title || typeof raw.title !== "string" || raw.title.trim().length === 0) {
    const worker = typeof sanitized.workerName === "string" && sanitized.workerName ? sanitized.workerName.split("(")[0].trim() : ""
    const work = typeof sanitized.description === "string" && sanitized.description ? sanitized.description.slice(0, 30) : "Work Agreement"
    sanitized.title = worker ? `${worker} – ${work}` : work
  } else {
    sanitized.title = raw.title.trim()
  }

  // Coerce materialsResponsibility
  if (raw.materialsResponsibility !== "worker" && raw.materialsResponsibility !== "customer" && raw.materialsResponsibility !== "shared") {
    sanitized.materialsResponsibility = null
  }

  // Coerce string arrays
  const toCleanArray = (val: unknown): string[] => {
    if (!Array.isArray(val)) return []
    return val.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((s) => s.trim())
  }

  sanitized.includedWork = toCleanArray(raw.includedWork)
  sanitized.excludedWork = toCleanArray(raw.excludedWork)
  sanitized.additionalTerms = toCleanArray(raw.additionalTerms)
  sanitized.clarificationQuestions = toCleanArray(raw.clarificationQuestions)

  return sanitized
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (!isGroqConfigured()) {
      return Response.json(
        {
          error:
            "GroqCloud API is unconfigured. Set GROQ_API_KEY in .env.local to enable live model extraction.",
          unconfigured: true,
        },
        { status: 503 }
      )
    }

    const body = (await request.json()) as { transcript?: string; language?: string }
    const transcript = body?.transcript?.trim()

    if (!transcript) {
      return Response.json(
        { error: "No transcript provided. Please record or enter job details first." },
        { status: 400 }
      )
    }

    const groq = getGroqClient()
    const language = body?.language || "hindi"

    // Real Meta Prompt Guard safety audit on input text
    let metaPromptGuardScore: number | null = null
    let metaGuardStatus: "passed" | "flagged" | "unavailable" = "unavailable"

    try {
      const guardRes = await groq.chat.completions.create({
        model: "meta-llama/llama-prompt-guard-2-86m",
        messages: [{ role: "user", content: transcript.slice(0, 500) }],
        max_tokens: 10,
      })
      const scoreStr = guardRes.choices?.[0]?.message?.content?.trim()
      if (scoreStr) {
        const parsed = parseFloat(scoreStr)
        if (!isNaN(parsed)) {
          metaPromptGuardScore = parsed
          metaGuardStatus = parsed < 0.5 ? "passed" : "flagged"
        }
      }
    } catch (guardErr) {
      console.warn(
        "Meta Prompt Guard check warning (non-fatal):",
        guardErr instanceof Error ? redactSecrets(guardErr.message) : "Screening request failed"
      )
    }

    // Actively enforce safety threshold: reject flagged injections/exploits (score >= 0.5)
    if (metaPromptGuardScore !== null && metaPromptGuardScore >= 0.5) {
      return Response.json(
        {
          error: `Safety check failed: Meta Prompt Guard flagged this text for potential policy or prompt injection risks (score: ${metaPromptGuardScore.toFixed(3)}). Please rephrase your work arrangement description.`,
          safetyFlagged: true,
          metaSafetyAudit: {
            model: "meta-llama/llama-prompt-guard-2-86m",
            jailbreakScore: metaPromptGuardScore,
            status: "flagged",
          },
        },
        { status: 400 }
      )
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.chat,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Language of input: ${language}\n\nSpoken conversation / arrangement transcript:\n"""\n${transcript}\n"""`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 3000,
    })

    const rawContent = completion.choices?.[0]?.message?.content ?? ""
    if (!rawContent.trim()) {
      return Response.json(
        { error: "The AI model returned an empty response. Please try again." },
        { status: 502 }
      )
    }

    // Strip any accidental markdown formatting
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim()

    let rawParsed: Record<string, unknown>
    try {
      rawParsed = JSON.parse(cleaned) as Record<string, unknown>
    } catch {
      console.error("JSON parse failure: model output was not valid JSON (output length: " + cleaned.length + ")")
      return Response.json(
        { error: "Model output was not valid JSON. Please review details manually." },
        { status: 502 }
      )
    }

    // Sanitize and repair types before validation
    const sanitized = sanitizeRawModelOutput(rawParsed)

    // Validate with Zod
    const parsedResult = ExtractionResultSchema.safeParse(sanitized)
    if (!parsedResult.success) {
      const issueSummary = parsedResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
      console.error("Zod validation failed for extraction:", issueSummary)
      return Response.json(
        {
          error: "Extracted data failed validation.",
          details: parsedResult.error.format(),
        },
        { status: 502 }
      )
    }

    return Response.json({
      extraction: parsedResult.data,
      model: GROQ_MODELS.chat,
      provider: "GroqCloud",
      metaSafetyAudit: {
        model: "meta-llama/llama-prompt-guard-2-86m",
        jailbreakScore: metaPromptGuardScore,
        status: metaGuardStatus,
        policy:
          metaGuardStatus === "passed"
            ? "Screened with Meta Prompt Guard: no adversarial injection detected."
            : metaGuardStatus === "flagged"
            ? "Flagged by Meta Prompt Guard."
            : "Screening unavailable; extracted under strict zero-hallucination system prompt.",
      },
      modelDisclosure: {
        extractionModel: GROQ_MODELS.chat,
        transcriptionModel: GROQ_MODELS.whisper,
        metaModelEvaluated: "meta-llama/llama-prompt-guard-2-86m",
        metaGuardStatus,
        metaLlamaGenerativeStatus: "not_available_on_current_groq_account",
      },
    })
  } catch (err: unknown) {
    if (err instanceof ProviderUnconfiguredError) {
      return Response.json({ error: err.message, unconfigured: true }, { status: 503 })
    }
    const rawMessage = err instanceof Error ? err.message : "AI extraction failed. Please check your Groq API key and network connection."
    const safeMessage = redactSecrets(rawMessage)
    console.error("Groq chat extraction error:", safeMessage)
    return Response.json(
      { error: safeMessage },
      { status: 502 }
    )
  }
}
