import { siteContent } from "@/config/content"
import { formatNumber, formatMessage } from "@/lib/format"

import type { CatalogLoadStatus } from "../types"

export type StatusTone = "success" | "busy" | "error" | "muted"

interface StatusInput {
  isIndexing: boolean
  productCount: number
  searchError: string
  status: CatalogLoadStatus
}

export function getStatusView({
  isIndexing,
  productCount,
  searchError,
  status,
}: StatusInput): { tone: StatusTone; message: string } {
  const copy = siteContent.catalog.status

  if (searchError) return { tone: "error", message: copy.searchError }
  if (isIndexing) return { tone: "busy", message: copy.indexing }

  switch (status) {
    case "unconfigured":
      return { tone: "muted", message: copy.unconfigured }
    case "loading":
      return { tone: "busy", message: copy.loading }
    case "ready":
      return {
        tone: "success",
        message: formatMessage(copy.loaded, {
          count: formatNumber(productCount),
        }),
      }
    case "error":
      return { tone: "error", message: copy.error }
  }
}

export function getEmptyView({
  isIndexing,
  productCount,
  searchError,
  status,
}: StatusInput) {
  const copy = siteContent.catalog

  if (searchError)
    return { title: copy.status.searchError, description: searchError }
  if (isIndexing) return { title: copy.status.indexing, description: "" }
  if (status === "loading")
    return { title: copy.status.loading, description: "" }
  if (status === "unconfigured") {
    return {
      title: copy.noCatalogRecordsTitle,
      description: copy.noCatalogConfiguredDescription,
    }
  }
  if (status === "error") {
    return {
      title: copy.noCatalogRecordsTitle,
      description: copy.noCatalogUnavailableDescription,
    }
  }
  if (productCount === 0) {
    return {
      title: copy.noCatalogRecordsTitle,
      description: copy.noCatalogRecordsDescription,
    }
  }
  return { title: copy.emptyTitle, description: copy.emptyDescription }
}
