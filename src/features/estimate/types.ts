export interface EstimateLineItem {
  readonly id: string
  readonly name: string
  readonly ingredient: string
  readonly manufacturer: string
  readonly packaging: string
  readonly unitPriceCents: number
  readonly quantity: number
}

export type LineItemDetails = Omit<EstimateLineItem, "id" | "quantity">

export type AddResult = "added" | "updated" | "limit" | "unavailable"
