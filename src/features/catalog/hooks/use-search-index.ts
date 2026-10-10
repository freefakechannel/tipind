"use client"

import type MiniSearch from "minisearch"
import { useEffect, useState } from "react"

import { errorMessage } from "@/lib/guards"

import { loadSearchIndex } from "../lib/search"
import type { CatalogProduct } from "../types"

interface IndexState {
  error: string
  index: MiniSearch<CatalogProduct> | null
  source: readonly CatalogProduct[]
}

/** Builds the search index lazily, only once a query exists. */
export function useSearchIndex(
  products: readonly CatalogProduct[] | undefined,
  enabled: boolean
) {
  const [state, setState] = useState<IndexState | null>(null)

  useEffect(() => {
    if (!enabled || !products) return

    let active = true
    loadSearchIndex(products)
      .then((index) => {
        if (active) setState({ error: "", index, source: products })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          error: errorMessage(error, "Search could not be prepared."),
          index: null,
          source: products,
        })
      })

    return () => {
      active = false
    }
  }, [enabled, products])

  const current = state !== null && state.source === products ? state : null

  return {
    error: current?.error ?? "",
    index: current?.index ?? null,
    isIndexing: enabled && products !== undefined && current === null,
  }
}
