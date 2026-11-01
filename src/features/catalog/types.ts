export interface CatalogProduct {
  /** Equals the product's index in `CatalogDataset.products`. */
  readonly id: number
  readonly name: string
  readonly ingredient: string
  readonly manufacturer: string
  readonly packaging: string
  /** Dosage form / unit type (e.g. "tablet", "capsule", "injection"). */
  readonly type: string
  /** Price in mills (1/1000 USD). Null when the source has no usable price. */
  readonly priceMills: number | null
}

/** [min, max] in mills. */
export type PriceRange = readonly [number, number]

export interface CatalogDataset {
  readonly products: readonly CatalogProduct[]
  readonly manufacturers: readonly string[]
  readonly packaging: readonly string[]
  readonly types: readonly string[]
  readonly priceBounds: PriceRange
}

export type CatalogLoadStatus = "unconfigured" | "loading" | "ready" | "error"
export type FacetKind = "manufacturer" | "packaging"
export type FilterMode = "include" | "exclude"
export type FacetSelection = ReadonlyMap<string, FilterMode>

export interface SearchQuery {
  /** Lowercased, accent-free words. */
  readonly terms: readonly string[]
  /** The words joined without separators; only set for multi-word queries. */
  readonly compact: string
}

export interface CatalogResults {
  readonly rows: readonly CatalogProduct[]
  readonly query: SearchQuery
  readonly total: number
  readonly hasMore: boolean
  readonly loadedCount: number
  readonly isFiltered: boolean
}
