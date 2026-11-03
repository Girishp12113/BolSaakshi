import Nav from "@/components/nav"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Footer from "@/components/footer"
import Link from "next/link"
import { Mic, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import AnimatedButton from "@/components/ui/animated-button"
import BorderBeam from "@/components/ui/border-beam"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />

      {/* ── Closing CTA Section ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#EDE8DF] border-t border-[#D8C9B4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl border border-[#D8C9B4] bg-[#F8F5EE] p-8 sm:p-12 text-center shadow-xs overflow-hidden">
            <BorderBeam size={260} duration={14} borderWidth={2} colorFrom="#B75D42" colorTo="#D8C9B4" />

            <div className="inline-flex items-center gap-1.5 bg-[#EDE8DF] border border-[#D8C9B4] rounded-full px-3 py-1 text-xs text-[#B75D42] font-bold uppercase tracking-wider mb-6">
              <Sparkles size={12} />
              Spoken Work • Written Clarity
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-[#282521] font-bold tracking-tight mb-5 max-w-2xl mx-auto leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Turn your next spoken deal into a clear written agreement.
            </h2>

            <p className="text-base sm:text-lg text-[#282521]/70 mb-8 max-w-xl mx-auto leading-relaxed">
              No account creation. No credit card. Works on any mobile phone or browser in Hindi, Telugu, or English.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Link href="/create">
                <AnimatedButton className="bg-[#B75D42] border-[#B75D42] text-[#F8F5EE] hover:bg-[#B75D42]/90 px-8 py-3.5 text-sm font-semibold rounded-lg shadow-sm">
                  <span className="flex items-center gap-2">
                    <Mic size={16} />
                    Start Speaking or Typing
                    <ArrowRight size={14} />
                  </span>
                </AnimatedButton>
              </Link>
              <Link
                href="/agreements"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#D8C9B4] bg-[#EDE8DF] rounded-lg text-sm font-semibold text-[#282521] hover:bg-[#D8C9B4]/40 transition-colors"
              >
                Browse Saved Agreements
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#282521]/50 border-t border-[#D8C9B4]/60 pt-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#B75D42]" /> Private on device
              </span>
              <span>•</span>
              <span>100% Free for tradespersons</span>
              <span>•</span>
              <span>Instant WhatsApp &amp; PDF Export</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
