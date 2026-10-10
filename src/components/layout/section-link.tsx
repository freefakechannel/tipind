"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

import { scrollToSection } from "@/lib/scroll"

type SectionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Section id without the hash, e.g. "contact". */
  id: string
}

/** In-page link that scrolls the same way as the header nav. */
export function SectionLink({ id, onClick, ...props }: SectionLinkProps) {
  return (
    <Link
      href={`/#${id}`}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) scrollToSection(event, id)
      }}
      {...props}
    />
  )
}
