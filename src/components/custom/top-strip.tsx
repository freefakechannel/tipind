import { Mail, Phone } from "lucide-react"

import { Container } from "@/components/ui/container"
import { siteContent } from "@/config/content"
import { siteConfig } from "@/config/site"

const linkClass =
  "inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-white dark:hover:text-blue-300"
const iconClass = "size-3.5 shrink-0 text-blue-200 dark:text-blue-300"

export function TopStrip() {
  const { contact } = siteConfig

  return (
    <div className="h-9 bg-linear-to-r from-blue-700 via-blue-600 to-blue-700 text-[11px] tracking-[0.015em] text-white dark:from-blue-950 dark:via-slate-900 dark:to-blue-950 dark:text-slate-200">
      <Container className="flex size-full items-center justify-between gap-3 md:gap-4">
        <p className="hidden items-center gap-2 text-blue-50 md:flex dark:text-slate-300">
          <span
            aria-hidden="true"
            className="size-1.5 animate-pulsing rounded-full bg-emerald-300 ring-4 ring-emerald-300/20 animate-delay-250 animate-duration-1000 animate-fill-mode-forwards animate-iteration-count-infinite animate-steps-modern dark:bg-emerald-400 dark:ring-emerald-400/15"
          />
          {siteContent.ui.headerIntro} {siteConfig.founded}
        </p>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 md:flex-none md:justify-end md:gap-6">
          <a className={`${linkClass} shrink-0`} href={contact.phoneHref}>
            <Phone aria-hidden="true" className={iconClass} />
            <span className="whitespace-nowrap">
              {contact.phone || siteContent.ui.phoneFallback}
            </span>
          </a>
          <a className={linkClass} href={contact.emailHref}>
            <Mail aria-hidden="true" className={iconClass} />
            <span className="truncate">
              {contact.email || siteContent.ui.emailFallback}
            </span>
          </a>
        </div>
      </Container>
    </div>
  )
}
