import {
  MAX_VIEWPORT_FRACTION,
  MIN_WIDTH,
  WIDTH_STORAGE_KEY,
} from "../constants"

export function maxWidth() {
  return Math.max(
    MIN_WIDTH,
    Math.floor(document.documentElement.clientWidth * MAX_VIEWPORT_FRACTION)
  )
}

export function clampWidth(value: number) {
  return Math.round(Math.min(Math.max(value, MIN_WIDTH), maxWidth()))
}

export function readStoredWidth(): number | null {
  try {
    const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY)
    const value = raw === null ? Number.NaN : Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

export function storeWidth(width: number) {
  try {
    window.localStorage.setItem(WIDTH_STORAGE_KEY, width.toString())
  } catch {
    // Not persisted; still works for this visit.
  }
}
