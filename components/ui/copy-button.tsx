"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CopyButtonProps {
  value: string
  className?: string
  label?: string
  successLabel?: string
}

export function CopyButton({
  value,
  className,
  label = "Copy",
  successLabel = "Copied",
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (!hasCopied) return
    const timeout = setTimeout(() => {
      setHasCopied(false)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [hasCopied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setHasCopied(true)
    } catch {
      // Fallback
      const ta = document.createElement("textarea")
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setHasCopied(true)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[#D8C9B4] bg-[#F8F5EE] text-[#282521] hover:border-[#B75D42] hover:bg-[#EDE8DF] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B75D42]",
        className
      )}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {hasCopied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-700" />
          <span className="text-emerald-800 font-semibold">{successLabel}</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-[#282521]/60" />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export default CopyButton

