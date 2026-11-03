"use client"

import React from "react"
import { Mic, HelpCircle, CheckCircle2, MessageCircle, Printer, ArrowRight } from "lucide-react"
import Link from "next/link"

const STEPS = [
  {
    number: "01",
    title: "Speak your terms freely",
    tagline: "Speech-First in 3 Indian Languages",
    description:
      "Describe the work arrangement just like you do on-site. Speak in Hindi, Telugu, or English about the job scope, agreed rates, and advance payments.",
    uiWidget: (
      <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 shadow-xs space-y-3">
        {/* Language selector pill */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-[#B75D42]">
            <Mic size={14} className="animate-pulse" />
            Live Voice Input
          </span>
          <div className="flex gap-1">
            <span className="px-2 py-0.5 rounded-full bg-[#B75D42] text-[#F8F5EE] text-[10px] font-bold">हिन्दी</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EDE8DF] text-[#282521]/70 text-[10px] font-medium">తెలుగు</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EDE8DF] text-[#282521]/70 text-[10px] font-medium">EN</span>
          </div>
        </div>

        {/* Spoken audio wave simulation */}
        <div className="bg-[#EDE8DF] rounded-lg p-3 flex items-center gap-2">
          <div className="flex items-center gap-1 h-6 shrink-0">
            {[40, 75, 100, 60, 90, 45, 80, 50, 65, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#B75D42] rounded-full inline-block"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="text-xs text-[#282521]/80 italic line-clamp-2 leading-relaxed">
            &ldquo;...3 कमरों की कंसील्ड वायरिंग, कुल मजदूरी ₹18,500 तय हुई है। ₹5,000 एडवांस काम शुरू होने पर मिलेगा...&rdquo;
          </p>
        </div>

        {/* Micro badge */}
        <div className="flex items-center justify-between text-[11px] text-[#282521]/50 pt-1 border-t border-[#D8C9B4]/60">
          <span>Audio: 16kHz PCM</span>
          <span className="text-emerald-700 font-semibold">✓ Transcribed by Whisper</span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Flag missing terms",
    tagline: "Targeted Clarification Prompts",
    description:
      "Most job disputes happen because of unstated terms. BolSaakshi detects missing completion dates, unclear materials responsibility, and asks targeted questions.",
    uiWidget: (
      <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 shadow-xs space-y-3">
        {/* Missing term banner */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <HelpCircle size={15} className="text-amber-800 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">Clarification Needed</p>
            <p className="text-xs text-amber-950 font-medium">Who provides all wires and modular boxes?</p>
          </div>
        </div>

        {/* Resolved term */}
        <div className="bg-[#EDE8DF] rounded-lg p-2.5 border border-[#D8C9B4]">
          <p className="text-[10px] uppercase font-bold text-[#282521]/60 tracking-wider mb-1">
            Worker &amp; Customer Confirmed:
          </p>
          <div className="flex items-start gap-1.5 text-xs text-[#282521]">
            <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
            <span className="font-medium">Customer supplies all wires &amp; MCB; worker provides only labor.</span>
          </div>
        </div>

        {/* Micro badge */}
        <div className="flex items-center justify-between text-[11px] text-[#282521]/50 pt-1 border-t border-[#D8C9B4]/60">
          <span>Leaves unstated facts null</span>
          <span className="text-[#B75D42] font-semibold">Flags missing terms for human review</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Agree & share with ease",
    tagline: "Track Payments & PDF Export",
    description:
      "Review the finalized agreement, track advances and balance milestones, share a clean summary via WhatsApp, or print with formal signature lines.",
    uiWidget: (
      <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-4 shadow-xs space-y-3">
        {/* Payment overview */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#EDE8DF] rounded-md p-1.5 border border-[#D8C9B4]">
            <span className="text-[9px] block text-[#282521]/50 uppercase font-semibold">Agreed</span>
            <span className="font-bold text-[#282521]">₹18,500</span>
          </div>
          <div className="bg-emerald-50 rounded-md p-1.5 border border-emerald-200">
            <span className="text-[9px] block text-emerald-800 uppercase font-semibold">Paid</span>
            <span className="font-bold text-emerald-800">₹5,000</span>
          </div>
          <div className="bg-amber-50 rounded-md p-1.5 border border-amber-200">
            <span className="text-[9px] block text-[#B75D42] uppercase font-semibold">Balance</span>
            <span className="font-bold text-[#B75D42]">₹13,500</span>
          </div>
        </div>

        {/* Action pills */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50 border border-emerald-300 rounded-lg text-[11px] font-semibold text-emerald-800">
            <MessageCircle size={12} /> WhatsApp Share
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg text-[11px] font-semibold text-[#282521]">
            <Printer size={12} /> Print PDF
          </div>
        </div>

        {/* Micro badge */}
        <div className="flex items-center justify-between text-[11px] text-[#282521]/50 pt-1 border-t border-[#D8C9B4]/60">
          <span>Physical signature ready</span>
          <span className="text-emerald-700 font-semibold">✓ Thumbprint line</span>
        </div>
      </div>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#EDE8DF] border-y border-[#D8C9B4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-[#B75D42] font-bold mb-3">
            Simple 3-Step Workflow
          </p>
          <h2
            className="text-3xl sm:text-4xl text-[#282521] font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            From spoken word to verifiable record
          </h2>
          <p className="text-sm sm:text-base text-[#282521]/70 leading-relaxed">
            Designed for informal work conditions where trust matters most. No complicated legal forms, no legal jargon.
          </p>
        </div>

        {/* Steps Grid with custom UI mini-widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-2xl p-6 flex flex-col justify-between hover:border-[#B75D42]/60 hover:shadow-xs transition-all duration-200"
            >
              <div>
                {/* Step number badge & category */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#EDE8DF] border border-[#D8C9B4] text-lg font-bold text-[#B75D42]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.number}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#282521]/50 bg-[#EDE8DF] px-2.5 py-1 rounded-full border border-[#D8C9B4]/50">
                    {step.tagline}
                  </span>
                </div>

                {/* Step Title & Description */}
                <h3
                  className="text-xl font-bold text-[#282521] mb-2 leading-snug"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#282521]/65 leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              {/* Realistic Feature Illustration Built With UI Primitives */}
              <div className="mt-auto pt-2">
                {step.uiWidget}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA prompt */}
        <div className="mt-14 text-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#B75D42] hover:text-[#282521] transition-colors"
          >
            <span>Try creating an agreement with voice or text</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  )
}
