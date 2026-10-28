import { formatMills, formatNumber } from "@/lib/format"

import type { CartLineItem } from "../types"
import { totalMills } from "./line-items"
import { totalUnits, unitWord } from "./pack-units"

/** "100 units of 6MP TAB" */
export function cartLineSummary(item: CartLineItem) {
  const units = totalUnits(item)
  return `${formatNumber(units)} ${unitWord(item.name, units)} of ${item.name}`
}

export function createCartSummary(
  items: readonly CartLineItem[],
  siteName: string
) {
  return [
    `${siteName} — order`,
    "",
    ...items.map(cartLineSummary),
    "",
    `Cart total: ${formatMills(totalMills(items))}`,
  ].join("\n")
}
