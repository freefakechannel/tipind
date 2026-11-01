import { SHIPPING_MILLS, VAT_RATE_BPS } from "../constants"
import { checkoutContent } from "../content"
import type { ChargeLine, OrderTotals, SERVICED_COUNTRY } from "../types"

export function computeTotals(
  subtotalMills: number,
  country: SERVICED_COUNTRY
): OrderTotals {
  const vat =
    VAT_RATE_BPS === null
      ? null
      : Math.round((subtotalMills * VAT_RATE_BPS) / 10_000)
  const shipping = SHIPPING_MILLS.get(country) ?? null

  const charges: ChargeLine[] = [
    { amountMills: vat, id: "vat" },
    { amountMills: shipping, id: "shipping" },
  ]

  return {
    charges,
    isFinal: charges.every((charge) => charge.amountMills !== null),
    subtotalMills,
    totalMills:
      subtotalMills +
      charges.reduce((sum, charge) => sum + (charge.amountMills ?? 0), 0),
  }
}

export function chargeLabel(id: ChargeLine["id"]) {
  return id === "vat"
    ? checkoutContent.summary.vat
    : checkoutContent.summary.shipping
}
