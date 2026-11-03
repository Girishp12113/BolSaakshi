"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { storage } from "@/lib/storage"
import type { Agreement, Payment } from "@/lib/schema"

const emptySubscribe = () => () => {}

export function useAgreements() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [agreements, setAgreements] = useState<Agreement[]>(() => {
    if (typeof window !== "undefined") {
      return storage.listAgreements()
    }
    return []
  })

  const refresh = useCallback(() => {
    setAgreements(storage.listAgreements())
  }, [])

  return { agreements, mounted, refresh }
}

export function useAgreement(id: string) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [agreement, setAgreement] = useState<Agreement | null>(() => {
    if (typeof window !== "undefined") {
      return storage.getAgreement(id)
    }
    return null
  })

  const update = useCallback(
    (patch: Partial<Agreement>) => {
      const current = storage.getAgreement(id)
      if (!current) return
      const updated: Agreement = { ...current, ...patch, updatedAt: new Date().toISOString() }
      storage.saveAgreement(updated)
      setAgreement(updated)
    },
    [id]
  )

  const addPayment = useCallback(
    (payment: Omit<Payment, "id">) => {
      const updated = storage.addPayment(id, payment)
      if (updated) setAgreement(updated)
    },
    [id]
  )

  const removePayment = useCallback(
    (paymentId: string) => {
      const updated = storage.removePayment(id, paymentId)
      if (updated) setAgreement(updated)
    },
    [id]
  )

  return { agreement, mounted, update, addPayment, removePayment }
}
