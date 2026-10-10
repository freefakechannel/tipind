import type MiniSearch from "minisearch"
import type { SearchOptions } from "minisearch"

import { normalizeText } from "@/lib/format"

import type { CatalogProduct, MatchInfo } from "../types"

const FIELDS = ["name", "ingredient", "manufacturer", "packaging"]

const SEARCH_OPTIONS: SearchOptions = {
  boost: { name: 3, ingredient: 2, manufacturer: 1.5 },
  combineWith: "AND",
  fuzzy: 0.2,
  prefix: true,
}

type Index = MiniSearch<CatalogProduct>

const cache = new WeakMap<readonly CatalogProduct[], Promise<Index>>()

async function buildIndex(products: readonly CatalogProduct[]) {
  const { default: Engine } = await import("minisearch")
  const index = new Engine<CatalogProduct>({
    fields: FIELDS,
    idField: "id",
    processTerm: normalizeText,
    searchOptions: SEARCH_OPTIONS,
  })
  await index.addAllAsync(products, { chunkSize: 250 })
  return index
}

/** Builds the index once per dataset; the engine is code-split. */
export function loadSearchIndex(products: readonly CatalogProduct[]) {
  let pending = cache.get(products)
  if (!pending) {
    pending = buildIndex(products).catch((error: unknown) => {
      cache.delete(products)
      throw error
    })
    cache.set(products, pending)
  }
  return pending
}

export interface SearchOutcome {
  readonly products: readonly CatalogProduct[]
  readonly matches: ReadonlyMap<number, MatchInfo>
}

export function runSearch(
  index: Index,
  query: string,
  products: readonly CatalogProduct[]
): SearchOutcome {
  const found: CatalogProduct[] = []
  const matches = new Map<number, MatchInfo>()

  for (const result of index.search(query)) {
    const product = products.at(Number(result.id))
    if (!product) continue
    found.push(product)
    matches.set(product.id, result.match)
  }

  return { products: found, matches }
}

export function termsForField(matches: MatchInfo, field: string) {
  return Object.entries(matches)
    .filter(([, fields]) => fields.includes(field))
    .map(([term]) => term)
}

/** Shortens long text, keeping the first match visible when there is one. */
export function excerpt(text: string, terms: readonly string[], max = 112) {
  const value = text.trim()
  if (value.length <= max) return value

  const haystack = normalizeText(value)
  const hits = terms
    .map((term) => haystack.indexOf(normalizeText(term)))
    .filter((position) => position >= 0)
  const hit = hits.length > 0 ? Math.min(...hits) : -1

  const start = hit >= max - 16 ? Math.max(0, hit - 36) : 0
  const end = start + max
  let slice = value.slice(start, end)

  if (start > 0) slice = slice.slice(slice.indexOf(" ") + 1)
  if (end < value.length) {
    const cut = slice.lastIndexOf(" ")
    if (cut > max * 0.6) slice = slice.slice(0, cut)
  }

  return `${start > 0 ? "…" : ""}${slice.trim()}${end < value.length ? "…" : ""}`
}
