import type { Metadata } from "next"

import { CheckoutPage } from "@/features/checkout/components/checkout-page"

export const metadata: Metadata = {
  alternates: { canonical: "/checkout" },
  robots: { follow: false, index: false },
  title: "Checkout",
}

export default function Checkout() {
  return <CheckoutPage />
}
