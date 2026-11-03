"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mic, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Clock } from "lucide-react"
import AnimatedButton from "@/components/ui/animated-button"
import StaggerText from "@/components/ui/stagger-text"
import BorderBeam from "@/components/ui/border-beam"

// Realistic product preview data representing authentic Indian trade worker arrangements
const SAMPLE_AGREEMENT = {
  id: "BS-2026-0842",
  title: "Electrical Concealed Wiring & Board Fitting",
  trade: "Electrician",
  worker: "Ramesh Kumar",
  customer: "Sunita Devi",
  location: "House #42, Green Glen Layout, Bengaluru",
  amount: "₹18,500",
  advance: "₹5,000",
  balance: "₹13,500",
  timeline: "10 Nov – 18 Nov 2026",
  materials: "Customer provides all wire, MCB & modular boxes",
  scope: [
    "Concealed PVC pipe channeling in 3 rooms",
    "Wiring for 6 modular switchboards & heavy points",
    "Distribution board 8-way MCB wiring & load testing",
  ],
  clarificationResolved: "Masonry plastering excluded (arranged by customer)",
}

export default function Hero() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden bg-[#F8F5EE]">
      {/* Subtle warm paper grid texture */}
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 47px, #D8C9B4 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, #D8C9B4 48px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* Gentle ambient gradient washes */}
      <div
        className="absolute top-1/4 right-0 w-96 h-96 bg-[#B75D42]/6 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-0 w-80 h-80 bg-[#D8C9B4]/40 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* ── Left column: copy (7 cols on large screens) ───────────── */}
          <div className="lg:col-span-7">
            {/* Top Badge */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="inline-flex items-center gap-2 bg-[#EDE8DF] border border-[#D8C9B4] rounded-full px-3.5 py-1 text-xs text-[#282521]/75 mb-6 shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#B75D42]" />
              <span className="font-semibold tracking-wide uppercase text-[10px] text-[#B75D42]">
                बोल साक्षी • BolSaakshi
              </span>
              <span className="text-[#D8C9B4]">|</span>
              <span className="text-[11px] font-medium text-[#282521]/65">
                Spoken work. Written clarity.
              </span>
            </motion.div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[58px] text-[#282521] leading-[1.08] tracking-tight mb-6 font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <StaggerText delay={0.1}>A spoken promise</StaggerText>
              <br />
              <span className="text-[#B75D42] italic font-normal">
                <StaggerText delay={0.25}>deserves written clarity.</StaggerText>
              </span>
            </h1>

            {/* Lead paragraph */}
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-[#282521]/70 leading-relaxed mb-8 max-w-xl"
            >
              For electricians, plumbers, carpenters, and local contractors across India.
              Work starts with a verbal nod in <strong>Hindi, Telugu, or English</strong>. BolSaakshi
              listens, identifies missing terms, and creates a clear digital agreement record both parties can trust.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.45, delay: 0.4 }}
              className="flex flex-wrap gap-3.5 items-center mb-10"
            >
              <Link href="/create">
                <AnimatedButton className="bg-[#B75D42] border-[#B75D42] text-[#F8F5EE] hover:bg-[#B75D42]/90 px-6 py-3.5 text-sm font-semibold rounded-lg shadow-sm">
                  <span className="flex items-center gap-2">
                    <Mic size={16} />
                    Create Your First Agreement
                    <ArrowRight size={14} />
                  </span>
                </AnimatedButton>
              </Link>
              <Link
                href="/agreements"
                className="inline-flex items-center gap-2 text-[#282521] hover:text-[#B75D42] transition-colors text-sm font-medium border border-[#D8C9B4] bg-[#EDE8DF]/60 rounded-lg px-5 py-3 hover:bg-[#EDE8DF] hover:border-[#B75D42]/60"
              >
                View Sample Records
              </Link>
            </motion.div>

            {/* Micro value props */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="grid grid-cols-3 gap-3 border-t border-[#D8C9B4]/80 pt-6 max-w-lg"
            >
              <div>
                <p className="text-[11px] font-bold text-[#B75D42] uppercase tracking-wider">Zero Setup</p>
                <p className="text-xs text-[#282521]/65 mt-0.5">No login or app install needed</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#B75D42] uppercase tracking-wider">Private</p>
                <p className="text-xs text-[#282521]/65 mt-0.5">Records stored on device</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#B75D42] uppercase tracking-wider">Multi-lingual</p>
                <p className="text-xs text-[#282521]/65 mt-0.5">Hindi · Telugu · English</p>
              </div>
            </motion.div>
          </div>

          {/* ── Right column: Product preview (5 cols on large screens) ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="lg:col-span-5 relative"
          >
            {/* Top status indicator tag */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] uppercase tracking-widest text-[#282521]/55 font-bold flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#B75D42]" />
                Live Product Output
              </span>
              <span className="text-[11px] font-mono text-[#282521]/45">
                Record #{SAMPLE_AGREEMENT.id}
              </span>
            </div>

            {/* Document card container with VengeanceUI BorderBeam */}
            <div className="relative rounded-2xl border border-[#D8C9B4] bg-[#F8F5EE] shadow-sm overflow-hidden">
              <BorderBeam size={220} duration={12} borderWidth={2} colorFrom="#B75D42" colorTo="#D8C9B4" />

              {/* Card Header */}
              <div className="px-5 py-4 border-b border-[#D8C9B4] bg-[#EDE8DF] flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#B75D42] font-bold bg-[#B75D42]/10 px-2 py-0.5 rounded-full">
                      {SAMPLE_AGREEMENT.trade}
                    </span>
                    <span className="text-xs text-[#282521]/50 font-medium">Spoken Audio Transcribed</span>
                  </div>
                  <h2
                    className="text-base font-bold text-[#282521] leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {SAMPLE_AGREEMENT.title}
                  </h2>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800">
                  <Clock size={10} />
                  Draft Record
                </span>
              </div>

              {/* Parties Section */}
              <div className="px-5 py-3.5 border-b border-[#D8C9B4]/60 grid grid-cols-2 gap-4 text-xs bg-[#F8F5EE]">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#282521]/50 font-bold mb-0.5">Worker</p>
                  <p className="text-sm font-bold text-[#282521]">{SAMPLE_AGREEMENT.worker}</p>
                  <p className="text-[11px] text-[#282521]/60">Licensed Electrician</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#282521]/50 font-bold mb-0.5">Customer</p>
                  <p className="text-sm font-bold text-[#282521]">{SAMPLE_AGREEMENT.customer}</p>
                  <p className="text-[11px] text-[#282521]/60">Flat Owner</p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="px-5 py-3.5 border-b border-[#D8C9B4]/60 bg-[#EDE8DF]/50">
                <p className="text-[10px] uppercase tracking-widest text-[#282521]/50 font-bold mb-2">Agreed Payment Terms</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-lg p-2">
                    <span className="text-[10px] block uppercase text-[#282521]/55 font-semibold">Total Fee</span>
                    <span className="text-sm font-bold text-[#282521]" style={{ fontFamily: "var(--font-heading)" }}>
                      {SAMPLE_AGREEMENT.amount}
                    </span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2">
                    <span className="text-[10px] block uppercase text-emerald-800 font-semibold">Advance</span>
                    <span className="text-sm font-bold text-emerald-800" style={{ fontFamily: "var(--font-heading)" }}>
                      {SAMPLE_AGREEMENT.advance}
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-2">
                    <span className="text-[10px] block uppercase text-amber-800 font-semibold">Balance Due</span>
                    <span className="text-sm font-bold text-[#B75D42]" style={{ fontFamily: "var(--font-heading)" }}>
                      {SAMPLE_AGREEMENT.balance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scope & Clarifications */}
              <div className="px-5 py-3.5 space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#282521]/50 font-bold mb-1.5">Agreed Scope of Work</p>
                  <ul className="space-y-1">
                    {SAMPLE_AGREEMENT.scope.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[#282521]/80 leading-snug">
                        <CheckCircle2 size={12} className="text-[#B75D42] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Clarification Tag */}
                <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg p-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#B75D42] block mb-0.5">
                    Resolved Clarification Question
                  </span>
                  <p className="text-[11px] text-[#282521]/75 leading-relaxed">
                    {SAMPLE_AGREEMENT.clarificationResolved}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-[#EDE8DF] border-t border-[#D8C9B4] flex items-center justify-between text-[11px] text-[#282521]/60">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#B75D42]" /> Ready for WhatsApp or PDF Print
                </span>
                <Link href="/create" className="text-[#B75D42] font-bold hover:underline">
                  Try it now →
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
