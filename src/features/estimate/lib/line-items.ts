import type { CatalogProduct } from "@/features/catalog/types"
import { normalizeText } from "@/lib/format"

import { MAX_QUANTITY, MAX_UNIT_PRICE_CENTS } from "../constants"
import type { EstimateLineItem, LineItemDetails } from "../types"

/** Stable across catalog rebuilds, so saved carts survive a data refresh. */
export function lineItemId(details: LineItemDetails) {
  return JSON.stringify([
    normalizeText(details.name),
    normalizeText(details.ingredient),
    normalizeText(details.manufacturer),
    normalizeText(details.packaging),
    details.unitPriceCents,
  ])
}

function toDetails(product: CatalogProduct): LineItemDetails | null {
  const price = product.priceCents
  if (price === null || price > MAX_UNIT_PRICE_CENTS) return null

  return {
    ingredient: product.ingredient.trim(),
    manufacturer: product.manufacturer.trim(),
    name: product.name.trim(),
    packaging: product.packaging.trim(),
    unitPriceCents: price,
  }
}

export function createLineItem(
  product: CatalogProduct
): EstimateLineItem | null {
  const details = toDetails(product)
  return details ? { ...details, id: lineItemId(details), quantity: 1 } : null
}

export function productLineId(product: CatalogProduct) {
  const details = toDetails(product)
  return details ? lineItemId(details) : null
}

export function quantityOf(
  items: readonly EstimateLineItem[],
  id: string | null
) {
  if (id === null) return 0
  return items.find((item) => item.id === id)?.quantity ?? 0
}

export function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(value)))
}

export const lineTotalCents = (item: EstimateLineItem) =>
  item.unitPriceCents * item.quantity

export const totalCents = (items: readonly EstimateLineItem[]) =>
  items.reduce((sum, item) => sum + lineTotalCents(item), 0)

export const packetCount = (items: readonly EstimateLineItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
