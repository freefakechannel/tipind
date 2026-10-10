import { formatCents } from "@/lib/format"

import type { EstimateLineItem } from "../types"
import { lineTotalCents, totalCents } from "./line-items"

export function createEstimateSummary(
  items: readonly EstimateLineItem[],
  siteName: string
) {
  return [
    `${siteName} — order estimate (not an order)`,
    "",
    ...items.map((item) => {
      const noun = item.quantity === 1 ? "packet" : "packets"
      const pack = item.packaging ? ` of ${item.packaging}` : ""
      return `${item.name} — ${item.quantity.toString()} ${noun}${pack} at ${formatCents(item.unitPriceCents)} each = ${formatCents(lineTotalCents(item))}`
    }),
    "",
    `Estimated total: ${formatCents(totalCents(items))}`,
    "Prices are estimates and may change. No order or payment has been submitted.",
  ].join("\n")
}
