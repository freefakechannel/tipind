import { Download, LoaderCircle, Search } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { siteContent } from "@/config/content"
import { siteConfig } from "@/config/site"

interface CatalogEmptyStateProps {
  busy: boolean
  description: string
  title: string
}

export function CatalogEmptyState({
  busy,
  description,
  title,
}: CatalogEmptyStateProps) {
  return (
    <div
      className="flex min-h-70 flex-col items-center justify-center px-6 py-9 text-center"
      role="status"
    >
      <span className="mb-3 grid size-14 place-items-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-200">
        {busy ? (
          <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
        ) : (
          <Search aria-hidden="true" className="size-6" />
        )}
      </span>
      <h4 className="m-0 font-display text-base font-extrabold text-ink-soft">
        {title}
      </h4>
      {description && (
        <p className="mt-1 mb-4 max-w-sm text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      {siteConfig.catalog.pdfUrl && (
        <ButtonLink
          className="mt-3 min-h-9 text-xs"
          href={siteConfig.catalog.pdfUrl}
          rel="noreferrer"
          size="sm"
          target="_blank"
          variant="outline"
        >
          <Download aria-hidden="true" />
          {siteContent.catalog.openCatalogAction}
        </ButtonLink>
      )}
    </div>
  )
}
