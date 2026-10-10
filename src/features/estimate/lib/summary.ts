import { formatMills } from "@/lib/format"

import type { EstimateLineItem } from "../types"
import { lineTotalMills, totalMills } from "./line-items"

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
      return `${item.name} — ${item.quantity.toString()} ${noun}${pack} at ${formatMills(item.unitPriceMills)} each = ${formatMills(lineTotalMills(item))}`
    }),
    "",
    `Estimated total: ${formatMills(totalMills(items))}`,
    "Prices are estimates and may change. No order or payment has been submitted.",
  ].join("\n")
}
