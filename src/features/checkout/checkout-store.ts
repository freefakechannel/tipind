import { create } from "zustand"
import { persist, type PersistStorage } from "zustand/middleware"

import { isRecord } from "@/lib/guards"

import { SERVICED_COUNTRIES, STORAGE_KEY, STORAGE_VERSION } from "./constants"
import { EMPTY_DETAILS, sanitizeDetails } from "./lib/details"
import type { CheckoutState, SERVICED_COUNTRY, ShippingDetails } from "./types"

interface PersistedCheckout {
  details: ShippingDetails
}

/** Reads through the sanitizer, never trusts what's in localStorage. */
const checkoutStorage: PersistStorage<PersistedCheckout> = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name)
      if (!raw || raw.length > 100_000) return null
      const parsed: unknown = JSON.parse(raw)
      if (!isRecord(parsed)) return null
      return {
        state: { details: sanitizeDetails(parsed.details) },
        version: STORAGE_VERSION,
      }
    } catch {
      return null
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Nothing to clean up.
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(
        name,
        JSON.stringify({ details: sanitizeDetails(value.state.details) })
      )
    } catch {
      // Private mode or quota: the form still works for this visit.
    }
  },
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      details: EMPTY_DETAILS,
      isHydrated: false,
      step: "review",

      actions: {
        clearDetails: () => {
          set({ details: EMPTY_DETAILS })
        },
        setField: (field, value) => {
          set((state) => ({
            details: { ...state.details, [field]: value },
          }))
        },
        setStep: (step) => {
          set({ step })
        },
        setCountry: (country) => {
          const count = country as SERVICED_COUNTRY
          if (SERVICED_COUNTRIES.includes(count)) {
            // The region list depends on the country, so a new country clears it.
            set((state) => ({
              details: { ...state.details, country: count, region: "" },
            }))
          }
        },
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): PersistedCheckout => ({ details: state.details }),
      // Hydrated after mount so server and client markup match.
      skipHydration: true,
      storage: checkoutStorage,
      version: STORAGE_VERSION,
    }
  )
)
