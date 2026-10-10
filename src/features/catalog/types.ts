export interface CatalogProduct {
  /** Equals the product's index in `CatalogDataset.products`. */
  readonly id: number
  readonly name: string
  readonly ingredient: string
  readonly manufacturer: string
  readonly packaging: string
  /** Null when the source has no usable price. */
  readonly priceCents: number | null
}

export type PriceRange = readonly [number, number]

export interface CatalogDataset {
  readonly products: readonly CatalogProduct[]
  readonly manufacturers: readonly string[]
  readonly packaging: readonly string[]
  readonly priceBounds: PriceRange
}

export type CatalogLoadStatus = "unconfigured" | "loading" | "ready" | "error"
export type FacetKind = "manufacturer" | "packaging"
export type FilterMode = "include" | "exclude"
export type FacetSelection = ReadonlyMap<string, FilterMode>

/** Search term to the fields it matched (MiniSearch `match`). */
export type MatchInfo = Readonly<Record<string, readonly string[]>>

export interface CatalogEntry {
  readonly product: CatalogProduct
  readonly matches: MatchInfo
}

export interface CatalogResults {
  readonly rows: readonly CatalogEntry[]
  readonly total: number
  readonly page: number
  readonly pageCount: number
  readonly firstItem: number
  readonly lastItem: number
  readonly isFiltered: boolean
  readonly isIndexing: boolean
  readonly searchError: string
}
