"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import AnimatedButton from "@/components/ui/animated-button"

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "My Agreements", href: "/agreements" },
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-[#F8F5EE]/95 backdrop-blur-md shadow-xs border-b border-[#D8C9B4]"
          : "bg-[#F8F5EE]/80 backdrop-blur-xs border-b border-[#D8C9B4]/50"
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#B75D42] text-[#F8F5EE] shadow-xs">
              <FileText size={16} strokeWidth={2} />
            </span>
            <div className="flex flex-col leading-none">
              <span
                className="text-lg font-bold text-[#282521] tracking-tight group-hover:text-[#B75D42] transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                बोल साक्षी
              </span>
              <span className="text-[10px] tracking-widest text-[#B75D42] uppercase font-semibold">
                BolSaakshi
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-150 py-1",
                  pathname === link.href
                    ? "text-[#B75D42]"
                    : "text-[#282521]/70 hover:text-[#282521]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link href="/create">
              <AnimatedButton
                className="bg-[#B75D42] border-[#B75D42] text-[#F8F5EE] hover:bg-[#B75D42]/90 text-sm px-5 py-2 rounded-lg font-medium shadow-xs"
              >
                Create Agreement
              </AnimatedButton>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-[#282521] hover:bg-[#EDE8DF] transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#F8F5EE] border-b border-[#D8C9B4]"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-[#282521]/80 hover:text-[#282521] py-2 border-b border-[#D8C9B4]/40 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <Link href="/create" onClick={() => setIsOpen(false)} className="block w-full">
                  <AnimatedButton
                    className="w-full bg-[#B75D42] border-[#B75D42] text-[#F8F5EE] text-sm py-2.5 rounded-lg justify-center font-medium"
                  >
                    Create Agreement
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
