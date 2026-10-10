import type { CatalogProduct } from "@/features/catalog/types"
import { normalizeText } from "@/lib/format"

import {
  MAX_QUANTITY,
  MAX_TEXT_LENGTH,
  MAX_UNIT_PRICE_MILLS,
} from "../constants"
import type { EstimateLineItem, LineItemDetails } from "../types"

export const clip = (value: string) => value.trim().slice(0, MAX_TEXT_LENGTH)

/** Stable across catalog rebuilds, so saved carts survive a data refresh. */
export function lineItemId(details: LineItemDetails) {
  return JSON.stringify([
    normalizeText(details.name),
    normalizeText(details.ingredient),
    normalizeText(details.manufacturer),
    normalizeText(details.packaging),
    details.unitPriceMills,
  ])
}

function toDetails(product: CatalogProduct): LineItemDetails | null {
  const price = product.priceMills
  if (price === null || price > MAX_UNIT_PRICE_MILLS) return null

  return {
    ingredient: clip(product.ingredient),
    manufacturer: clip(product.manufacturer),
    name: clip(product.name),
    packaging: clip(product.packaging),
    unitPriceMills: price,
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

export const lineTotalMills = (item: EstimateLineItem) =>
  item.unitPriceMills * item.quantity

export const totalMills = (items: readonly EstimateLineItem[]) =>
  items.reduce((sum, item) => sum + lineTotalMills(item), 0)

export const packetCount = (items: readonly EstimateLineItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
