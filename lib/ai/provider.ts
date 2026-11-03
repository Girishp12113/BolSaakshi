// AI provider interface for BolSaakshi using GroqCloud SDK
// Real Groq client connects here. When unconfigured, callers receive a clear error.

import Groq from "groq-sdk"

export type TranscriptionProvider = "groq" | "none"
export type ExtractionProvider = "groq" | "none"

export interface TranscribeInput {
  audioBlob: Blob
  language: "english" | "hindi" | "telugu"
}

export interface ExtractInput {
  transcript: string
  language: "english" | "hindi" | "telugu"
}

export class ProviderUnconfiguredError extends Error {
  constructor(provider: string = "GroqCloud") {
    super(
      `${provider} is not configured. Add your GROQ_API_KEY to .env.local to enable live AI features.`
    )
    this.name = "ProviderUnconfiguredError"
  }
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0)
}

export function getTranscriptionProvider(): TranscriptionProvider {
  if (isGroqConfigured()) return "groq"
  return "none"
}

export function getExtractionProvider(): ExtractionProvider {
  if (isGroqConfigured()) return "groq"
  return "none"
}

export function getGroqClient(): Groq {
  if (!isGroqConfigured()) {
    throw new ProviderUnconfiguredError("GroqCloud")
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  })
}

export const GROQ_MODELS = {
  chat: process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b",
  whisper: process.env.GROQ_WHISPER_MODEL || "whisper-large-v3",
}

export const LANGUAGE_CODES: Record<string, string> = {
  english: "en",
  hindi: "hi",
  telugu: "te",
}
