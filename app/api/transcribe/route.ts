// POST /api/transcribe
// Server-side audio transcription using official groq-sdk with Whisper
// Handles multipart/form-data audio uploads with validation & error handling.

import Groq from "groq-sdk"
import {
  getGroqClient,
  isGroqConfigured,
  GROQ_MODELS,
  LANGUAGE_CODES,
  ProviderUnconfiguredError,
} from "@/lib/ai/provider"

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB Groq Whisper limit
const ALLOWED_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/opus",
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "video/webm", // Chrome sometimes reports webm as video/webm
  "video/mp4",
]

const ALLOWED_EXTENSIONS = ["webm", "mp4", "m4a", "wav", "ogg", "mp3", "flac", "oga"]

export async function POST(request: Request): Promise<Response> {
  try {
    if (!isGroqConfigured()) {
      return Response.json(
        {
          error:
            "GroqCloud API is unconfigured. Set GROQ_API_KEY in .env.local to enable live Whisper transcription.",
          unconfigured: true,
        },
        { status: 503 }
      )
    }

    // Parse multipart form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseErr: unknown) {
      const msg = parseErr instanceof Error ? parseErr.message : "Malformed body"
      return Response.json(
        { error: "Invalid form data submission: " + msg },
        { status: 400 }
      )
    }

    const audioFile = formData.get("audio") as File | null
    const requestedLanguage = (formData.get("language") as string) || "hindi"

    if (!audioFile) {
      return Response.json(
        { error: "No audio file provided. Please record or select an audio file." },
        { status: 400 }
      )
    }

    // Size validation
    if (audioFile.size === 0) {
      return Response.json(
        { error: "The recorded audio file is empty (0 bytes). Please check microphone input and try again." },
        { status: 400 }
      )
    }

    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        {
          error: `Audio file size (${(audioFile.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit for Groq Whisper.`,
        },
        { status: 400 }
      )
    }

    // Format validation
    const fileMime = (audioFile.type || "").toLowerCase()
    const fileName = (audioFile.name || "recording.webm").toLowerCase()
    const fileExt = fileName.split(".").pop() || "webm"

    const isMimeAllowed = ALLOWED_MIME_TYPES.some((m) => fileMime.includes(m) || m.includes(fileMime))
    const isExtAllowed = ALLOWED_EXTENSIONS.includes(fileExt)

    if (!isMimeAllowed && !isExtAllowed) {
      return Response.json(
        {
          error: `Unsupported audio format (${fileMime || fileExt}). Groq Whisper supports WebM, MP4, M4A, WAV, OGG, MP3, and FLAC.`,
        },
        { status: 415 }
      )
    }

    // Convert Web File into Groq Uploadable File
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadableFile = await Groq.toFile(
      buffer,
      audioFile.name || `recording.${fileExt}`,
      { type: audioFile.type || "audio/webm" }
    )

    // Call Groq Whisper API
    const groq = getGroqClient()
    const languageCode = LANGUAGE_CODES[requestedLanguage] ?? "en"

    const transcription = await groq.audio.transcriptions.create({
      file: uploadableFile,
      model: GROQ_MODELS.whisper,
      language: languageCode,
      response_format: "json",
    })

    const rawText = transcription.text ? transcription.text.trim() : ""

    return Response.json({
      transcript: rawText,
      model: GROQ_MODELS.whisper,
      language: requestedLanguage,
    })
  } catch (err: unknown) {
    if (err instanceof ProviderUnconfiguredError) {
      return Response.json({ error: err.message, unconfigured: true }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : "Whisper transcription failed. Please check your Groq API key and network connection."
    console.error("Groq Whisper transcription route error:", err)
    return Response.json(
      {
        error: message,
      },
      { status: 502 }
    )
  }
}
