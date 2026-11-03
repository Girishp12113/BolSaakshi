"use client"

import { useState, useCallback } from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Edit2, Save, X, Printer, Copy, CheckCircle, AlertCircle,
  Plus, Trash2, Loader2, HelpCircle, ChevronDown, ChevronUp,
  FileText, CreditCard, Share2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgreement } from "@/hooks/use-agreements"
import { storage } from "@/lib/storage"
import {
  formatINR, formatDate, totalPaid, outstandingAmount, overpaymentAmount,
  type Agreement, type Payment
} from "@/lib/schema"
import Nav from "@/components/nav"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Agreement["status"] }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border",
      status === "acknowledged"
        ? "text-emerald-800 bg-emerald-50 border-emerald-300"
        : "text-[#282521]/70 bg-[#F8F5EE] border-[#D8C9B4]"
    )}>
      {status === "acknowledged" ? (
        <CheckCircle size={11} className="text-emerald-600" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-[#B75D42]" />
      )}
      {status === "draft" ? "Draft Record" : "Acknowledged by Parties"}
    </span>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-widest text-[#282521]/60 font-semibold mb-3">
      {children}
    </h2>
  )
}

// ─── Edit inline field ────────────────────────────────────────────────────────

function EditableField({
  label, value, onSave, type = "text", multiline = false, nullable = false,
}: {
  label: string
  value: string | number | null
  onSave: (val: string | null) => void
  type?: string
  multiline?: boolean
  nullable?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? ""))

  const commit = () => {
    onSave(draft.trim() || (nullable ? null : draft))
    setEditing(false)
  }
  const cancel = () => {
    setDraft(String(value ?? ""))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-1 w-full">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full bg-[#EDE8DF] border border-[#B75D42] rounded-lg px-3 py-2 text-sm text-[#282521] focus:outline-none resize-none leading-relaxed"
          />
        ) : (
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            className="w-full bg-[#EDE8DF] border border-[#B75D42] rounded-lg px-3 py-2 text-sm text-[#282521] focus:outline-none"
          />
        )}
        <div className="flex gap-3 mt-2">
          <button type="button" onClick={commit} className="flex items-center gap-1 text-xs text-emerald-800 font-semibold hover:text-emerald-900">
            <Save size={12} /> Save
          </button>
          <button type="button" onClick={cancel} className="flex items-center gap-1 text-xs text-[#282521]/60 hover:text-[#282521]">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-2">
      <span className="text-sm text-[#282521] leading-relaxed">
        {value !== null && value !== "" ? String(value) : <span className="text-[#282521]/35 italic">Not specified in oral agreement</span>}
      </span>
      <button
        type="button"
        onClick={() => { setDraft(String(value ?? "")); setEditing(true) }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#282521]/40 hover:text-[#B75D42] p-0.5"
        aria-label={`Edit ${label}`}
      >
        <Edit2 size={12} />
      </button>
    </div>
  )
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-3 border-b border-[#D8C9B4]/60 last:border-0">
      <dt className="shrink-0 w-36 text-xs uppercase tracking-wider text-[#282521]/50 font-semibold pt-0.5 mb-1 sm:mb-0">
        {label}
      </dt>
      <dd className="flex-1 min-w-0">{children}</dd>
    </div>
  )
}

// ─── Payment tracker ──────────────────────────────────────────────────────────

function PaymentTracker({
  agreement, onAdd, onRemove,
}: {
  agreement: Agreement
  onAdd: (p: Omit<Payment, "id">) => void
  onRemove: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState("")

  const paid = totalPaid(agreement)
  const outstanding = outstandingAmount(agreement)
  const overpayment = overpaymentAmount(agreement)

  const handleAdd = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || !isFinite(amt) || amt <= 0) {
      alert("Please enter a valid positive payment amount.")
      return
    }
    if (!date) {
      alert("Please select a valid payment date.")
      return
    }
    onAdd({ amount: amt, date, note: note.trim() })
    setAmount("")
    setNote("")
    setShowForm(false)
  }

  return (
    <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-xl p-5">
      {/* Overpayment Warning if payments exceed contract total */}
      {overpayment > 0 && (
        <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-3 text-xs text-red-950 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-red-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Overpayment Recorded ({formatINR(overpayment)})</p>
            <p className="text-[11px] text-red-900 mt-0.5 leading-relaxed">
              Total recorded payments ({formatINR(paid)}) exceed the agreed contract total ({formatINR(agreement.totalAmount)}).
              Please verify your payment records or update the agreed contract price if scope expanded.
            </p>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-[#F8F5EE] border border-[#D8C9B4] rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#282521]/50 mb-1 font-semibold">Total Contract</p>
          <p className="text-lg font-bold text-[#282521]" style={{ fontFamily: "var(--font-heading)" }}>
            {formatINR(agreement.totalAmount)}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-emerald-800 mb-1 font-semibold">Paid to Date</p>
          <p className="text-lg font-bold text-emerald-800" style={{ fontFamily: "var(--font-heading)" }}>
            {formatINR(paid)}
          </p>
        </div>
        <div className={cn(
          "border rounded-lg p-3 text-center",
          overpayment > 0
            ? "bg-red-50 border-red-300"
            : outstanding && outstanding > 0
            ? "bg-amber-50 border-amber-300"
            : "bg-[#F8F5EE] border-[#D8C9B4]"
        )}>
          <p className="text-[10px] uppercase tracking-widest text-[#282521]/50 mb-1 font-semibold">
            {overpayment > 0 ? "Overpaid Amount" : "Pending Balance"}
          </p>
          <p className={cn(
            "text-lg font-bold",
            overpayment > 0 ? "text-red-700" : outstanding && outstanding > 0 ? "text-[#B75D42]" : "text-[#282521]/50"
          )} style={{ fontFamily: "var(--font-heading)" }}>
            {overpayment > 0
              ? `+${formatINR(overpayment)}`
              : outstanding !== null
              ? (outstanding > 0 ? formatINR(outstanding) : "Settled")
              : "—"}
          </p>
        </div>
      </div>

      {/* Visual progress bar */}
      {agreement.totalAmount && agreement.totalAmount > 0 && (
        <div className="mb-5 bg-[#F8F5EE] border border-[#D8C9B4] rounded-lg p-3">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-[#282521]/70">Collection Status</span>
            <span className="font-bold text-emerald-800">
              {Math.min(100, Math.round((paid / agreement.totalAmount) * 100))}% Collected
            </span>
          </div>
          <div className="h-2 w-full bg-[#EDE8DF] rounded-full overflow-hidden border border-[#D8C9B4]/50">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((paid / agreement.totalAmount) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Payment log */}
      {agreement.payments.length > 0 ? (
        <div className="mb-4 space-y-2">
          <p className="text-xs uppercase tracking-wider text-[#282521]/55 font-semibold mb-2">Recorded Payments Log</p>
          {agreement.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-[#F8F5EE] border border-[#D8C9B4] rounded-lg px-4 py-3 text-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[#282521] font-bold">{formatINR(p.amount)}</span>
                <span className="text-[#282521]/60 text-xs font-medium">{formatDate(p.date)}</span>
                {p.note && <span className="text-[#282521]/70 text-xs bg-[#EDE8DF] px-2 py-0.5 rounded">Note: {p.note}</span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this payment entry?")) onRemove(p.id)
                }}
                className="text-[#282521]/30 hover:text-red-600 transition-colors p-1"
                aria-label="Remove payment"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#282521]/50 mb-4 italic">No payments have been recorded yet.</p>
      )}

      {/* Add payment form */}
      {showForm ? (
        <div className="bg-[#F8F5EE] border border-[#B75D42]/50 rounded-lg p-4 space-y-3">
          <p className="text-xs font-bold text-[#282521] uppercase tracking-wider">Record New Payment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#282521]/60 uppercase tracking-wider block mb-1 font-semibold">Amount (₹)*</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                min={1}
                className="w-full bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg px-3 py-2 text-sm text-[#282521] focus:outline-none focus:border-[#B75D42]"
              />
            </div>
            <div>
              <label className="text-xs text-[#282521]/60 uppercase tracking-wider block mb-1 font-semibold">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg px-3 py-2 text-sm text-[#282521] focus:outline-none focus:border-[#B75D42]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#282521]/60 uppercase tracking-wider block mb-1 font-semibold">Note / Payment Method</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cash advance, GooglePay UPI, materials reimbursement"
              className="w-full bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg px-3 py-2 text-sm text-[#282521] focus:outline-none focus:border-[#B75D42]"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-sm font-semibold hover:bg-[#B75D42]/90 transition-colors shadow-xs">
              <Plus size={13} /> Save Payment Record
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#D8C9B4] bg-[#EDE8DF] rounded-lg text-sm text-[#282521]/70 hover:text-[#282521] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 border border-[#D8C9B4] bg-[#F8F5EE] rounded-lg text-sm font-medium text-[#282521]/80 hover:text-[#282521] hover:border-[#B75D42] transition-colors"
        >
          <Plus size={14} className="text-[#B75D42]" /> Record a Payment
        </button>
      )}

      <p className="text-[10px] text-[#282521]/50 italic mt-4 pt-2 border-t border-[#D8C9B4]/60">
        * All payment entries are manually logged self-reports for bookkeeping and do not verify bank or UPI settlement.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { agreement, mounted, update, addPayment, removePayment } = useAgreement(id)
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [deletingConfirm, setDeletingConfirm] = useState(false)

  const handleDelete = useCallback(() => {
    if (!deletingConfirm) { setDeletingConfirm(true); return }
    storage.deleteAgreement(id)
    router.push("/agreements")
  }, [deletingConfirm, id, router])

  const generateSummaryText = useCallback(() => {
    if (!agreement) return ""
    return [
      `*BOLSAAKSHI RECORD OF WORK ARRANGEMENT*`,
      `Agreement: ${agreement.title}`,
      `Date: ${formatDate(agreement.createdAt.split("T")[0])}`,
      ``,
      `PARTIES:`,
      `• Worker/Provider: ${agreement.workerName || "Not specified"}`,
      `• Customer/Client: ${agreement.customerName || "Not specified"}`,
      ``,
      `WORK DETAILS:`,
      `• Description: ${agreement.description}`,
      agreement.workLocation ? `• Location: ${agreement.workLocation}` : null,
      agreement.startDate ? `• Start Date: ${formatDate(agreement.startDate)}` : null,
      agreement.completionDate ? `• Deadline: ${formatDate(agreement.completionDate)}` : null,
      agreement.materialsResponsibility ? `• Materials: ${agreement.materialsResponsibility}` : null,
      ``,
      `FINANCIAL TERMS:`,
      `• Total Agreed: ${formatINR(agreement.totalAmount)}`,
      `• Advance Agreed: ${formatINR(agreement.advanceAmount)}`,
      `• Paid to Date: ${formatINR(totalPaid(agreement))}`,
      `• Outstanding: ${formatINR(outstandingAmount(agreement))}`,
      agreement.includedWork.length ? `\nINCLUDED WORK:\n${agreement.includedWork.map((i) => `✓ ${i}`).join("\n")}` : null,
      agreement.excludedWork.length ? `\nEXCLUDED WORK:\n${agreement.excludedWork.map((i) => `✗ ${i}`).join("\n")}` : null,
      agreement.additionalTerms.length ? `\nADDITIONAL TERMS:\n${agreement.additionalTerms.map((i) => `• ${i}`).join("\n")}` : null,
      ``,
      `Status: ${agreement.status.toUpperCase()}`,
      `Created via BolSaakshi – Spoken work. Written clarity.`,
    ].filter(Boolean).join("\n")
  }, [agreement])

  const handleCopy = useCallback(async () => {
    const text = generateSummaryText()
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [generateSummaryText])

  const handleWhatsAppShare = useCallback(() => {
    const text = generateSummaryText()
    if (!text) return
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank")
  }, [generateSummaryText])

  const handlePrint = () => window.print()

  const handleStatusToggle = useCallback(() => {
    if (!agreement) return
    update({
      status: agreement.status === "draft" ? "acknowledged" : "draft",
    })
  }, [agreement, update])

  // ── Loading / not found ──────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#282521]/30" />
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-[#F8F5EE]">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 pt-32 text-center">
          <p className="text-[#282521]/60 mb-4 font-medium">Agreement record not found on this device.</p>
          <Link href="/agreements" className="text-[#B75D42] hover:underline text-sm font-semibold">
            ← Back to My Agreements
          </Link>
        </div>
      </div>
    )
  }

  const paid = totalPaid(agreement)
  const outstanding = outstandingAmount(agreement)

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      <Nav />

      {/* Print styles */}
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; }
          .print-border { border-color: #333 !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Back + actions toolbar */}
        <div className="no-print flex items-center justify-between mb-8 gap-3 flex-wrap">
          <Link href="/agreements" className="flex items-center gap-1.5 text-xs text-[#282521]/60 hover:text-[#282521] transition-colors font-medium">
            <ArrowLeft size={14} /> Back to agreements
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#D8C9B4] bg-[#F8F5EE] rounded-lg text-xs font-medium text-[#282521] hover:border-[#B75D42] transition-colors"
              title="Share summary via WhatsApp"
            >
              <Share2 size={13} className="text-emerald-700" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#D8C9B4] bg-[#F8F5EE] rounded-lg text-xs font-medium text-[#282521] hover:border-[#B75D42] transition-colors"
            >
              {copied ? <CheckCircle size={13} className="text-emerald-700" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy Summary"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B75D42] text-[#F8F5EE] rounded-lg text-xs font-semibold hover:bg-[#B75D42]/90 transition-colors shadow-xs"
            >
              <Printer size={13} /> Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Official Header for Print / PDF */}
        <div className="hidden print-only border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-serif text-black tracking-tight">BOLSAAKSHI RECORD OF WORK AGREEMENT</h1>
              <p className="text-xs text-gray-700 mt-1">Digital Written Record of Spoken Job Arrangement • BolSaakshi</p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p>Record ID: {agreement.id.slice(0, 16)}</p>
              <p>Generated: {new Date().toLocaleDateString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* ── Document header ────────────────────────────────────────────── */}
        <div className="mb-8 border-b border-[#D8C9B4] pb-6">
          <div className="flex items-start gap-4 justify-between flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#B75D42] mb-1.5 font-bold">
                Service Agreement Record
              </p>
              <h1
                className="text-3xl sm:text-4xl text-[#282521] leading-tight mb-3 font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {agreement.title}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={agreement.status} />
                <span className="text-xs text-[#282521]/50">
                  Recorded on {formatDate(agreement.createdAt.split("T")[0])}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Parties ────────────────────────────────────────────────────── */}
        <section className="mb-8 bg-[#EDE8DF]/60 border border-[#D8C9B4] rounded-xl p-5">
          <SectionHeading>Parties to Arrangement</SectionHeading>
          <dl className="divide-y divide-[#D8C9B4]/60">
            <DataRow label="Service Provider / Worker">
              <EditableField
                label="Worker"
                value={agreement.workerName || null}
                nullable
                onSave={(v) => update({ workerName: v ?? "" })}
              />
            </DataRow>
            <DataRow label="Customer / Client">
              <EditableField
                label="Customer"
                value={agreement.customerName || null}
                nullable
                onSave={(v) => update({ customerName: v ?? "" })}
              />
            </DataRow>
          </dl>
        </section>

        {/* ── Work details ────────────────────────────────────────────────── */}
        <section className="mb-8 bg-[#EDE8DF]/60 border border-[#D8C9B4] rounded-xl p-5">
          <SectionHeading>Scope &amp; Timeline</SectionHeading>
          <dl className="divide-y divide-[#D8C9B4]/60">
            <DataRow label="Description">
              <EditableField
                label="Description"
                value={agreement.description}
                multiline
                onSave={(v) => update({ description: v ?? "" })}
              />
            </DataRow>
            <DataRow label="Work Location">
              <EditableField
                label="Location"
                value={agreement.workLocation}
                nullable
                onSave={(v) => update({ workLocation: v })}
              />
            </DataRow>
            <DataRow label="Start Date">
              <EditableField
                label="Start date"
                value={agreement.startDate ? formatDate(agreement.startDate) : null}
                type="date"
                nullable
                onSave={(v) => update({ startDate: v })}
              />
            </DataRow>
            <DataRow label="Completion Date">
              <EditableField
                label="Completion date"
                value={agreement.completionDate ? formatDate(agreement.completionDate) : null}
                type="date"
                nullable
                onSave={(v) => update({ completionDate: v })}
              />
            </DataRow>
            <DataRow label="Materials Responsibility">
              <span className="text-sm text-[#282521] font-medium">
                {agreement.materialsResponsibility === "worker"
                  ? "Worker provides all required materials"
                  : agreement.materialsResponsibility === "customer"
                  ? "Customer provides and pays for materials"
                  : agreement.materialsResponsibility === "shared"
                  ? "Shared contribution as agreed"
                  : <span className="text-[#282521]/35 italic">Not specified in oral conversation</span>}
              </span>
            </DataRow>
          </dl>

          {/* Included Work */}
          {agreement.includedWork.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#D8C9B4]/60">
              <p className="text-xs uppercase tracking-wider text-[#282521]/60 mb-2 font-bold">Included Work Scope</p>
              <ul className="space-y-1.5">
                {agreement.includedWork.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#282521]/85">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B75D42] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Excluded Work */}
          {agreement.excludedWork.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#D8C9B4]/60">
              <p className="text-xs uppercase tracking-wider text-[#282521]/60 mb-2 font-bold">Explicitly Excluded Work</p>
              <ul className="space-y-1.5">
                {agreement.excludedWork.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#282521]/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D8C9B4] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Terms */}
          {agreement.additionalTerms.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#D8C9B4]/60">
              <p className="text-xs uppercase tracking-wider text-[#282521]/60 mb-2 font-bold">Additional Agreed Terms</p>
              <ul className="space-y-1.5">
                {agreement.additionalTerms.map((item, i) => (
                  <li key={i} className="text-sm text-[#282521]/80">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── Financials ─────────────────────────────────────────────────── */}
        <section className="mb-8 bg-[#EDE8DF]/60 border border-[#D8C9B4] rounded-xl p-5">
          <SectionHeading>Financial Agreement</SectionHeading>
          <dl className="divide-y divide-[#D8C9B4]/60">
            <DataRow label="Total Agreed Amount">
              <EditableField
                label="Total amount"
                value={agreement.totalAmount}
                type="number"
                nullable
                onSave={(v) => update({ totalAmount: v ? Number(v) : null })}
              />
            </DataRow>
            <DataRow label="Advance Agreed">
              <EditableField
                label="Advance amount"
                value={agreement.advanceAmount}
                type="number"
                nullable
                onSave={(v) => update({ advanceAmount: v ? Number(v) : null })}
              />
            </DataRow>
            <DataRow label="Total Collected to Date">
              <span className="text-sm font-bold text-emerald-800">{formatINR(paid)}</span>
            </DataRow>
            <DataRow label="Remaining Pending Balance">
              <span className={cn(
                "text-sm font-bold",
                outstanding && outstanding > 0 ? "text-[#B75D42]" : "text-[#282521]/50"
              )}>
                {outstanding !== null ? (outstanding > 0 ? formatINR(outstanding) : "Fully Settled") : "—"}
              </span>
            </DataRow>
          </dl>
        </section>

        {/* ── Payments Tracker ─────────────────────────────────────────── */}
        <section className="mb-8 no-print">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-[#B75D42]" />
            <SectionHeading>Payment Tracking</SectionHeading>
          </div>
          <PaymentTracker
            agreement={agreement}
            onAdd={addPayment}
            onRemove={removePayment}
          />
        </section>

        {/* ── Clarifications / Missing Info ─────────────────────────── */}
        {agreement.clarificationQuestions.length > 0 && (
          <section className="mb-8">
            <SectionHeading>Clarifications &amp; Ambiguities</SectionHeading>
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={15} className="text-amber-700" />
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  {agreement.clarificationQuestions.length} Open Item{agreement.clarificationQuestions.length !== 1 ? "s" : ""} to Resolve
                </p>
              </div>
              <ul className="space-y-2">
                {agreement.clarificationQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-2 bg-[#F8F5EE] p-2.5 rounded-lg border border-amber-200">
                    <span className="mt-0.5 text-amber-600 font-bold shrink-0">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Source transcript ──────────────────────────────────────── */}
        {agreement.sourceTranscript && (
          <section className="mb-8 no-print">
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#282521]/50 hover:text-[#282521] transition-colors mb-3 font-semibold"
            >
              {showTranscript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showTranscript ? "Hide" : "Show"} original spoken transcript
            </button>
            {showTranscript && (
              <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg p-4">
                <p className="text-xs text-[#282521]/75 leading-relaxed whitespace-pre-wrap font-mono">
                  {agreement.sourceTranscript}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Status management ────────────────────────────────────────── */}
        <section className="mb-8 no-print">
          <SectionHeading>Acknowledgement Status</SectionHeading>
          <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <StatusBadge status={agreement.status} />
                <p className="text-xs text-[#282521]/60 mt-2 max-w-sm leading-relaxed">
                  {agreement.status === "draft"
                    ? "Currently an unconfirmed draft record in this browser. To confirm mutual agreement, share the written summary via WhatsApp or printout with the other party."
                    : "Marked as acknowledged in this browser. Mutual confirmation requires independent acknowledgement by both parties."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStatusToggle}
                className="shrink-0 px-4 py-2 border border-[#D8C9B4] bg-[#F8F5EE] rounded-lg text-xs font-semibold text-[#282521] hover:border-[#B75D42] transition-colors"
              >
                {agreement.status === "draft" ? "Mark as Acknowledged" : "Revert to Draft"}
              </button>
            </div>
          </div>
        </section>

        {/* Print Signatures Block */}
        <div className="hidden print-only mt-12 pt-8 border-t border-black">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-6">
            Physical Signature Placeholders (Sign upon physical delivery of this printed copy):
          </p>
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <p className="text-xs font-bold uppercase text-black mb-10">Service Provider Signature / Thumbprint (Physical Placeholder):</p>
              <div className="border-b border-black w-3/4 mb-1"></div>
              <p className="text-xs text-gray-700">{agreement.workerName || "Worker"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-black mb-10">Customer / Client Signature / Thumbprint (Physical Placeholder):</p>
              <div className="border-b border-black w-3/4 mb-1"></div>
              <p className="text-xs text-gray-700">{agreement.customerName || "Customer"}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-tight">
            BolSaakshi Record #{agreement.id} • Printed on {new Date().toLocaleDateString("en-IN")}.
            This document is a written memorialization of verbal arrangements intended to reduce misunderstandings.
            It does not constitute a government-notarized agreement or guarantee legal enforceability.
          </p>
        </div>

        {/* ── Disclaimer & Storage Notice ───────────────────────────────── */}
        <div className="space-y-3 mb-8 no-print">
          <div className="bg-[#EDE8DF] border border-[#D8C9B4] rounded-lg p-4 text-xs text-[#282521]/60 leading-relaxed">
            <FileText size={12} className="inline mr-1.5 text-[#B75D42]" />
            <strong>Legal Notice:</strong> BolSaakshi creates digital records of verbal work arrangements to reduce confusion and payment disputes.
            It does not provide legal advice, does not constitute a government-notarized agreement, and makes no legal guarantees.
          </div>
          <div className="bg-[#EDE8DF]/60 border border-[#D8C9B4]/60 rounded-lg p-3 text-[11px] text-[#282521]/50 leading-relaxed">
            <strong>Storage &amp; Privacy Notice:</strong> This record is stored strictly in your browser&apos;s local storage.
            Data does not automatically sync across devices, is unencrypted at rest by default, and will be deleted if site data is cleared.
            Export via WhatsApp or PDF printout to keep an external copy.
          </div>
        </div>

        {/* ── Delete ───────────────────────────────────────────────────── */}
        <div className="no-print border-t border-[#D8C9B4] pt-6 flex justify-between items-center flex-wrap gap-4">
          {deletingConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#282521]/70 font-medium">Delete this agreement permanently?</p>
              <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:text-red-700 font-bold">
                Yes, delete
              </button>
              <button type="button" onClick={() => setDeletingConfirm(false)} className="text-sm text-[#282521]/50 hover:text-[#282521]">
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs text-[#282521]/40 hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} /> Delete this agreement record
            </button>
          )}

          <Link href="/create" className="text-xs text-[#B75D42] hover:underline font-semibold">
            + Create another agreement
          </Link>
        </div>
      </div>
    </div>
  )
}
