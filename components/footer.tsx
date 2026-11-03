import Link from "next/link"
import { FileText } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

          {/* Logo + tagline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-terracotta text-ivory shrink-0">
                <FileText size={16} strokeWidth={1.8} />
              </span>
              <span
                className="text-xl font-semibold text-ivory leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                BolSaakshi
              </span>
            </div>
            <p className="text-sm text-ivory/45 max-w-xs leading-relaxed">
              Spoken word. Written clarity.
            </p>
            <p className="mt-3 text-xs text-ivory/30 max-w-xs leading-relaxed">
              BolSaakshi creates written records of verbal arrangements. It is not a legal service
              and does not produce legally binding contracts. Always consult a legal professional
              for binding agreements.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation" className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <Link href="/create" className="text-sm text-ivory/55 hover:text-ivory transition-colors">
              Create agreement
            </Link>
            <Link href="/agreements" className="text-sm text-ivory/55 hover:text-ivory transition-colors">
              My agreements
            </Link>
            <Link href="/#how-it-works" className="text-sm text-ivory/55 hover:text-ivory transition-colors">
              How it works
            </Link>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ivory/25">
            &copy; {new Date().getFullYear()} BolSaakshi. Built for the Meta Global AI Hackathon.
          </p>
          <p className="text-xs text-ivory/25">
            Data stays on your device. No account needed.
          </p>
        </div>
      </div>
    </footer>
  )
}
