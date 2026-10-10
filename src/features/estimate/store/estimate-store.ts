import { create } from "zustand"
import { persist, type PersistStorage } from "zustand/middleware"

import type { CatalogProduct } from "@/features/catalog/types"

import {
  MAX_LINE_ITEMS,
  MAX_QUANTITY,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "../constants"
import {
  clampQuantity,
  createLineItem,
  packetCount,
  totalCents,
} from "../lib/line-items"
import { parseItems, serializeItems } from "../lib/storage"
import type { AddResult, EstimateLineItem } from "../types"

interface EstimateActions {
  addProduct: (product: CatalogProduct) => AddResult
  setQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
  openDrawer: () => void
  setDrawerOpen: (open: boolean) => void
}

export interface EstimateState {
  items: readonly EstimateLineItem[]
  isDrawerOpen: boolean
  /** False until the saved estimate has been read (avoids hydration mismatch). */
  isHydrated: boolean
  isStorageAvailable: boolean
  actions: EstimateActions
}

interface PersistedEstimate {
  items: readonly EstimateLineItem[]
}

let lastWritten = ""

/** Reads and writes through the validating parser, never raw JSON. */
const storage: PersistStorage<PersistedEstimate> = {
  getItem: (name) => {
    try {
      const items = parseItems(window.localStorage.getItem(name))
      return { state: { items }, version: STORAGE_VERSION }
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    const serialized = serializeItems(value.state.items)
    if (serialized === lastWritten) return
    try {
      window.localStorage.setItem(name, serialized)
      lastWritten = serialized
    } catch {
      // Guarded: persist re-runs on every set, so only flip the flag once.
      if (useEstimateStore.getState().isStorageAvailable) {
        useEstimateStore.setState({ isStorageAvailable: false })
      }
    }
  },
  removeItem: (name) => {
    lastWritten = ""
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Nothing to clean up.
    }
  },
}

export const useEstimateStore = create<EstimateState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      isHydrated: false,
      isStorageAvailable: true,

      actions: {
        addProduct: (product) => {
          const { isHydrated, items } = get()
          if (!isHydrated) return "unavailable"

          const line = createLineItem(product)
          if (!line) return "unavailable"

          const existing = items.find((item) => item.id === line.id)
          if (existing) {
            if (existing.quantity >= MAX_QUANTITY) return "limit"
            set({
              items: items.map((item) =>
                item.id === line.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            })
            return "updated"
          }

          if (items.length >= MAX_LINE_ITEMS) return "limit"
          set({ items: [...items, line] })
          return "added"
        },
        setQuantity: (id, quantity) => {
          const next = clampQuantity(quantity)
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: next } : item
            ),
          }))
        },
        removeItem: (id) => {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }))
        },
        clear: () => {
          set({ items: [] })
        },
        openDrawer: () => {
          set({ isDrawerOpen: true })
        },
        setDrawerOpen: (open) => {
          set({ isDrawerOpen: open })
        },
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): PersistedEstimate => ({ items: state.items }),
      // Hydrated manually after mount so server and client markup match.
      skipHydration: true,
      storage,
      version: STORAGE_VERSION,
    }
  )
)

export const selectPacketCount = (state: EstimateState) =>
  packetCount(state.items)
export const selectTotalCents = (state: EstimateState) =>
  totalCents(state.items)
