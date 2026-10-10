"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Calculator, Copy, Trash2, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { siteContent } from "@/config/content"
import { siteConfig } from "@/config/site"
import { formatCents, formatNumber, pluralize } from "@/lib/format"

import { createEstimateSummary } from "../lib/summary"
import {
  selectPacketCount,
  selectTotalCents,
  useEstimateStore,
} from "../store/estimate-store"
import { EstimateLineCard } from "./estimate-line-card"

export function EstimateDrawer() {
  const copy = siteContent.estimate
  const open = useEstimateStore((state) => state.isDrawerOpen)
  const items = useEstimateStore((state) => state.items)
  const isHydrated = useEstimateStore((state) => state.isHydrated)
  const isStorageAvailable = useEstimateStore(
    (state) => state.isStorageAvailable
  )
  const packets = useEstimateStore(selectPacketCount)
  const total = useEstimateStore(selectTotalCents)
  const { clear, setDrawerOpen } = useEstimateStore((state) => state.actions)
  const [feedback, setFeedback] = useState("")

  const packetsLabel = `${formatNumber(packets)} ${pluralize(packets, "packet", "packets")}`

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(
        createEstimateSummary(items, siteConfig.name)
      )
      setFeedback(copy.copiedMessage)
    } catch {
      setFeedback(copy.copyFailureMessage)
    }
  }

  return (
    <Dialog.Root onOpenChange={setDrawerOpen} open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-80 bg-neutral-950/45 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-81 flex h-dvh w-full max-w-xl flex-col overflow-hidden border-l border-border bg-background text-foreground shadow-2xl transition-transform duration-300 ease-out outline-none data-ending-style:translate-x-full data-starting-style:translate-x-full motion-reduce:transition-none">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold tracking-[0.12em] text-primary-text uppercase">
                <Calculator aria-hidden="true" className="size-4" />
                {copy.eyebrow}
              </span>
              <Dialog.Title className="mt-1 mb-0 font-display text-2xl font-extrabold tracking-tight text-ink">
                {copy.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 mb-0 text-sm leading-5 text-muted-foreground">
                {copy.description}
              </Dialog.Description>
            </div>
            <Button
              aria-label={copy.closeAction}
              className="size-9 shrink-0 rounded-lg text-ink-soft"
              onClick={() => {
                setDrawerOpen(false)
              }}
              size="icon"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </header>

          <div className="shrink-0 space-y-3 border-b border-border px-5 py-3 sm:px-6">
            <Card className="gap-1 border-primary-200/80 bg-primary-50/80 p-3 text-xs leading-5 text-primary-950 dark:border-primary-900/80 dark:bg-primary-950/40 dark:text-primary-100">
              <p className="m-0">{copy.localOnlyNotice}</p>
              <p className="m-0 text-primary-800 dark:text-primary-200">
                {copy.packPriceNote}
              </p>
            </Card>
            {!isStorageAvailable && (
              <p
                className="m-0 rounded-xl border border-warning-300 bg-warning-50 px-3 py-2 text-xs font-semibold text-warning-950 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-100"
                role="status"
              >
                {copy.storageUnavailableNotice}
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {!isHydrated ? (
              <div
                aria-busy="true"
                className="flex min-h-48 items-center justify-center text-sm font-semibold text-muted-foreground"
                role="status"
              >
                {copy.loadingMessage}
              </div>
            ) : items.length === 0 ? (
              <Card className="min-h-64 items-center justify-center p-8 text-center">
                <span className="mb-1 grid size-14 place-items-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-text dark:border-primary-900 dark:bg-primary-950">
                  <Calculator aria-hidden="true" className="size-6" />
                </span>
                <h2 className="m-0 font-display text-xl font-extrabold text-ink">
                  {copy.emptyTitle}
                </h2>
                <p className="m-0 mb-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  {copy.emptyDescription}
                </p>
                <Button
                  onClick={() => {
                    setDrawerOpen(false)
                  }}
                  variant="outline"
                >
                  {copy.continueBrowsingAction}
                </Button>
              </Card>
            ) : (
              <section aria-labelledby="estimate-products-heading">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2
                    className="m-0 font-display text-base font-extrabold text-ink"
                    id="estimate-products-heading"
                  >
                    {copy.productsHeading}
                  </h2>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {formatNumber(items.length)}{" "}
                    {pluralize(items.length, "product", "products")} ·{" "}
                    {packetsLabel}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <EstimateLineCard item={item} key={item.id} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {isHydrated && items.length > 0 && (
            <aside
              aria-labelledby="estimate-total-heading"
              className="shrink-0 border-t border-border bg-card px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6"
            >
              <div className="flex items-end justify-between gap-3">
                <h2
                  className="m-0 text-sm font-extrabold tracking-wide text-muted-foreground uppercase"
                  id="estimate-total-heading"
                >
                  {copy.totalLabel}
                </h2>
                <p className="m-0 text-2xl font-extrabold tracking-tight text-primary-text tabular-nums">
                  {formatCents(total)}
                </p>
              </div>
              <p className="mt-1 mb-0 text-xs text-muted-foreground">
                {packetsLabel} total
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button onClick={() => void copySummary()} variant="outline">
                  <Copy aria-hidden="true" />
                  {copy.copyAction}
                </Button>
                <Button
                  className="text-danger-700 hover:bg-danger-50 hover:text-danger-800 dark:text-danger-300 dark:hover:bg-danger-950/50"
                  onClick={() => {
                    clear()
                    setFeedback("")
                  }}
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" />
                  {copy.clearAction}
                </Button>
              </div>
              <p
                aria-live="polite"
                className="mt-2 mb-0 min-h-5 text-xs text-muted-foreground"
                role="status"
              >
                {feedback}
              </p>
            </aside>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
