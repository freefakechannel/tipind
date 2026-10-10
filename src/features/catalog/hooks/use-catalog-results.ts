"use client"

import { useDeferredValue, useMemo } from "react"

import { PAGE_SIZE } from "../constants"
import { filterProducts } from "../lib/filters"
import { parseQuery, searchProducts } from "../lib/search"
import {
  selectActiveFilterCount,
  useCatalogStore,
} from "../store/catalog-store"
import type { CatalogProduct, CatalogResults } from "../types"

const NO_PRODUCTS: readonly CatalogProduct[] = []

export function useCatalogResults(): CatalogResults {
  const dataset = useCatalogStore((state) => state.dataset)
  const rawQuery = useCatalogStore((state) => state.query)
  const page = useCatalogStore((state) => state.page)
  const manufacturer = useCatalogStore((state) => state.manufacturer)
  const packaging = useCatalogStore((state) => state.packaging)
  const priceRange = useCatalogStore((state) => state.priceRange)
  const activeFilterCount = useCatalogStore(selectActiveFilterCount)

  const deferredQuery = useDeferredValue(rawQuery)
  const deferredPrice = useDeferredValue(priceRange)
  const products = dataset?.products ?? NO_PRODUCTS

  const query = useMemo(() => parseQuery(deferredQuery), [deferredQuery])
  const isSearching = query.terms.length > 0

  const searched = useMemo(
    () => (isSearching ? searchProducts(products, query) : products),
    [isSearching, products, query]
  )

  const filtered = useMemo(
    () =>
      filterProducts(searched, {
        manufacturer,
        packaging,
        priceRange: deferredPrice,
      }),
    [searched, manufacturer, packaging, deferredPrice]
  )

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE

  const rows = useMemo(
    () => filtered.slice(start, start + PAGE_SIZE),
    [filtered, start]
  )

  return {
    firstItem: total === 0 ? 0 : start + 1,
    isFiltered: isSearching || activeFilterCount > 0,
    lastItem: Math.min(start + PAGE_SIZE, total),
    page: currentPage,
    pageCount,
    query,
    rows,
    total,
  }
}
