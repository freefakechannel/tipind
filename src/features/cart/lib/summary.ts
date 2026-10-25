import { formatMills, formatNumber } from "@/lib/format"

import type { CartLineItem } from "../types"
import { totalMills } from "./line-items"
import { totalUnits, unitWord } from "./pack-units"

export function createCartSummary(
  items: readonly CartLineItem[],
  siteName: string
) {
  return [
    `${siteName} — order`,
    "",
    ...items.map((item) => {
      const units = totalUnits(item)
      return `${formatNumber(units)} ${unitWord(item.name, units)} of ${item.name}`
    }),
    "",
    `Cart total: ${formatMills(totalMills(items))}`,
  ].join("\n")
}
