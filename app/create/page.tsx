"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mic, Square, RotateCcw, Play, Pause, FileText,
  ChevronRight, ChevronLeft, Loader2, AlertCircle,
  CheckCircle2, HelpCircle, Info, Sparkles, Wand2, Plus,
  ShieldCheck, AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { storage } from "@/lib/storage"
import type { Agreement, AgreementLanguage, ExtractionResult } from "@/lib/schema"
import { emptyExtraction, isValidISODate } from "@/lib/schema"
import Nav from "@/components/nav"
import CopyButton from "@/components/ui/copy-button"

// ─── Types ──────────────────────────────────────────────────────────────────

type InputMode = "record" | "type"
type Step = "input" | "transcript" | "extraction" | "confirm"

const STEPS: { id: Step; label: string }[] = [
  { id: "input", label: "Speak or Type" },
  { id: "transcript", label: "Review Transcript" },
  { id: "extraction", label: "AI Extraction & Clarifications" },
  { id: "confirm", label: "Review & Save" },
]

const LANGUAGES: { value: AgreementLanguage; label: string; hint: string }[] = [
  { value: "hindi", label: "हिन्दी", hint: "हिंदी में बोलें या लिखें" },
  { value: "telugu", label: "తెలుగు", hint: "తెలుగులో మాట్లాడండి లేదా రాయండి" },
  { value: "english", label: "English", hint: "Record or type in English" },
]

// Real-world sample scenarios for instant testing and demonstration
const PRESET_SCENARIOS = [
  {
    id: "electrician",
    label: "Electrician Wiring (Hindi)",
    language: "hindi" as AgreementLanguage,
    text: "मैं रमेश कुमार, इलेक्ट्रिशियन हूँ। सुनीता देवी जी के मकान नंबर 42, ग्रीन ग्लेन लेआउट में 3 कमरों की कंसील्ड वायरिंग और 6 मॉड्यूलर स्विचबोर्ड लगाने का काम तय हुआ है। कुल मजदूरी ₹18,500 तय हुई है। काम 10 नवंबर को शुरू होगा और 18 नवंबर तक पूरा करना है। ₹5,000 एडवांस काम शुरू होने पर मिलेगा। वायर, स्विच और बोर्ड सारा सामान सुनीता जी ला कर देंगी। दीवार की झिरी काटने के बाद का प्लास्टर का काम हमारा नहीं होगा।",
    extraction: {
      title: "Electrical Wiring & Modular Switchboards",
      workerName: "Ramesh Kumar (Electrician)",
      customerName: "Sunita Devi",
      description: "Complete 3-room concealed conduit wiring, 6 modular switchboard installations, and distribution board MCB wiring.",
      workLocation: "House #42, Green Glen Layout, Bengaluru",
      startDate: "2026-11-10",
      completionDate: "2026-11-18",
      totalAmount: 18500,
      advanceAmount: 5000,
      materialsResponsibility: "customer" as const,
      includedWork: [
        "Concealed PVC conduit pipe channeling in 3 rooms",
        "Wire pulling for light, fan, and 16A power points",
        "Installation of 6 modular switchboards",
        "Distribution board 8-way MCB wiring and load testing",
      ],
      excludedWork: [
        "Civil masonry and plastering after wall cutting",
        "Decorative light or chandelier installation",
        "BESCOM meter board shifting",
      ],
      additionalTerms: [
        "Working hours 9:30 AM to 6:30 PM",
        "Customer provides all wires, switches, and MCB",
        "Final payment ₹13,500 due within 2 days of testing",
      ],
      clarificationQuestions: [
        "Who will arrange the civil mason to plaster the wall cuts?",
        "Are power points required for geyser and AC units?",
      ],
    },
  },
  {
    id: "plumber",
    label: "Plumbing & Sanitary (Telugu)",
    language: "telugu" as AgreementLanguage,
    text: "నేను సురేష్ వర్మ, ప్లంబర్. వెంకట్ రావు గారి కొత్త ఇంటిలో 2 బాత్‌రూమ్‌లు మరియు కిచెన్ పైప్‌లైన్ ఫిట్టింగ్ పని చేయాలి. మొత్తం లేబర్ ఛార్జ్ ₹14,000. అడ్వాన్స్ ₹4,000 రేపు పని మొదలుపెట్టినప్పుడు ఇవ్వాలి. సిపివిసి పైపులు, ట్యాప్‌లు మరియు సానిటరీ సామాగ్రి వెంకట్ రావు గారే కొనివ్వాలి. పని 12 నవంబర్ న ప్రారంభించి 17 నవంబర్ కల్లా పూర్తి చేస్తాను. టైల్స్ వేసిన తర్వాత మాత్రమే ఫిట్టింగ్స్ పెడతాము.",
    extraction: {
      title: "Plumbing & Sanitary Fitting Work",
      workerName: "Suresh Varma (Plumber)",
      customerName: "Venkat Rao",
      description: "Complete CPVC/PVC pipeline fitting for 2 bathrooms and 1 kitchen, drain line connection, and sanitary fixture installation.",
      workLocation: "Plot #88, Jubilee Hills, Hyderabad",
      startDate: "2026-11-12",
      completionDate: "2026-11-17",
      totalAmount: 14000,
      advanceAmount: 4000,
      materialsResponsibility: "customer" as const,
      includedWork: [
        "Concealed CPVC hot and cold water piping in 2 bathrooms",
        "Kitchen sink drain line and inlet pipeline",
        "Sanitary fixtures (commode, wash basin, taps) installation",
        "Overhead water tank connection and pressure test",
      ],
      excludedWork: [
        "Tile cutting and tile laying work",
        "Solar water heater rooftop installation",
        "Borewell motor servicing",
      ],
      additionalTerms: [
        "Final sanitary fittings to be done only after tile work completion",
        "Customer responsible for purchasing all pipes and fixtures",
        "Balance ₹10,000 payable upon successful water pressure test",
      ],
      clarificationQuestions: [
        "Has the tiler scheduled their work between the rough-in and final fitting stages?",
        "Is a pressure pump being installed near the overhead tank?",
      ],
    },
  },
  {
    id: "painter",
    label: "House Painting (English)",
    language: "english" as AgreementLanguage,
    text: "I am Rajesh Sharma, professional painter. I will paint the interior of Mr. Anand Verma's 2BHK flat. Scope includes putty touch-up, 1 coat primer, and 2 coats of Asian Paints Royale luxury emulsion on all internal walls and ceilings. Total labor charge is ₹22,000. An advance of ₹6,000 is agreed before starting. Paint and putty materials will be provided by Anand. Work starts on 15 November and completes by 22 November. Door enamel polish is not included in this quote.",
    extraction: {
      title: "Interior Painting 2BHK Flat",
      workerName: "Rajesh Sharma (Painter)",
      customerName: "Anand Verma",
      description: "Interior wall and ceiling painting for 2BHK flat including putty repair, 1 coat primer, and 2 coats luxury emulsion.",
      workLocation: "Flat 402, Skyline Residency, HSR Layout, Bengaluru",
      startDate: "2026-11-15",
      completionDate: "2026-11-22",
      totalAmount: 22000,
      advanceAmount: 6000,
      materialsResponsibility: "customer" as const,
      includedWork: [
        "Surface preparation and acrylic wall putty touch-up",
        "Application of 1 coat water-thinnable primer",
        "2 coats of Asian Paints Royale luxury emulsion on walls & ceiling",
        "Floor and furniture covering with plastic drop sheets",
      ],
      excludedWork: [
        "Wood polishing or enamel painting of doors and windows",
        "Exterior balcony weather-proof painting",
        "Major plaster cracking repairs",
      ],
      additionalTerms: [
        "Customer to supply paint, putty, and primer materials by 14 November",
        "Daily cleanup of painting work area",
        "Balance ₹16,000 payable upon final walkthrough and color approval",
      ],
      clarificationQuestions: [
        "Are door frames and window grills to be included under a separate quote?",
        "Are different wall accent colors chosen for the living room and bedrooms?",
      ],
    },
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function uuid(): string {
  return crypto.randomUUID()
}

// Detect best supported recording MIME type across Safari iOS, Android Chrome, and Desktop
function getBestSupportedAudioMime(): { mimeType: string; ext: string } {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return { mimeType: "audio/webm", ext: "webm" }
  }
  const candidates: { mime: string; ext: string }[] = [
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/mp4", ext: "mp4" }, // Common on iOS Safari
    { mime: "audio/aac", ext: "m4a" },
    { mime: "audio/ogg;codecs=opus", ext: "ogg" },
    { mime: "audio/wav", ext: "wav" },
  ]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mime)) {
      return { mimeType: c.mime, ext: c.ext }
    }
  }
  return { mimeType: "", ext: "webm" }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current)
  return (
    <ol className="flex items-center gap-2 text-xs" aria-label="Progress steps">
      {STEPS.map((step, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-medium transition-colors",
                done && "bg-[#B75D42] border-[#B75D42] text-[#F8F5EE]",
                active && "border-[#B75D42] text-[#B75D42] font-semibold bg-[#B75D42]/10",
                !done && !active && "border-[#D8C9B4] text-[#282521]/40"
              )}
            >
              {done ? <CheckCircle2 size={12} /> : i + 1}
            </span>
            <span className={cn(
              "hidden sm:inline",
              active ? "text-[#282521] font-semibold" : "text-[#282521]/50"
            )}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight size={12} className="text-[#D8C9B4] mx-1" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function InfoBanner({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" | "success" }) {
  const styles = {
    info: "bg-[#EDE8DF] border-[#D8C9B4] text-[#282521]/80",
    warning: "bg-amber-50 border-amber-300 text-amber-900",
    success: "bg-emerald-50 border-emerald-300 text-emerald-900",
  }
  const Icon = type === "success" ? CheckCircle2 : type === "warning" ? AlertCircle : Info
  return (
    <div className={cn("flex items-start gap-3 border rounded-lg px-4 py-3 text-sm", styles[type])}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

type TargetField =
  | "additionalTerms"
  | "completionDate"
  | "startDate"
  | "materialsResponsibility"
  | "totalAmount"
  | "advanceAmount"
  | "workLocation"

function detectSuggestedField(question: string): TargetField {
  const q = question.toLowerCase()
  if (/advance|deposit|बयाना|అడ్వాన్స్/i.test(q)) return "advanceAmount"
  if (/total|amount|rate|price|cost|कुल राशि|మొత్తం/i.test(q)) return "totalAmount"
  if (/material|supplies|who.*(buys|provides|purchase)|सामग्री|సామగ్రి/i.test(q)) return "materialsResponsibility"
  if (/deadline|completion|finish|target date|कब तक|ఎప్పటిలోగా/i.test(q)) return "completionDate"
  if (/start date|begin|when.*start|कब शुरू|ఎప్పుడు మొదలు/i.test(q)) return "startDate"
  if (/location|address|site|where|कहाँ|ఎక్కడ/i.test(q)) return "workLocation"
  return "additionalTerms"
}

const FIELD_LABELS: Record<TargetField, string> = {
  additionalTerms: "Additional Term",
  completionDate: "Completion Deadline",
  startDate: "Start Date",
  materialsResponsibility: "Materials Responsibility",
  totalAmount: "Total Price",
  advanceAmount: "Advance Amount",
  workLocation: "Work Location",
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter()

  // Step state
  const [step, setStep] = useState<Step>("input")
  const [inputMode, setInputMode] = useState<InputMode>("record")
  const [language, setLanguage] = useState<AgreementLanguage>("hindi")

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFileExt, setAudioFileExt] = useState("webm")
  const [micError, setMicError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Text fallback
  const [typedText, setTypedText] = useState("")

  // Transcript
  const [transcript, setTranscript] = useState("")
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [transcribeUnconfigured, setTranscribeUnconfigured] = useState(false)

  // Extraction
  const [, setRawExtraction] = useState<ExtractionResult>(emptyExtraction())
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractUnconfigured, setExtractUnconfigured] = useState(false)
  const [extractedModelName, setExtractedModelName] = useState<string | null>(null)
  const [safetyAudit, setSafetyAudit] = useState<{ status: string; policy?: string } | null>(null)

  // Confirmation field edits
  const [editedExtraction, setEditedExtraction] = useState<ExtractionResult>(emptyExtraction())

  // Clarification inline answer drafts: record questionIndex -> answerText
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<number, string>>({})
  const [clarificationTargets, setClarificationTargets] = useState<Record<number, TargetField>>({})
  const [clarificationErrors, setClarificationErrors] = useState<Record<number, string>>({})

  // Saving
  const [saving, setSaving] = useState(false)

  // ── Recording with cross-browser permission handling ─────────────────────────

  const startRecording = useCallback(async () => {
    setMicError(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingDuration(0)
    audioChunksRef.current = []

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError("Microphone access is not supported by your browser. Please switch to 'Type details'.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      const { mimeType, ext } = getBestSupportedAudioMime()
      setAudioFileExt(ext)

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const actualType = recorder.mimeType || mimeType || "audio/webm"
        const blob = new Blob(audioChunksRef.current, { type: actualType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))

        // Stop all tracks to release hardware microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
      }

      recorder.start(250) // slice chunks every 250ms
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1)
      }, 1000)
    } catch (err: unknown) {
      console.error("Microphone access error:", err)
      const errName = err instanceof Error ? err.name : "UnknownError"
      const errMsg = err instanceof Error ? err.message : "Unknown error"
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setMicError("Microphone permission was denied. Tap the lock/settings icon in your browser address bar to allow microphone access, or switch to 'Type details'.")
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setMicError("No microphone was detected on this device. You can type agreement details directly.")
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        setMicError("The microphone is currently in use by another program or tab.")
      } else {
        setMicError(`Unable to start audio recording: ${errMsg}. You can switch to 'Type details'.`)
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const resetRecording = useCallback(() => {
    stopRecording()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingDuration(0)
    setMicError(null)
    audioChunksRef.current = []
  }, [stopRecording])

  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !audioUrl) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying((v) => !v)
  }, [audioUrl, isPlaying])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // ── Preset scenario loader ──────────────────────────────────────────────────

  const applyPresetScenario = useCallback((scenario: typeof PRESET_SCENARIOS[0]) => {
    setLanguage(scenario.language)
    setTypedText(scenario.text)
    setInputMode("type")
    setMicError(null)
  }, [])

  // ── Transcription (Calls Server /api/transcribe -> Groq Whisper) ───────────

  const handleTranscribeOrProceed = useCallback(async () => {
    // If typed mode, transfer directly to editable transcript
    if (inputMode === "type") {
      if (!typedText.trim()) {
        alert("Please describe the job arrangement before continuing.")
        return
      }
      setTranscript(typedText)
      setStep("transcript")
      return
    }

    // Audio mode
    if (!audioBlob) {
      alert("Please record audio first or select 'Type details'.")
      return
    }

    setTranscribing(true)
    setTranscribeError(null)
    setTranscribeUnconfigured(false)

    try {
      const formData = new FormData()
      const fileName = `recording_${Date.now()}.${audioFileExt}`
      formData.append("audio", audioBlob, fileName)
      formData.append("language", language)

      const res = await fetch("/api/transcribe", { method: "POST", body: formData })
      const data = await res.json() as {
        transcript?: string
        error?: string
        unconfigured?: boolean
        model?: string
      }

      if (!res.ok) {
        if (data.unconfigured) {
          setTranscribeUnconfigured(true)
          setTranscript("")
        } else {
          setTranscribeError(data.error ?? "Transcription failed. You can type or paste the text manually.")
        }
        setStep("transcript")
        return
      }

      setTranscript(data.transcript ?? "")
      setStep("transcript")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error communicating with transcription service."
      setTranscribeError(msg + " You can enter the transcript manually.")
      setStep("transcript")
    } finally {
      setTranscribing(false)
    }
  }, [inputMode, typedText, audioBlob, audioFileExt, language])

  // ── AI Extraction (Calls Server /api/extract-agreement -> Groq openai/gpt-oss-120b)

  const handleExtract = useCallback(async () => {
    if (!transcript.trim()) {
      alert("Please enter the transcript before extracting.")
      return
    }

    setExtracting(true)
    setExtractError(null)
    setExtractUnconfigured(false)

    try {
      const res = await fetch("/api/extract-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, language }),
      })

      const data = await res.json() as {
        extraction?: ExtractionResult
        error?: string
        unconfigured?: boolean
        model?: string
        provider?: string
        metaSafetyAudit?: {
          status: string
          policy?: string
        } | null
      }

      if (!res.ok) {
        if (data.unconfigured) {
          setExtractUnconfigured(true)
          // Find matching preset if available for demonstration fallback
          const matchingPreset = PRESET_SCENARIOS.find((p) =>
            p.text === transcript || transcript.includes(p.extraction.workerName.split(" ")[0])
          )
          const fallback = matchingPreset?.extraction ?? emptyExtraction()
          setRawExtraction(fallback)
          setEditedExtraction(fallback)
        } else {
          setExtractError(data.error ?? "Extraction request failed.")
        }
        setStep("extraction")
        return
      }

      const ext = data.extraction ?? emptyExtraction()
      setRawExtraction(ext)
      setEditedExtraction({ ...ext })
      setExtractedModelName(data.model || "openai/gpt-oss-120b")
      setSafetyAudit(data.metaSafetyAudit ?? null)
      setStep("extraction")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during extraction."
      setExtractError(msg)
      setStep("extraction")
    } finally {
      setExtracting(false)
    }
  }, [transcript, language])

  const loadDemoExtraction = useCallback(() => {
    const preset = PRESET_SCENARIOS.find((p) => p.language === language) ?? PRESET_SCENARIOS[0]
    setRawExtraction(preset.extraction)
    setEditedExtraction({ ...preset.extraction })
    setExtractedModelName("Verified Sample Extraction")
  }, [language])

  // ── Clarification Answer Application ────────────────────────────────────────

  const applyClarificationAnswer = (index: number, question: string, customTarget?: TargetField) => {
    const answer = (clarificationAnswers[index] || "").trim()
    if (!answer) return

    const target = customTarget || clarificationTargets[index] || detectSuggestedField(question)

    // Strict Date Validation: Only valid YYYY-MM-DD allowed for startDate / completionDate
    if (target === "completionDate" || target === "startDate") {
      if (!isValidISODate(answer)) {
        setClarificationErrors((prev) => ({
          ...prev,
          [index]: `"${answer}" is a relative or natural-language date. BolSaakshi never guesses calendar dates. Please select an exact calendar date (YYYY-MM-DD), or switch the update field to "Additional Terms" to record this as a conversational note.`,
        }))
        return
      }
    }

    // Clear error for this question
    setClarificationErrors((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })

    setEditedExtraction((prev) => {
      const next = { ...prev }
      const newNote = `Clarified: ${question} → ${answer}`
      next.additionalTerms = [...next.additionalTerms, newNote]
      next.clarificationQuestions = next.clarificationQuestions.filter((_, i) => i !== index)

      // Explicitly update structured field if user selected a structured target
      if (target === "totalAmount") {
        const digits = answer.replace(/[^0-9.]/g, "")
        const num = parseFloat(digits)
        if (!isNaN(num)) next.totalAmount = Math.round(num)
      } else if (target === "advanceAmount") {
        const digits = answer.replace(/[^0-9.]/g, "")
        const num = parseFloat(digits)
        if (!isNaN(num)) next.advanceAmount = Math.round(num)
      } else if (target === "materialsResponsibility") {
        const a = answer.toLowerCase()
        if (
          a.includes("customer") ||
          a.includes("client") ||
          a.includes("owner") ||
          a.includes("ग्राहक") ||
          a.includes("యజమాని")
        ) {
          next.materialsResponsibility = "customer"
        } else if (
          a.includes("worker") ||
          a.includes("contractor") ||
          a.includes("technician") ||
          a.includes("कारीगर") ||
          a.includes("మేస్త్రీ")
        ) {
          next.materialsResponsibility = "worker"
        } else if (
          a.includes("share") ||
          a.includes("both") ||
          a.includes("दोनों") ||
          a.includes("ఇద్దరు")
        ) {
          next.materialsResponsibility = "shared"
        }
      } else if (target === "completionDate") {
        next.completionDate = answer
      } else if (target === "startDate") {
        next.startDate = answer
      } else if (target === "workLocation") {
        next.workLocation = answer
      }

      return next
    })

    // Clear answer input and target draft
    setClarificationAnswers((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
    setClarificationTargets((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  // ── Save Agreement ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const agreement: Agreement = {
        id: uuid(),
        title: editedExtraction.title || `Agreement – ${new Date().toLocaleDateString("en-IN")}`,
        language,
        workerName: editedExtraction.workerName || "",
        customerName: editedExtraction.customerName || "",
        description: editedExtraction.description || transcript.slice(0, 200),
        workLocation: editedExtraction.workLocation,
        startDate: isValidISODate(editedExtraction.startDate) ? editedExtraction.startDate : null,
        completionDate: isValidISODate(editedExtraction.completionDate) ? editedExtraction.completionDate : null,
        currency: "INR",
        totalAmount: editedExtraction.totalAmount,
        advanceAmount: editedExtraction.advanceAmount,
        materialsResponsibility: editedExtraction.materialsResponsibility,
        includedWork: editedExtraction.includedWork,
        excludedWork: editedExtraction.excludedWork,
        additionalTerms: editedExtraction.additionalTerms,
        clarificationQuestions: editedExtraction.clarificationQuestions,
        sourceTranscript: transcript,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        payments: [],
      }
      storage.saveAgreement(agreement)
      router.push(`/agreements/${agreement.id}`)
    } finally {
      setSaving(false)
    }
  }, [editedExtraction, language, transcript, router])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-xs text-[#282521]/50 hover:text-[#282521] transition-colors mb-4 inline-block font-medium">
            ← Back to home
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1
                className="text-3xl text-[#282521] mb-1 font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Create Agreement Record
              </h1>
              <p className="text-sm text-[#282521]/65">
                Spoken or typed arrangements converted to clear, editable written terms.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#282521]/50 bg-[#EDE8DF] px-2.5 py-1 rounded-full border border-[#D8C9B4]/60">
              <ShieldCheck size={12} className="text-[#B75D42]" />
              <span>GroqCloud Inference</span>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>

        {/* ── Step: Input ─────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="space-y-6">

            {/* Quick Demo Test Presets */}
            <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#B75D42]" />
                <span className="text-xs font-semibold text-[#282521] uppercase tracking-wider">
                  Verified Test Scenarios
                </span>
                <span className="text-[10px] text-[#282521]/50">(Click to test real AI inference without typing)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {PRESET_SCENARIOS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPresetScenario(preset)}
                    className="text-left px-3 py-2 rounded-lg bg-[#F8F5EE] border border-[#D8C9B4] hover:border-[#B75D42] text-xs font-medium text-[#282521] transition-all hover:shadow-xs"
                  >
                    <span className="block font-semibold text-[#B75D42]">{preset.label.split(" (")[0]}</span>
                    <span className="text-[11px] text-[#282521]/60">({preset.label.split(" (")[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#282521]/60 mb-3 font-semibold">
                Spoken or Written Language
              </label>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setLanguage(lang.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm transition-colors",
                      language === lang.value
                        ? "border-[#B75D42] bg-[#B75D42]/10 text-[#B75D42] font-semibold"
                        : "border-[#D8C9B4] bg-[#EDE8DF] text-[#282521]/70 hover:border-[#282521]/40"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode toggle */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#282521]/60 mb-3 font-semibold">
                Input Method
              </label>
              <div className="flex rounded-lg border border-[#D8C9B4] overflow-hidden">
                {(["record", "type"] as InputMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setInputMode(mode)
                      setMicError(null)
                    }}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium transition-colors",
                      inputMode === mode
                        ? "bg-[#282521] text-[#F8F5EE]"
                        : "bg-[#EDE8DF] text-[#282521]/65 hover:text-[#282521]"
                    )}
                  >
                    {mode === "record" ? "🎙 Record Audio" : "⌨ Type Details"}
                  </button>
                ))}
              </div>
            </div>

            {/* Mic Error Banner if permissions failed */}
            {micError && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">Microphone Notice</p>
                  <p className="leading-relaxed">{micError}</p>
                </div>
              </div>
            )}

            {/* Record mode */}
            {inputMode === "record" && (
              <div className="bg-[#EDE8DF] rounded-xl border border-[#D8C9B4] p-8 flex flex-col items-center gap-6">
                {!audioBlob ? (
                  <>
                    {/* Big mic button with animated feedback */}
                    <div className="relative flex items-center justify-center py-2">
                      {isRecording && (
                        <>
                          <span className="absolute w-32 h-32 rounded-full bg-red-600/20 animate-ping pointer-events-none" />
                          <span className="absolute w-28 h-28 rounded-full bg-red-600/30 animate-pulse pointer-events-none" />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                          "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:ring-4 focus-visible:ring-[#B75D42]/40 active:scale-95 shadow-md",
                          isRecording
                            ? "bg-red-600 text-white shadow-red-600/30 shadow-lg scale-105"
                            : "bg-[#B75D42] text-[#F8F5EE] hover:bg-[#B75D42]/90 hover:shadow-lg hover:scale-105"
                        )}
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                      >
                        {isRecording ? <Square size={32} /> : <Mic size={34} />}
                      </button>
                    </div>

                    {isRecording ? (
                      <div className="text-center w-full max-w-md">
                        <p className="text-3xl font-mono text-[#282521] font-bold">{formatDuration(recordingDuration)}</p>
                        <p className="text-xs text-[#282521]/60 mt-1">Recording active… tap the square when finished speaking</p>
                        <div className="mt-3 flex justify-center items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                          <span className="text-[11px] text-red-700 font-medium">Listening ({LANGUAGES.find(l => l.value === language)?.label})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center max-w-sm">
                        <p className="text-sm font-semibold text-[#282521]">
                          Tap to Record in {LANGUAGES.find(l => l.value === language)?.label}
                        </p>
                        <p className="text-xs text-[#282521]/55 mt-1.5 leading-relaxed">
                          Mention parties, work details, price, advance, dates, and materials. Audio is processed directly via Groq Whisper and not stored.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Playback */
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#282521]">Audio recorded</p>
                        <p className="text-[11px] text-[#282521]/50">Format: {audioFileExt.toUpperCase()} • Duration: {formatDuration(recordingDuration)}</p>
                      </div>
                      <span className="text-xs text-[#282521]/60 font-mono font-bold bg-[#F8F5EE] px-2.5 py-1 rounded border border-[#D8C9B4]">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl ?? undefined}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlayback}
                        className="flex items-center gap-2 px-4 py-2 bg-[#282521] text-[#F8F5EE] rounded-lg text-sm hover:bg-[#282521]/85 transition-colors font-medium"
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {isPlaying ? "Pause" : "Play back recording"}
                      </button>
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="flex items-center gap-2 px-4 py-2 border border-[#D8C9B4] bg-[#F8F5EE] rounded-lg text-sm text-[#282521]/70 hover:text-[#282521] transition-colors"
                      >
                        <RotateCcw size={14} />
                        Re-record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Type mode */}
            {inputMode === "type" && (
              <div>
                <label htmlFor="typed-input" className="block text-xs uppercase tracking-widest text-[#282521]/60 mb-3 font-semibold">
                  Describe the arrangement
                </label>
                <textarea
                  id="typed-input"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  rows={8}
                  placeholder={
                    language === "hindi"
                      ? "उदाहरण: मैं रमेश कुमार इलेक्ट्रिशियन। सुनीता जी के घर पर 3 कमरों में वायरिंग, कुल ₹18,500, एडवांस ₹5,000, 18 नवंबर तक पूरा..."
                      : language === "telugu"
                      ? "ఉదాహరణ: నేను సురేష్ వర్మ, ప్లంబర్. వెంకట్ రావు గారి ఇంట్లో 2 బాత్‌రూమ్‌లు పైప్‌లైన్ ఫిట్టింగ్, మొత్తం ₹14,000..."
                      : "Example: Rajesh Sharma will paint interior 2BHK flat for Anand Verma, total ₹22,000, advance ₹6,000, complete by 22 Nov..."
                  }
                  className="w-full bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg px-4 py-3 text-sm text-[#282521] placeholder:text-[#282521]/35 focus:outline-none focus:border-[#B75D42] resize-none leading-relaxed"
                />
                <p className="text-xs text-[#282521]/50 mt-2">
                  Include worker &amp; customer names, work description, amounts, timeline, materials responsibility, and exclusions.
                </p>
              </div>
            )}

            {/* Next */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleTranscribeOrProceed}
                disabled={transcribing || (inputMode === "record" && !audioBlob && !isRecording)}
                className="flex items-center gap-2 px-6 py-3 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {transcribing ? (
                  <><Loader2 size={14} className="animate-spin" /> Transcribing with Groq Whisper…</>
                ) : (
                  <>Continue to Transcript <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Transcript ────────────────────────────────────────── */}
        {step === "transcript" && (
          <div className="space-y-6">
            {transcribeUnconfigured && (
              <InfoBanner type="warning">
                <strong>GroqCloud API unconfigured.</strong> Set <code className="bg-amber-100 px-1 rounded font-mono">GROQ_API_KEY</code> in <code className="bg-amber-100 px-1 rounded font-mono">.env.local</code> to enable Whisper transcription.
                You can review or type your transcript directly below.
              </InfoBanner>
            )}
            {transcribeError && (
              <InfoBanner type="warning">{transcribeError}</InfoBanner>
            )}
            {!transcribeUnconfigured && !transcribeError && (
              <InfoBanner type="success">
                Transcript captured via Groq Whisper. You can edit any words or details below before AI term extraction.
              </InfoBanner>
            )}

            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <label htmlFor="transcript" className="block text-xs uppercase tracking-widest text-[#282521]/60 font-semibold">
                  Spoken Arrangement Transcript (Editable)
                </label>
                <div className="flex items-center gap-2">
                  {transcript.trim() && (
                    <CopyButton value={transcript} label="Copy Transcript" successLabel="Copied" />
                  )}
                  <span className="text-[11px] text-[#282521]/50">Edit text to correct names or numbers</span>
                </div>
              </div>
              <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                placeholder="Spoken words will appear here. Edit for accuracy."
                className="w-full bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg px-4 py-3 text-sm text-[#282521] placeholder:text-[#282521]/35 focus:outline-none focus:border-[#B75D42] resize-none leading-relaxed font-mono text-xs sm:text-sm"
              />
              <p className="text-xs text-[#282521]/50 mt-2">
                This verbatim text will be saved with the agreement as the original audio statement record.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#D8C9B4] bg-[#EDE8DF] rounded-lg text-sm text-[#282521]/70 hover:text-[#282521] transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={extracting || !transcript.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors disabled:opacity-50 shadow-xs"
              >
                {extracting ? (
                  <><Loader2 size={14} className="animate-spin" /> Extracting with Groq openai/gpt-oss-120b…</>
                ) : (
                  <>Extract Agreement Details <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Extraction review & Clarification ─────────────────── */}
        {step === "extraction" && (
          <div className="space-y-6">

            {/* AI Model Attribution Banner */}
            <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[#282521]">
                  <Sparkles size={14} className="text-[#B75D42]" />
                  <span>Extracted using <strong>GroqCloud ({extractedModelName || "openai/gpt-oss-120b"})</strong></span>
                </div>
                <span className="text-[#282521]/50 italic">Review &amp; adjust all fields below</span>
              </div>
              {safetyAudit && (
                <div className="pt-2 border-t border-[#D8C9B4]/60 flex items-center gap-2 text-[11px] text-[#282521]/75 flex-wrap">
                  <span className={cn(
                    "font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider",
                    safetyAudit.status === "passed_full"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : safetyAudit.status === "passed_partial"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-[#EDE8DF] text-[#282521]/70 border border-[#D8C9B4]"
                  )}>
                    {safetyAudit.status === "passed_full"
                      ? "Meta Prompt Guard: Full Screen Passed"
                      : safetyAudit.status === "passed_partial"
                      ? "Meta Prompt Guard: Partial Screen (Passed)"
                      : "Meta Prompt Guard: Screening Unavailable"}
                  </span>
                  {safetyAudit.policy && (
                    <span className="text-[#282521]/60">{safetyAudit.policy}</span>
                  )}
                </div>
              )}
            </div>

            {extractUnconfigured && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-900 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                      AI Provider Unconfigured
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GROQ_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> to enable live Groq inference.
                      You can click below to load verified sample extracted terms or enter fields manually.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadDemoExtraction}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 text-white rounded-md text-xs font-medium hover:bg-amber-900 transition-colors shadow-xs"
                >
                  <Wand2 size={12} /> Load Verified Sample Terms
                </button>
              </div>
            )}

            {extractError && (
              <InfoBanner type="warning">{extractError} You can review and complete terms manually below.</InfoBanner>
            )}

            {/* ── Clarification & Missing Info Section (Priority Display) ── */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-amber-700 shrink-0" />
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Clarifications &amp; Ambiguities Flagged ({editedExtraction.clarificationQuestions.length})
                  </h3>
                </div>
                <span className="text-[11px] text-amber-800 font-medium">Answer questions to prevent disputes</span>
              </div>

              {editedExtraction.clarificationQuestions.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {editedExtraction.clarificationQuestions.map((q, i) => {
                    const suggestedField = detectSuggestedField(q)
                    const currentTarget = clarificationTargets[i] || suggestedField
                    return (
                      <div key={i} className="bg-[#F8F5EE] border border-amber-200 rounded-lg p-3.5 text-xs text-[#282521] space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-amber-900 leading-snug">
                            {i + 1}. {q}
                          </p>
                          <button
                            type="button"
                            onClick={() => setEditedExtraction((v) => ({
                              ...v,
                              clarificationQuestions: v.clarificationQuestions.filter((_, j) => j !== i)
                            }))}
                            className="text-amber-600 hover:text-red-600 text-xs shrink-0 font-medium px-1"
                            title="Dismiss question"
                          >
                            Dismiss
                          </button>
                        </div>

                        {/* Target field selector */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#282521]/70">
                          <span className="font-medium text-amber-950">Update field:</span>
                          <select
                            value={currentTarget}
                            onChange={(e) =>
                              setClarificationTargets((prev) => ({
                                ...prev,
                                [i]: e.target.value as TargetField,
                              }))
                            }
                            className="bg-[#EDE8DF] border border-[#D8C9B4] rounded px-2 py-1 text-[11px] text-[#282521] focus:outline-none focus:border-[#B75D42] font-medium"
                          >
                            <option value="additionalTerms">Additional Terms (General note)</option>
                            <option value="completionDate">Completion Deadline</option>
                            <option value="startDate">Start Date</option>
                            <option value="materialsResponsibility">Materials Responsibility</option>
                            <option value="totalAmount">Total Agreed Amount (₹)</option>
                            <option value="advanceAmount">Advance Deposit Amount (₹)</option>
                            <option value="workLocation">Work Location</option>
                          </select>
                          {suggestedField !== "additionalTerms" && currentTarget === suggestedField && (
                            <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/70 border border-amber-200 px-1.5 py-0.5 rounded">
                              AI Suggested Target
                            </span>
                          )}
                        </div>

                        {/* Inline answer input */}
                        {currentTarget === "completionDate" || currentTarget === "startDate" ? (
                          <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                              <input
                                type="date"
                                value={isValidISODate(clarificationAnswers[i] || "") ? clarificationAnswers[i] : ""}
                                onChange={(e) => {
                                  setClarificationAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                                  setClarificationErrors((prev) => {
                                    const next = { ...prev }
                                    delete next[i]
                                    return next
                                  })
                                }}
                                className="flex-1 bg-[#EDE8DF] border border-[#D8C9B4] rounded-md px-2.5 py-1.5 text-xs text-[#282521] focus:outline-none focus:border-[#B75D42]"
                              />
                              <button
                                type="button"
                                onClick={() => applyClarificationAnswer(i, q, currentTarget)}
                                disabled={!clarificationAnswers[i]?.trim()}
                                className="px-3 py-1.5 bg-[#B75D42] text-[#F8F5EE] rounded-md text-xs font-medium hover:bg-[#B75D42]/90 disabled:opacity-40 transition-colors shrink-0"
                              >
                                Apply {FIELD_LABELS[currentTarget]}
                              </button>
                            </div>
                            {clarificationAnswers[i] && !isValidISODate(clarificationAnswers[i]) && (
                              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-amber-900 bg-amber-100/80 border border-amber-300 rounded p-1.5">
                                <span>Draft note: &quot;{clarificationAnswers[i]}&quot; (Relative term)</span>
                                <button
                                  type="button"
                                  onClick={() => applyClarificationAnswer(i, q, "additionalTerms")}
                                  className="text-[#B75D42] font-semibold underline hover:text-[#9A4B33]"
                                >
                                  Save as Verbal Term Instead
                                </button>
                              </div>
                            )}
                            {clarificationErrors[i] && (
                              <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded p-1.5">
                                {clarificationErrors[i]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={clarificationAnswers[i] || ""}
                                onChange={(e) => {
                                  setClarificationAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                                  setClarificationErrors((prev) => {
                                    const next = { ...prev }
                                    delete next[i]
                                    return next
                                  })
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    applyClarificationAnswer(i, q, currentTarget)
                                  }
                                }}
                                placeholder={
                                  currentTarget === "materialsResponsibility"
                                    ? "e.g. Customer provides all pipes, or Worker provides"
                                    : currentTarget === "totalAmount" || currentTarget === "advanceAmount"
                                    ? "e.g. 15000"
                                    : "Type your answer to this question…"
                                }
                                className="flex-1 bg-[#EDE8DF] border border-[#D8C9B4] rounded-md px-2.5 py-1.5 text-xs text-[#282521] focus:outline-none focus:border-[#B75D42]"
                              />
                              <button
                                type="button"
                                onClick={() => applyClarificationAnswer(i, q, currentTarget)}
                                disabled={!clarificationAnswers[i]?.trim()}
                                className="px-3 py-1.5 bg-[#B75D42] text-[#F8F5EE] rounded-md text-xs font-medium hover:bg-[#B75D42]/90 disabled:opacity-40 transition-colors shrink-0"
                              >
                                {currentTarget === "additionalTerms" ? "Add to Terms" : `Apply to ${FIELD_LABELS[currentTarget]}`}
                              </button>
                            </div>
                            {clarificationErrors[i] && (
                              <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded p-1.5">
                                {clarificationErrors[i]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-900/70 mb-3 italic">
                  ✓ All ambiguities resolved or none detected in transcript.
                </p>
              )}

              {/* Add custom question */}
              <TagListField
                label="Add Custom Question or Open Item"
                items={[]}
                onChange={(items) => {
                  if (items.length > 0) {
                    setEditedExtraction((v) => ({
                      ...v,
                      clarificationQuestions: [...v.clarificationQuestions, ...items]
                    }))
                  }
                }}
                placeholder="e.g. Who provides scaffolding?"
              />
            </div>

            {/* ── Editable Extracted Fields ────────────────────────────── */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-[#D8C9B4] pb-2 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider text-[#282521]/60 font-bold">
                  Agreement Details (Edit as needed)
                </h3>
                <span className="text-[11px] text-[#282521]/50">Your edits will be saved</span>
              </div>

              {/* Title */}
              <Field label="Agreement title" required>
                <input
                  type="text"
                  value={editedExtraction.title}
                  onChange={(e) => setEditedExtraction((v) => ({ ...v, title: e.target.value }))}
                  placeholder="e.g. Electrical Wiring & Switchboards"
                  className="field-input"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Worker / service provider" required>
                  <input
                    type="text"
                    value={editedExtraction.workerName}
                    onChange={(e) => setEditedExtraction((v) => ({ ...v, workerName: e.target.value }))}
                    placeholder="Name and trade"
                    className="field-input"
                  />
                </Field>
                <Field label="Customer / client" required>
                  <input
                    type="text"
                    value={editedExtraction.customerName}
                    onChange={(e) => setEditedExtraction((v) => ({ ...v, customerName: e.target.value }))}
                    placeholder="Customer name"
                    className="field-input"
                  />
                </Field>
              </div>

              <Field label="Description of work">
                <textarea
                  value={editedExtraction.description}
                  onChange={(e) => setEditedExtraction((v) => ({ ...v, description: e.target.value }))}
                  rows={3}
                  placeholder="Clear description of the work"
                  className="field-input resize-none"
                />
              </Field>

              <Field label="Work location">
                <input
                  type="text"
                  value={editedExtraction.workLocation ?? ""}
                  onChange={(e) => setEditedExtraction((v) => ({ ...v, workLocation: e.target.value || null }))}
                  placeholder="Address or site area"
                  className="field-input"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Total agreed amount (₹)">
                  <input
                    type="number"
                    value={editedExtraction.totalAmount ?? ""}
                    onChange={(e) => setEditedExtraction((v) => ({
                      ...v,
                      totalAmount: e.target.value ? Number(e.target.value) : null,
                    }))}
                    placeholder="Leave blank if unknown"
                    className="field-input font-medium"
                    min={0}
                  />
                </Field>
                <Field label="Advance agreed (₹)">
                  <input
                    type="number"
                    value={editedExtraction.advanceAmount ?? ""}
                    onChange={(e) => setEditedExtraction((v) => ({
                      ...v,
                      advanceAmount: e.target.value ? Number(e.target.value) : null,
                    }))}
                    placeholder="Leave blank if unknown"
                    className="field-input font-medium"
                    min={0}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Start date">
                  <input
                    type="date"
                    value={editedExtraction.startDate ?? ""}
                    onChange={(e) => setEditedExtraction((v) => ({ ...v, startDate: e.target.value || null }))}
                    className="field-input"
                  />
                </Field>
                <Field label="Completion date">
                  <input
                    type="date"
                    value={editedExtraction.completionDate ?? ""}
                    onChange={(e) => setEditedExtraction((v) => ({ ...v, completionDate: e.target.value || null }))}
                    className="field-input"
                  />
                </Field>
              </div>

              <Field label="Materials responsibility">
                <select
                  value={editedExtraction.materialsResponsibility ?? ""}
                  onChange={(e) => setEditedExtraction((v) => ({
                    ...v,
                    materialsResponsibility: (e.target.value as Agreement["materialsResponsibility"]) || null,
                  }))}
                  className="field-input"
                >
                  <option value="">— Not specified in conversation (Unknown) —</option>
                  <option value="worker">Worker provides materials</option>
                  <option value="customer">Customer provides materials</option>
                  <option value="shared">Shared / both contribute materials</option>
                </select>
              </Field>

              {/* Included work */}
              <TagListField
                label="Scope of work (Included Tasks)"
                items={editedExtraction.includedWork}
                onChange={(items) => setEditedExtraction((v) => ({ ...v, includedWork: items }))}
                placeholder="Add included task and press Enter"
              />

              {/* Excluded work */}
              <TagListField
                label="Explicitly excluded work (Avoid disputes)"
                items={editedExtraction.excludedWork}
                onChange={(items) => setEditedExtraction((v) => ({ ...v, excludedWork: items }))}
                placeholder="What is specifically NOT included"
              />

              {/* Additional terms */}
              <TagListField
                label="Additional agreed terms &amp; clarifications"
                items={editedExtraction.additionalTerms}
                onChange={(items) => setEditedExtraction((v) => ({ ...v, additionalTerms: items }))}
                placeholder="e.g. daily cleaning, working hours"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("transcript")}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#D8C9B4] bg-[#EDE8DF] rounded-lg text-sm text-[#282521]/70 hover:text-[#282521] transition-colors"
              >
                <ChevronLeft size={14} /> Back to Transcript
              </button>
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors shadow-xs"
              >
                Review Final Summary <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Confirm ───────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="space-y-6">

            {/* Review before sharing notice */}
            <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-xl p-4 flex items-start gap-3 text-xs text-[#282521]/80 leading-relaxed">
              <ShieldCheck size={18} className="text-[#B75D42] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#282521] font-semibold block mb-0.5">Review Before Saving &amp; Sharing:</strong>
                This digital agreement record reflects your final reviewed terms. Once saved, it will be stored locally on this device, ready for payment tracking, WhatsApp sharing, and PDF export.
              </div>
            </div>

            {/* Summary card */}
            <div className="border border-[#D8C9B4] bg-[#F8F5EE] rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 bg-[#EDE8DF] border-b border-[#D8C9B4] flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#B75D42] mb-1 font-semibold">
                    Digital Agreement Record
                  </p>
                  <h2
                    className="text-xl text-[#282521] font-bold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {editedExtraction.title || "Untitled Agreement"}
                  </h2>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#282521]/60 border border-[#D8C9B4] rounded-full px-2.5 py-1 bg-[#F8F5EE] font-semibold">
                  Status: Draft
                </span>
              </div>

              <dl className="divide-y divide-[#D8C9B4]/60 text-sm">
                <SummaryRow label="Worker" value={editedExtraction.workerName || "Not specified"} />
                <SummaryRow label="Customer" value={editedExtraction.customerName || "Not specified"} />
                <SummaryRow label="Description" value={editedExtraction.description || "Not specified"} />
                <SummaryRow label="Location" value={editedExtraction.workLocation || "Not specified"} />
                <SummaryRow
                  label="Total Amount"
                  value={editedExtraction.totalAmount != null ? `₹${editedExtraction.totalAmount.toLocaleString("en-IN")}` : "Not specified"}
                />
                <SummaryRow
                  label="Advance Agreed"
                  value={editedExtraction.advanceAmount != null ? `₹${editedExtraction.advanceAmount.toLocaleString("en-IN")}` : "Not specified"}
                />
                <SummaryRow label="Start Date" value={editedExtraction.startDate || "Not specified"} />
                <SummaryRow label="Completion Date" value={editedExtraction.completionDate || "Not specified"} />
                <SummaryRow label="Materials" value={editedExtraction.materialsResponsibility ?? "Not specified"} />
                {editedExtraction.includedWork.length > 0 && (
                  <SummaryRow
                    label="Included Scope"
                    value={editedExtraction.includedWork.join(" • ")}
                  />
                )}
                {editedExtraction.excludedWork.length > 0 && (
                  <SummaryRow
                    label="Excluded Work"
                    value={editedExtraction.excludedWork.join(" • ")}
                  />
                )}
                {editedExtraction.additionalTerms.length > 0 && (
                  <SummaryRow
                    label="Agreed Terms"
                    value={editedExtraction.additionalTerms.join(" • ")}
                  />
                )}
                {editedExtraction.clarificationQuestions.length > 0 && (
                  <SummaryRow
                    label="Open Items"
                    value={`${editedExtraction.clarificationQuestions.length} item(s) to clarify before completion`}
                  />
                )}
              </dl>
            </div>

            <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg p-4 text-xs text-[#282521]/65 leading-relaxed space-y-1">
              <p>
                <strong className="text-[#282521] font-semibold">Transparency &amp; Legal Notice:</strong> BolSaakshi generates written records of oral arrangements to clarify expectations and reduce payment disputes. It does not provide legal representation or government-notarized contracts.
              </p>
              <p>
                <strong className="text-[#282521] font-semibold">Data Privacy:</strong> Saved agreements are stored exclusively on this device in browser local storage. Submitted audio and transcripts are sent securely to GroqCloud solely for real-time speech transcription and term extraction, and are not retained on application servers.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("extraction")}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#D8C9B4] bg-[#EDE8DF] rounded-lg text-sm text-[#282521]/70 hover:text-[#282521] transition-colors font-medium"
              >
                <ChevronLeft size={14} /> Back to Details
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-7 py-2.5 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors disabled:opacity-50 shadow-xs"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving…</>
                ) : (
                  <><FileText size={14} /> Save Agreement Record</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline styles for field inputs */}
      <style>{`
        .field-input {
          width: 100%;
          background: #EDE8DF;
          border: 1px solid #D8C9B4;
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #282521;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input:focus {
          border-color: #B75D42;
        }
        .field-input::placeholder {
          color: rgba(40,37,33,0.35);
        }
      `}</style>
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, required, children }: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-[#282521]/60 mb-2 font-semibold">
        {label}{required && <span className="text-[#B75D42] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Tag list field ────────────────────────────────────────────────────────────

function TagListField({
  label, items, onChange, placeholder,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const val = draft.trim()
    if (val && !items.includes(val)) {
      onChange([...items, val])
    }
    setDraft("")
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-[#282521]/60 mb-2 font-semibold">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg px-3 py-2 text-sm text-[#282521] placeholder:text-[#282521]/35 focus:outline-none focus:border-[#B75D42]"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-[#282521] text-[#F8F5EE] rounded-lg text-sm hover:bg-[#282521]/80 transition-colors font-medium flex items-center gap-1"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-[#F8F5EE] border border-[#D8C9B4] rounded-md px-2.5 py-1 text-xs text-[#282521]/85"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-[#282521]/40 hover:text-red-600 transition-colors ml-1 font-bold"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-5 py-3 gap-4">
      <dt className="text-[#282521]/55 shrink-0 w-32 text-xs uppercase tracking-wider font-semibold pt-0.5">
        {label}
      </dt>
      <dd className="text-[#282521] text-sm leading-relaxed">{value}</dd>
    </div>
  )
}
