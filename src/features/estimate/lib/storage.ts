import { isRecord } from "@/lib/guards"

import {
  MAX_LINE_ITEMS,
  MAX_TEXT_LENGTH,
  MAX_UNIT_PRICE_CENTS,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "../constants"
import type { EstimateLineItem } from "../types"
import { clampQuantity, lineItemId } from "./line-items"

function isText(value: unknown, required = false): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_TEXT_LENGTH &&
    (!required || value.trim().length > 0)
  )
}

function readItem(candidate: unknown): EstimateLineItem | null {
  if (!isRecord(candidate)) return null
  const {
    ingredient,
    manufacturer,
    name,
    packaging,
    quantity,
    unitPriceCents,
  } = candidate

  if (
    !isText(name, true) ||
    !isText(ingredient) ||
    !isText(manufacturer) ||
    !isText(packaging) ||
    typeof unitPriceCents !== "number" ||
    !Number.isSafeInteger(unitPriceCents) ||
    unitPriceCents < 0 ||
    unitPriceCents > MAX_UNIT_PRICE_CENTS ||
    typeof quantity !== "number" ||
    !Number.isFinite(quantity)
  ) {
    return null
  }

  const details = {
    ingredient: ingredient.trim(),
    manufacturer: manufacturer.trim(),
    name: name.trim(),
    packaging: packaging.trim(),
    unitPriceCents,
  }
  // Never trust a stored id; derive it again.
  return {
    ...details,
    id: lineItemId(details),
    quantity: clampQuantity(quantity),
  }
}

/** Validates untrusted data, merges duplicates, enforces limits. */
export function normalizeItems(value: unknown): EstimateLineItem[] {
  if (!Array.isArray(value)) return []
  const candidates: unknown[] = value
  const merged = new Map<string, EstimateLineItem>()

  for (const candidate of candidates) {
    const item = readItem(candidate)
    if (!item) continue

    const existing = merged.get(item.id)
    if (existing) {
      merged.set(item.id, {
        ...existing,
        quantity: clampQuantity(existing.quantity + item.quantity),
      })
    } else if (merged.size < MAX_LINE_ITEMS) {
      merged.set(item.id, item)
    }
  }

  return [...merged.values()]
}

export function serializeItems(items: readonly EstimateLineItem[]) {
  return JSON.stringify({
    items: normalizeItems(items),
    version: STORAGE_VERSION,
  })
}

export function parseItems(raw: string | null): EstimateLineItem[] {
  if (!raw || raw.length > 1_000_000) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) return []
    return normalizeItems(parsed.items)
  } catch {
    return []
  }
}

/** True when localStorage can be written (false in some private modes). */
export function isStorageWritable() {
  try {
    const probe = `${STORAGE_KEY}:probe`
    window.localStorage.setItem(probe, "1")
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
