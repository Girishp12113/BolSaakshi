"use client"

import React from "react"
import { Mic, Brain, CreditCard, FileText, ShieldAlert } from "lucide-react"

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-[#F8F5EE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-widest text-[#B75D42] font-bold mb-3">
            Core Capabilities
          </p>
          <h2
            className="text-3xl sm:text-4xl text-[#282521] font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Engineered for informal work realities
          </h2>
          <p className="text-sm sm:text-base text-[#282521]/70 leading-relaxed">
            Standard contract templates fail informal workers because deals are struck informally over tea or phone calls.
            BolSaakshi addresses the actual points of confusion: advances, materials, scope limits, and milestones.
          </p>
        </div>

        {/* Feature Grid with UI Primitives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Feature 1: Multilingual Voice Capture */}
          <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#B75D42]/60 hover:shadow-xs transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#B75D42] font-bold bg-[#F8F5EE] px-2.5 py-1 rounded-full border border-[#D8C9B4]">
                  <Mic size={12} />
                  Speech Recognition
                </span>
                <span className="text-xs text-[#282521]/50 font-mono">Whisper Large v3</span>
              </div>
              <h3
                className="text-xl font-bold text-[#282521] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Native speech in Hindi, Telugu, and English
              </h3>
              <p className="text-xs sm:text-sm text-[#282521]/65 leading-relaxed mb-6">
                Accurately handles trade vernacular, regional accents, mixed phrases, and informal numbers (e.g. &ldquo;पंद्रह हजार पांच सौ&rdquo; or &ldquo;పది వేల రూపాయలు&rdquo;) without forcing formal phrasing.
              </p>
            </div>

            {/* UI Primitive Illustration */}
            <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#282521]/60">
                <span className="font-semibold text-[#282521]">Voice Stream (Telugu Plumber)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">Verified Transcription</span>
              </div>
              <div className="p-2.5 bg-[#EDE8DF] rounded-lg text-xs text-[#282521]/80 font-mono leading-relaxed">
                &ldquo;...మొత్తం లేబర్ ఛార్జ్ ₹14,000. అడ్వాన్స్ ₹4,000 రేపు పని మొదలుపెట్టినప్పుడు ఇవ్వాలి. సిపివిసి పైపులు వెంకట్ రావు గారే కొనివ్వాలి...&rdquo;
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#282521]/50 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Extracted: Total ₹14,000 • Advance ₹4,000 • Customer Materials</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Structured Clarity Audits */}
          <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#B75D42]/60 hover:shadow-xs transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#B75D42] font-bold bg-[#F8F5EE] px-2.5 py-1 rounded-full border border-[#D8C9B4]">
                  <Brain size={12} />
                  Reasoning AI
                </span>
                <span className="text-xs text-[#282521]/50 font-mono">GPT-OSS-120B</span>
              </div>
              <h3
                className="text-xl font-bold text-[#282521] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Missing-term detection &amp; ambiguity flags
              </h3>
              <p className="text-xs sm:text-sm text-[#282521]/65 leading-relaxed mb-6">
                Designed to curb unverified model assumptions by retaining unstated terms as <code className="text-xs font-mono bg-[#D8C9B4]/40 px-1 py-0.5 rounded">null</code> and prompting targeted clarification questions to confirm key facts upfront.
              </p>
            </div>

            {/* UI Primitive Illustration */}
            <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-1">
                  <ShieldAlert size={13} className="text-amber-800" /> Unstated Terms Detected
                </span>
                <span className="text-[10px] uppercase tracking-wide font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Audit Flag
                </span>
              </div>
              <div className="border border-amber-200 bg-amber-50/60 rounded-lg p-2.5 text-xs text-amber-950 space-y-1">
                <p className="font-bold">• Completion date missing from audio</p>
                <p className="font-bold">• Tile-cutting excluded work clarified</p>
              </div>
              <p className="text-[10px] text-[#282521]/60 italic">
                Users can answer inline; responses automatically integrate into the agreement.
              </p>
            </div>
          </div>

          {/* Feature 3: Payment Milestones & Outstanding Balance */}
          <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#B75D42]/60 hover:shadow-xs transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#B75D42] font-bold bg-[#F8F5EE] px-2.5 py-1 rounded-full border border-[#D8C9B4]">
                  <CreditCard size={12} />
                  Cashflow Protection
                </span>
                <span className="text-xs text-[#282521]/50 font-mono">Live INR Tracker</span>
              </div>
              <h3
                className="text-xl font-bold text-[#282521] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Advance tracking and transparent balances
              </h3>
              <p className="text-xs sm:text-sm text-[#282521]/65 leading-relaxed mb-6">
                Log advances and staged instalments as cash or UPI payments occur. Both parties always see the real-time calculated remaining balance with dated transaction notes.
              </p>
            </div>

            {/* UI Primitive Illustration */}
            <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#282521]/60 font-semibold">Payment Progress</span>
                <span className="font-bold text-emerald-800">₹6,000 of ₹22,000 paid (27%)</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full bg-[#EDE8DF] rounded-full overflow-hidden border border-[#D8C9B4]/60">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: "27%" }} />
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-emerald-800 font-semibold">Advance: ₹6,000 (UPI)</span>
                <span className="text-[#B75D42] font-bold">Pending: ₹16,000</span>
              </div>
            </div>
          </div>

          {/* Feature 4: WhatsApp Sharing & Printable Physical Records */}
          <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#B75D42]/60 hover:shadow-xs transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#B75D42] font-bold bg-[#F8F5EE] px-2.5 py-1 rounded-full border border-[#D8C9B4]">
                  <FileText size={12} />
                  Paper Documentation
                </span>
                <span className="text-xs text-[#282521]/50 font-mono">PDF &amp; Print</span>
              </div>
              <h3
                className="text-xl font-bold text-[#282521] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                WhatsApp summary &amp; signature-ready printout
              </h3>
              <p className="text-xs sm:text-sm text-[#282521]/65 leading-relaxed mb-6">
                One-click WhatsApp sharing lets you send a concise summary directly to the other party. Export an official PDF or print a hardcopy with dual signature and thumbprint lines.
              </p>
            </div>

            {/* UI Primitive Illustration */}
            <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-[#D8C9B4]/60">
                <span className="font-bold text-[#282521]">BolSaakshi Service Record</span>
                <span className="text-[10px] font-mono text-[#282521]/50">Print/PDF Layout</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center py-1">
                <div className="border border-dashed border-[#282521]/40 rounded p-2">
                  <div className="h-4 border-b border-[#282521]/40 mb-1" />
                  <span className="text-[10px] text-[#282521]/70 font-semibold block">Worker Signature / Thumb</span>
                </div>
                <div className="border border-dashed border-[#282521]/40 rounded p-2">
                  <div className="h-4 border-b border-[#282521]/40 mb-1" />
                  <span className="text-[10px] text-[#282521]/70 font-semibold block">Customer Signature / Thumb</span>
                </div>
              </div>
              <p className="text-[10px] text-center text-[#282521]/50">
                Preserves oral arrangements on paper without lawyers.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
