"use client"

import { useDeferredValue, useMemo } from "react"

import { PAGE_SIZE } from "../constants"
import { filterProducts } from "../lib/filters"
import { runSearch, type SearchOutcome } from "../lib/search"
import {
  selectActiveFilterCount,
  useCatalogStore,
} from "../store/catalog-store"
import type {
  CatalogEntry,
  CatalogProduct,
  CatalogResults,
  MatchInfo,
} from "../types"
import { useSearchIndex } from "./use-search-index"

const NO_PRODUCTS: readonly CatalogProduct[] = []
const NO_MATCH: MatchInfo = {}
const NO_MATCHES: ReadonlyMap<number, MatchInfo> = new Map()

export function useCatalogResults(): CatalogResults {
  const dataset = useCatalogStore((state) => state.dataset)
  const query = useCatalogStore((state) => state.query)
  const page = useCatalogStore((state) => state.page)
  const manufacturer = useCatalogStore((state) => state.manufacturer)
  const packaging = useCatalogStore((state) => state.packaging)
  const priceRange = useCatalogStore((state) => state.priceRange)
  const activeFilterCount = useCatalogStore(selectActiveFilterCount)

  const deferredQuery = useDeferredValue(query.trim())
  const deferredPrice = useDeferredValue(priceRange)
  const products = dataset?.products
  const isSearching = deferredQuery.length > 0
  const search = useSearchIndex(products, isSearching)

  const searched = useMemo<SearchOutcome>(() => {
    if (!products) return { matches: NO_MATCHES, products: NO_PRODUCTS }
    if (!isSearching) return { matches: NO_MATCHES, products }
    if (!search.index) return { matches: NO_MATCHES, products: NO_PRODUCTS }
    return runSearch(search.index, deferredQuery, products)
  }, [products, isSearching, search.index, deferredQuery])

  const filtered = useMemo(
    () =>
      filterProducts(searched.products, {
        manufacturer,
        packaging,
        priceRange: deferredPrice,
      }),
    [searched.products, manufacturer, packaging, deferredPrice]
  )

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE

  const rows = useMemo<readonly CatalogEntry[]>(
    () =>
      filtered.slice(start, start + PAGE_SIZE).map((product) => ({
        matches: searched.matches.get(product.id) ?? NO_MATCH,
        product,
      })),
    [filtered, searched.matches, start]
  )

  return {
    firstItem: total === 0 ? 0 : start + 1,
    isFiltered: isSearching || activeFilterCount > 0,
    isIndexing: search.isIndexing,
    lastItem: Math.min(start + PAGE_SIZE, total),
    page: currentPage,
    pageCount,
    rows,
    searchError: search.error,
    total,
  }
}
