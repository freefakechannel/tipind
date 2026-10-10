"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Download, ExternalLink, LoaderCircle, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { siteContent } from "@/config/content"
import { errorMessage } from "@/lib/guards"

import { buildEstimatePdf } from "../lib/pdf/build-pdf"
import type { EstimateLineItem } from "../types"

type PdfState =
  | { status: "loading" }
  | { status: "ready"; fileName: string; url: string }
  | { status: "error"; message: string }

interface EstimatePdfDialogProps {
  items: readonly EstimateLineItem[]
  onClose: () => void
}

/** Builds the PDF on this device, previews it, and offers Download or Discard. */
export function EstimatePdfDialog({ items, onClose }: EstimatePdfDialogProps) {
  const copy = siteContent.estimate
  const [state, setState] = useState<PdfState>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    void buildEstimatePdf(items)
      .then(({ blob, fileName }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setState({ fileName, status: "ready", url: objectUrl })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          message: errorMessage(error, copy.pdfFailure),
          status: "error",
        })
      })

    return () => {
      cancelled = true
      // Discarding (closing) frees the file from memory.
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [items, copy.pdfFailure])

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      open
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-90 bg-neutral-950/55 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed inset-0 z-91 m-auto flex h-[min(54rem,calc(100dvh-1.5rem))] w-[min(62rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-[opacity,scale] duration-200 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="m-0 font-display text-lg font-extrabold tracking-tight text-ink">
                {copy.pdfPreviewTitle}
              </Dialog.Title>
              <Dialog.Description className="mt-1 mb-0 text-xs leading-5 text-muted-foreground">
                {copy.pdfPreviewDescription}
              </Dialog.Description>
            </div>
            <Button
              aria-label={copy.pdfDiscardAction}
              className="size-9 shrink-0 rounded-lg text-ink-soft"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </header>

          <div className="relative min-h-0 flex-1 bg-neutral-200/60 p-3 dark:bg-neutral-900">
            {state.status === "loading" && (
              <div
                className="flex size-full flex-col items-center justify-center gap-3 text-sm font-semibold text-muted-foreground"
                role="status"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-6 animate-spin text-primary-text"
                />
                {copy.pdfBuilding}
              </div>
            )}
            {state.status === "error" && (
              <div
                className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center text-sm"
                role="alert"
              >
                <p className="m-0 font-semibold text-danger-700 dark:text-danger-300">
                  {copy.pdfFailure}
                </p>
                <p className="m-0 text-xs text-muted-foreground">
                  {state.message}
                </p>
              </div>
            )}
            {state.status === "ready" && (
              <iframe
                className="size-full rounded-xl border border-border bg-white"
                src={`${state.url}#view=FitH&navpanes=0`}
                title={copy.pdfPreviewLabel}
              />
            )}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
            {state.status === "ready" ? (
              <a
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-text hover:underline"
                href={state.url}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
                {copy.pdfOpenInTab}
              </a>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button onClick={onClose} variant="outline">
                <Trash2 aria-hidden="true" />
                {copy.pdfDiscardAction}
              </Button>
              {state.status === "ready" ? (
                <a
                  className={buttonVariants({ variant: "default" })}
                  download={state.fileName}
                  href={state.url}
                >
                  <Download aria-hidden="true" />
                  {copy.pdfDownloadAction}
                </a>
              ) : (
                <Button disabled>
                  <Download aria-hidden="true" />
                  {copy.pdfDownloadAction}
                </Button>
              )}
            </div>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
