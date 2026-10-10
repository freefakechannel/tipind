export interface EstimateLineItem {
  readonly id: string
  readonly name: string
  readonly ingredient: string
  readonly manufacturer: string
  readonly packaging: string
  /** Price of one packet in mills (1/1000 USD). */
  readonly unitPriceMills: number
  readonly quantity: number
}

export type LineItemDetails = Omit<EstimateLineItem, "id" | "quantity">

export type AddResult = "added" | "updated" | "limit" | "unavailable"
