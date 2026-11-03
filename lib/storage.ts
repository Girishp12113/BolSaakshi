// BolSaakshi – localStorage persistence layer
// All reads check typeof window to avoid SSR issues.

import type { Agreement } from "./schema"

const KEY = "bolsaakshi_v1"
const VERSION = 1

interface StorageData {
  version: number
  agreements: Agreement[]
}

function defaultData(): StorageData {
  return { version: VERSION, agreements: [] }
}

function load(): StorageData {
  if (typeof window === "undefined") return defaultData()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as StorageData
    if (parsed.version !== VERSION) return defaultData()
    return parsed
  } catch {
    return defaultData()
  }
}

function save(data: StorageData): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(data))
}

export const SAMPLE_AGREEMENT_DATA: Agreement = {
  id: "sample-electrician-ramesh",
  title: "Electrical Wiring & Modular Switchboards",
  language: "hindi",
  workerName: "Ramesh Kumar (Electrician)",
  customerName: "Sunita Devi",
  description: "Complete 3-room concealed wiring, 6 modular switchboard installations, distribution board MCB wiring, and testing.",
  workLocation: "House #42, 2nd Cross, Indiranagar, Bengaluru",
  startDate: "2026-11-10",
  completionDate: "2026-11-18",
  currency: "INR",
  totalAmount: 18500,
  advanceAmount: 5000,
  materialsResponsibility: "customer",
  includedWork: [
    "Concealed PVC conduit pipe channeling in 3 rooms",
    "Wire pulling (Finolex 1.5 sq mm and 2.5 sq mm)",
    "6 modular 8-module switchboard installations",
    "Earthing wire connection to building earth pit",
    "Distribution board 8-way MCB wiring and load testing",
  ],
  excludedWork: [
    "Decorative light / chandelier hanging",
    "Civil plastering work after wall cutting (mason needed)",
    "External power meter shift from electricity board",
  ],
  additionalTerms: [
    "Working hours 9:30 AM to 6:30 PM",
    "Customer to provide materials on or before work start date",
    "Final balance ₹7,500 due within 2 days of testing all points",
  ],
  clarificationQuestions: [
    "Will a civil mason be arranged by the customer to plaster the groove cuts?",
    "Are exhaust fan holes in the kitchen and bathroom already cut?",
  ],
  sourceTranscript: "मैं रमेश कुमार, इलेक्ट्रिशियन। सुनीता जी के घर पर 3 कमरों की वायरिंग और 6 स्विचबोर्ड लगाने का काम तय हुआ है। कुल मजदूरी ₹18,500 होगी, जिसमें से ₹5,000 एडवांस काम शुरू होने पर मिलेगा। सारा वायर और स्विच सुनीता जी देंगी। काम 10 नवंबर को शुरू होगा और 18 नवंबर तक पूरा होगा। झिरी काटने के बाद का प्लास्टर का काम हमारा नहीं होगा।",
  status: "draft",
  createdAt: "2026-11-03T09:00:00.000Z",
  updatedAt: "2026-11-03T11:30:00.000Z",
  payments: [
    {
      id: "pay-1",
      amount: 5000,
      date: "2026-11-10",
      note: "Advance payment received (UPI)",
    },
    {
      id: "pay-2",
      amount: 6000,
      date: "2026-11-14",
      note: "Mid-way progress payment after conduit piping",
    },
  ],
}

export const storage = {
  listAgreements(): Agreement[] {
    return load().agreements.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getAgreement(id: string): Agreement | null {
    return load().agreements.find((a) => a.id === id) ?? null
  },

  saveAgreement(agreement: Agreement): void {
    const data = load()
    const idx = data.agreements.findIndex((a) => a.id === agreement.id)
    const updated = { ...agreement, updatedAt: new Date().toISOString() }
    if (idx >= 0) {
      data.agreements[idx] = updated
    } else {
      data.agreements.push(updated)
    }
    save(data)
  },

  deleteAgreement(id: string): void {
    const data = load()
    data.agreements = data.agreements.filter((a) => a.id !== id)
    save(data)
  },

  addPayment(
    agreementId: string,
    payment: Omit<import("./schema").Payment, "id">
  ): Agreement | null {
    const data = load()
    const idx = data.agreements.findIndex((a) => a.id === agreementId)
    if (idx < 0) return null
    const newPayment: import("./schema").Payment = {
      ...payment,
      id: crypto.randomUUID(),
    }
    data.agreements[idx] = {
      ...data.agreements[idx],
      payments: [...data.agreements[idx].payments, newPayment],
      updatedAt: new Date().toISOString(),
    }
    save(data)
    return data.agreements[idx]
  },

  removePayment(agreementId: string, paymentId: string): Agreement | null {
    const data = load()
    const idx = data.agreements.findIndex((a) => a.id === agreementId)
    if (idx < 0) return null
    data.agreements[idx] = {
      ...data.agreements[idx],
      payments: data.agreements[idx].payments.filter((p) => p.id !== paymentId),
      updatedAt: new Date().toISOString(),
    }
    save(data)
    return data.agreements[idx]
  },

  seedSampleAgreement(): Agreement {
    const data = load()
    const existing = data.agreements.find((a) => a.id === SAMPLE_AGREEMENT_DATA.id)
    if (!existing) {
      data.agreements.unshift(SAMPLE_AGREEMENT_DATA)
      save(data)
    }
    return SAMPLE_AGREEMENT_DATA
  },
}
