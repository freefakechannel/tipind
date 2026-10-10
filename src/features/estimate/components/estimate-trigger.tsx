"use client"

import { Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { siteContent } from "@/config/content"
import { cn } from "@/lib/utils"

import { SIDEBAR_ID } from "../constants"
import { selectPacketCount, useEstimateStore } from "../store/estimate-store"

export function EstimateTrigger({ className }: { className?: string }) {
  const count = useEstimateStore(selectPacketCount)
  const isHydrated = useEstimateStore((state) => state.isHydrated)
  const isOpen = useEstimateStore((state) => state.isOpen)
  const toggle = useEstimateStore((state) => state.actions.toggle)

  const label = siteContent.ui.estimateAction
  const showCount = isHydrated && count > 0

  return (
    <Button
      aria-controls={SIDEBAR_ID}
      aria-expanded={isOpen}
      aria-label={showCount ? `${label} (${count.toString()})` : label}
      className={cn("relative size-9 md:h-10 md:w-auto md:px-3", className)}
      onClick={toggle}
      size="icon"
      title={label}
      variant="outline"
    >
      <Calculator aria-hidden="true" />
      <span className="hidden md:inline">{label}</span>
      {showCount && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.58rem] leading-5 font-extrabold text-primary-foreground shadow-sm"
        >
          {count > 99 ? "99+" : count.toString()}
        </span>
      )}
    </Button>
  )
}
