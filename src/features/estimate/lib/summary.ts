import { formatMills, formatNumber } from "@/lib/format"

import type { EstimateLineItem } from "../types"
import { totalMills } from "./line-items"
import { totalUnits, unitWord } from "./pack-units"

export function createEstimateSummary(
  items: readonly EstimateLineItem[],
  siteName: string
) {
  return [
    `${siteName} — order estimate (not an order)`,
    "",
    ...items.map((item) => {
      const units = totalUnits(item)
      return `${formatNumber(units)} ${unitWord(item.name, units)} of ${item.name}`
    }),
    "",
    `Estimated total: ${formatMills(totalMills(items))}`,
    "Prices are estimates and may change. No order or payment has been submitted.",
  ].join("\n")
}
