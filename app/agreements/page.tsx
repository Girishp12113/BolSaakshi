"use client"

import { useState } from "react"
import Link from "next/link"
import { useAgreements } from "@/hooks/use-agreements"
import { storage } from "@/lib/storage"
import { formatINR, formatDate, totalPaid, outstandingAmount, overpaymentAmount } from "@/lib/schema"
import { Plus, Search, FileText, ChevronRight, Loader2, Clock, CheckCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Nav from "@/components/nav"
import type { Agreement } from "@/lib/schema"

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Agreement["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border",
        status === "acknowledged"
          ? "text-emerald-800 bg-emerald-50 border-emerald-300"
          : "text-[#282521]/70 bg-[#F8F5EE] border-[#D8C9B4]"
      )}
    >
      {status === "acknowledged" ? (
        <CheckCircle size={11} className="text-emerald-600" />
      ) : (
        <Clock size={11} className="text-[#B75D42]" />
      )}
      {status === "draft" ? "Draft Record" : "Acknowledged"}
    </span>
  )
}

// ─── Agreement card ────────────────────────────────────────────────────────────

function AgreementCard({ agreement }: { agreement: Agreement }) {
  const paid = totalPaid(agreement)
  const outstanding = outstandingAmount(agreement)
  const overpayment = overpaymentAmount(agreement)

  return (
    <Link
      href={`/agreements/${agreement.id}`}
      className="group block bg-[#F8F5EE] border border-[#D8C9B4] rounded-xl p-5 hover:border-[#B75D42] hover:shadow-xs transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3
            className="text-base text-[#282521] font-bold leading-snug truncate mb-1 group-hover:text-[#B75D42] transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {agreement.title}
          </h3>
          <p className="text-xs text-[#282521]/60 font-medium">
            {agreement.workerName && agreement.customerName
              ? `${agreement.workerName} • ${agreement.customerName}`
              : agreement.workerName || agreement.customerName || "Parties not specified"}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <StatusBadge status={agreement.status} />
        </div>
      </div>

      {/* Financials row */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-4 bg-[#EDE8DF] border border-[#D8C9B4]/60 rounded-lg p-3">
        <div>
          <span className="text-[#282521]/50 text-[10px] block uppercase tracking-wider font-semibold">Total Agreed</span>
          <span className="text-[#282521] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {formatINR(agreement.totalAmount)}
          </span>
        </div>
        {paid > 0 && (
          <div>
            <span className="text-emerald-700/70 text-[10px] block uppercase tracking-wider font-semibold">Paid so far</span>
            <span className="text-emerald-800 font-bold">{formatINR(paid)}</span>
          </div>
        )}
        {overpayment > 0 ? (
          <div>
            <span className="text-red-700/70 text-[10px] block uppercase tracking-wider font-semibold">Overpaid</span>
            <span className="text-red-700 font-bold">+{formatINR(overpayment)}</span>
          </div>
        ) : outstanding !== null && outstanding > 0 ? (
          <div>
            <span className="text-[#B75D42]/70 text-[10px] block uppercase tracking-wider font-semibold">Outstanding</span>
            <span className="text-[#B75D42] font-bold">{formatINR(outstanding)}</span>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#282521]/50">
        <span>
          {agreement.startDate ? `Starts ${formatDate(agreement.startDate)}` : `Created ${formatDate(agreement.createdAt.split("T")[0])}`}
          {agreement.workLocation ? ` • ${agreement.workLocation.split(",")[0]}` : ""}
        </span>
        <span className="flex items-center gap-1 font-medium text-[#B75D42] group-hover:translate-x-0.5 transition-transform">
          View details <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  filtered,
  onLoadDemo,
}: {
  filtered: boolean
  onLoadDemo: () => void
}) {
  return (
    <div className="py-16 text-center border border-dashed border-[#D8C9B4] rounded-2xl bg-[#EDE8DF]/40 p-8">
      <div className="mb-4 flex justify-center">
        <div className="w-14 h-14 rounded-full bg-[#EDE8DF] border border-[#D8C9B4] flex items-center justify-center text-[#B75D42]">
          <FileText size={24} strokeWidth={1.8} />
        </div>
      </div>
      {filtered ? (
        <>
          <h3 className="text-lg text-[#282521] mb-2 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            No matching agreements
          </h3>
          <p className="text-sm text-[#282521]/60">Try searching for a different worker or customer name.</p>
        </>
      ) : (
        <>
          <h3 className="text-xl text-[#282521] mb-2 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            No agreement records yet
          </h3>
          <p className="text-sm text-[#282521]/60 mb-6 max-w-sm mx-auto leading-relaxed">
            Record a verbal job arrangement or load a verified trade worker sample record to test all features.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors shadow-xs"
            >
              <Plus size={15} /> Create your first agreement
            </Link>
            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#D8C9B4] bg-[#F8F5EE] text-[#282521] rounded-lg text-sm font-medium hover:border-[#B75D42] transition-colors"
            >
              <Sparkles size={14} className="text-[#B75D42]" /> Load Demo Sample Agreement
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Summary stats ─────────────────────────────────────────────────────────────

function SummaryStats({ agreements }: { agreements: Agreement[] }) {
  const total = agreements.length
  const drafts = agreements.filter((a) => a.status === "draft").length
  const acknowledged = agreements.filter((a) => a.status === "acknowledged").length
  const totalValue = agreements.reduce((s, a) => s + (a.totalAmount ?? 0), 0)
  const totalOutstanding = agreements.reduce((s, a) => {
    const o = outstandingAmount(a)
    return s + (o ?? 0)
  }, 0)

  if (total === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Agreements", value: String(total), sub: `${acknowledged} ack, ${drafts} draft` },
        { label: "Total Booked", value: formatINR(totalValue || null), sub: "Total contract value" },
        { label: "Outstanding", value: formatINR(totalOutstanding || null), sub: "Pending balance" },
        { label: "Total Paid", value: formatINR(totalValue - totalOutstanding || null), sub: "Collected so far" },
      ].map((stat) => (
        <div key={stat.label} className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-xl px-4 py-3 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest text-[#282521]/60 mb-1 font-semibold">{stat.label}</p>
          <p className="text-xl text-[#282521] font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {stat.value}
          </p>
          <p className="text-[10px] text-[#282521]/50 mt-0.5">{stat.sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgreementsPage() {
  const { agreements, mounted, refresh } = useAgreements()
  const [query, setQuery] = useState("")

  const handleLoadDemo = () => {
    storage.seedSampleAgreement()
    refresh()
  }

  const filtered = agreements.filter((a) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      a.title.toLowerCase().includes(q) ||
      a.workerName.toLowerCase().includes(q) ||
      a.customerName.toLowerCase().includes(q) ||
      (a.workLocation && a.workLocation.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1
              className="text-3xl text-[#282521] font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              My Agreements
            </h1>
            <p className="text-sm text-[#282521]/65 mt-1">
              Verbal agreement records stored locally on this device.
            </p>
            <p className="text-[11px] text-[#282521]/50 mt-1">
              Notice: Records exist only in this browser&apos;s local storage. They do not sync across devices and will be removed if browser cache is cleared.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {agreements.length > 0 && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 border border-[#D8C9B4] bg-[#EDE8DF] text-[#282521] rounded-lg text-xs font-medium hover:border-[#B75D42] transition-colors"
                title="Seed sample data for testing"
              >
                <Sparkles size={13} className="text-[#B75D42]" /> Load Sample Record
              </button>
            )}
            <Link
              href="/create"
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors shadow-xs"
            >
              <Plus size={15} />
              <span>New Agreement</span>
            </Link>
          </div>
        </div>

        {/* Loading */}
        {!mounted && (
          <div className="flex items-center justify-center py-20 text-[#282521]/40">
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}

        {mounted && (
          <>
            <SummaryStats agreements={agreements} />

            {/* Search */}
            {agreements.length > 0 && (
              <div className="relative mb-6">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#282521]/40" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, worker, customer, or location…"
                  className="w-full bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#282521] placeholder:text-[#282521]/40 focus:outline-none focus:border-[#B75D42]"
                />
              </div>
            )}

            {/* List */}
            {filtered.length === 0 ? (
              <EmptyState filtered={query.length > 0} onLoadDemo={handleLoadDemo} />
            ) : (
              <div className="space-y-3">
                {filtered.map((agreement) => (
                  <AgreementCard key={agreement.id} agreement={agreement} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
