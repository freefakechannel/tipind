import { cartLineSummary } from "@/features/cart/lib/summary"
import type { CartLineItem } from "@/features/cart/types"
import { formatMessage, formatMills } from "@/lib/format"

import { checkoutContent } from "../content"
import type { OrderTotals, ShippingDetails } from "../types"
import { chargeLabel } from "./charges"
import { findPayment } from "./details"
import { formatPhone } from "./address"
import { findCountry } from "./countries"

interface OrderMessageInput {
  details: ShippingDetails
  items: readonly CartLineItem[]
  siteName: string
  totals: OrderTotals
}

/** `Label: value`, or nothing when the value is empty. */
const row = (label: string, value: string) =>
  value ? [`${label}: ${value}`] : []

export function buildOrderMessage({
  details,
  items,
  siteName,
  totals,
}: OrderMessageInput) {
  const m = checkoutContent.message
  const country = findCountry(details.country)
  const payment = findPayment(details.paymentMethod)
  const place = [
    details.city,
    [details.region, details.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ")

  return [
    formatMessage(m.heading, { name: siteName }),
    "",
    m.itemsHeading,
    ...items.map(cartLineSummary),
    "",
    `${checkoutContent.summary.subtotal}: ${formatMills(totals.subtotalMills)}`,
    ...totals.charges.map(
      (charge) =>
        `${chargeLabel(charge.id)}: ${
          charge.amountMills === null
            ? checkoutContent.summary.pending
            : formatMills(charge.amountMills)
        }`
    ),
    `${checkoutContent.summary.total}: ${formatMills(totals.totalMills)}`,
    ...(totals.isFinal ? [] : [m.pendingNote]),
    "",
    m.customerHeading,
    ...row(m.name, `${details.firstName} ${details.lastName}`.trim()),
    ...row(m.email, details.email),
    ...row(m.phone, formatPhone(details.phone, details.country)),
    ...row(m.company, details.company),
    ...row(m.payment, payment?.label ?? ""),
    "",
    m.addressHeading,
    details.addressLine1,
    ...(details.addressLine2 ? [details.addressLine2] : []),
    place,
    country?.name ?? "",
    ...(details.notes ? ["", m.notesHeading, details.notes] : []),
  ].join("\n")
}
