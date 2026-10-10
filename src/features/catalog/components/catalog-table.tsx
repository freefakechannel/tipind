"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { siteContent } from "@/config/content"
import { formatCents, formatMessage } from "@/lib/format"
import { productLineId, quantityOf } from "@/features/estimate/lib/line-items"
import { useEstimateStore } from "@/features/estimate/store/estimate-store"

import { excerpt, termsForField } from "../lib/search"
import type { CatalogEntry, CatalogProduct } from "../types"
import { HighlightedText } from "./highlighted-text"

const th =
  "px-4 py-3 text-[0.62rem] font-extrabold tracking-[0.075em] text-muted-foreground uppercase"

function AddToEstimateButton({
  onAdded,
  product,
}: {
  onAdded: (name: string) => void
  product: CatalogProduct
}) {
  const copy = siteContent.catalog
  const lineId = productLineId(product)
  const isHydrated = useEstimateStore((state) => state.isHydrated)
  const addProduct = useEstimateStore((state) => state.actions.addProduct)
  const quantity = useEstimateStore((state) => quantityOf(state.items, lineId))

  const label = formatMessage(
    lineId ? copy.addToEstimateAriaLabel : copy.unavailablePriceAriaLabel,
    { product: product.name }
  )

  return (
    <Button
      aria-label={label}
      className="relative size-8 shrink-0 rounded-lg p-0 text-primary-text"
      disabled={!isHydrated || lineId === null}
      onClick={() => {
        const result = addProduct(product)
        if (result === "added" || result === "updated") onAdded(product.name)
      }}
      size="icon"
      title={label}
      variant="outline"
    >
      <Plus aria-hidden="true" />
      {quantity > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[0.58rem] leading-4.5 font-extrabold text-primary-foreground"
        >
          {quantity > 99 ? "99+" : quantity.toString()}
        </span>
      )}
    </Button>
  )
}

function Price({ cents }: { cents: number | null }) {
  return <>{cents === null ? "—" : formatCents(cents)}</>
}

interface CatalogTableProps {
  rows: readonly CatalogEntry[]
}

export function CatalogTable({ rows }: CatalogTableProps) {
  const copy = siteContent.catalog
  const [announcement, setAnnouncement] = useState("")

  function handleAdded(name: string) {
    setAnnouncement(
      formatMessage(copy.addedToEstimateAnnouncement, { product: name })
    )
  }

  return (
    <>
      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>

      {/* Cards below lg */}
      <ul className="divide-y divide-border/70 lg:hidden">
        {rows.map(({ matches, product }) => (
          <li className="space-y-2 px-5 py-4 sm:px-7" key={product.id}>
            <div className="flex items-start justify-between gap-3">
              <h4 className="m-0 min-w-0 text-sm font-bold text-primary-900 dark:text-primary-100">
                <HighlightedText
                  terms={termsForField(matches, "name")}
                  text={product.name}
                />
              </h4>
              <AddToEstimateButton onAdded={handleAdded} product={product} />
            </div>
            <p className="m-0 line-clamp-2 text-[0.7rem] leading-5 text-muted-foreground">
              <HighlightedText
                terms={termsForField(matches, "ingredient")}
                text={excerpt(
                  product.ingredient,
                  termsForField(matches, "ingredient")
                )}
              />
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem] font-semibold text-neutral-600 dark:text-neutral-300">
              <span className="min-w-0">
                <HighlightedText
                  terms={termsForField(matches, "manufacturer")}
                  text={product.manufacturer}
                />
              </span>
              <span className="inline-flex items-center gap-2">
                {product.packaging && (
                  <span className="rounded-md border border-primary-100 bg-primary-50 px-2 py-0.5 text-[0.62rem] font-bold dark:border-primary-900 dark:bg-primary-950/70 dark:text-primary-200">
                    <HighlightedText
                      terms={termsForField(matches, "packaging")}
                      text={product.packaging}
                    />
                  </span>
                )}
                <span className="text-sm font-extrabold text-primary-text tabular-nums">
                  <Price cents={product.priceCents} />
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Table from lg */}
      <div
        aria-label={copy.tableRegionLabel}
        className="hidden overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring lg:block"
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-4xl border-collapse text-left">
          <thead className="bg-neutral-50 dark:bg-neutral-900/70">
            <tr className="border-y border-border">
              <th className={`${th} w-[23%]`} scope="col">
                {copy.tableHeadings.product}
              </th>
              <th className={`${th} w-[32%]`} scope="col">
                {copy.tableHeadings.ingredient}
              </th>
              <th className={`${th} w-[20%]`} scope="col">
                {copy.tableHeadings.manufacturer}
              </th>
              <th className={`${th} w-30`} scope="col">
                {copy.tableHeadings.packaging}
              </th>
              <th className={`${th} pr-7 text-right`} scope="col">
                {copy.tableHeadings.rate}
              </th>
              <th className={`${th} pr-7 text-right`} scope="col">
                {copy.tableHeadings.estimateButton}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ matches, product }) => {
              const ingredientTerms = termsForField(matches, "ingredient")
              return (
                <tr
                  className="border-b border-border/70 transition-colors last:border-0 hover:bg-primary-50/60 dark:hover:bg-primary-950/30"
                  key={product.id}
                >
                  <td className="px-4 py-3.5 text-xs font-bold text-primary-900 dark:text-primary-100">
                    <HighlightedText
                      terms={termsForField(matches, "name")}
                      text={product.name}
                    />
                  </td>
                  <td
                    className="max-w-90 px-4 py-3.5 text-[0.68rem] leading-5 font-semibold text-neutral-600 dark:text-neutral-300"
                    title={product.ingredient}
                  >
                    <span className="line-clamp-2">
                      <HighlightedText
                        terms={ingredientTerms}
                        text={excerpt(product.ingredient, ingredientTerms)}
                      />
                    </span>
                  </td>
                  <td className="max-w-55 px-4 py-3.5 text-[0.68rem] leading-5 font-semibold text-neutral-600 dark:text-neutral-300">
                    <HighlightedText
                      terms={termsForField(matches, "manufacturer")}
                      text={product.manufacturer}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex min-h-6 items-center rounded-md border border-primary-100 bg-primary-50 px-2 text-[0.62rem] font-bold whitespace-nowrap text-neutral-600 dark:border-primary-900 dark:bg-primary-950/70 dark:text-primary-200">
                      <HighlightedText
                        terms={termsForField(matches, "packaging")}
                        text={product.packaging}
                      />
                    </span>
                  </td>
                  <td className="py-3.5 pr-7 text-right text-xs font-extrabold whitespace-nowrap text-primary-text tabular-nums">
                    <Price cents={product.priceCents} />
                  </td>
                  <td className="py-3.5 pr-7 text-right text-xs font-extrabold whitespace-nowrap text-primary-text tabular-nums">
                    <AddToEstimateButton
                      onAdded={handleAdded}
                      product={product}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
