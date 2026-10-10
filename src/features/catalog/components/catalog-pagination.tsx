"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { siteContent } from "@/config/content"
import { formatNumber, pluralize } from "@/lib/format"

import { RESULTS_ANCHOR_ID } from "../constants"
import { useCatalogStore } from "../store/catalog-store"
import type { CatalogResults } from "../types"

export function CatalogPagination({ results }: { results: CatalogResults }) {
  const copy = siteContent.catalog
  const setPage = useCatalogStore((state) => state.actions.setPage)
  const { firstItem, isFiltered, lastItem, page, pageCount, total } = results

  function goTo(next: number) {
    setPage(next)
    const anchor = document.getElementById(RESULTS_ANCHOR_ID)
    if (anchor && anchor.getBoundingClientRect().top < 0) {
      anchor.scrollIntoView({ block: "start" })
    }
  }

  const noun = pluralize(total, copy.productSingular, copy.productPlural)

  return (
    <div className="flex min-h-16 flex-col items-start justify-center gap-2 border-t border-border bg-neutral-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:bg-neutral-950/25">
      <p className="m-0 text-[0.68rem] text-muted-foreground">
        {total > 0 ? (
          <>
            {copy.summaryShowing}{" "}
            <strong className="text-ink-soft">
              {firstItem}–{lastItem}
            </strong>{" "}
            {copy.summaryOf}{" "}
            <strong className="text-ink-soft">{formatNumber(total)}</strong>{" "}
            {isFiltered ? `matching ${noun}` : noun}
          </>
        ) : (
          copy.noProducts
        )}
      </p>

      <div
        aria-label={copy.paginationLabel}
        className="flex items-center gap-2"
        role="group"
      >
        <Button
          aria-label={copy.previousPageAriaLabel}
          className="h-8 gap-1 rounded-lg px-2.5 text-[0.68rem]"
          disabled={page <= 1}
          onClick={() => {
            goTo(page - 1)
          }}
          size="sm"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
          <span>{copy.previousPage}</span>
        </Button>
        <span className="min-w-10 text-center text-[0.68rem] font-bold text-ink-soft tabular-nums">
          {page} <span className="font-normal text-muted-foreground">/</span>{" "}
          {pageCount}
        </span>
        <Button
          aria-label={copy.nextPageAriaLabel}
          className="h-8 gap-1 rounded-lg px-2.5 text-[0.68rem]"
          disabled={page >= pageCount}
          onClick={() => {
            goTo(page + 1)
          }}
          size="sm"
          variant="outline"
        >
          <span>{copy.nextPage}</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
