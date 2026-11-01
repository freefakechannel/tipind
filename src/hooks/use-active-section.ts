"use client"

import { useEffect, useState } from "react"

/** Distance from the viewport top where a section counts as "current". */
const HEADER_OFFSET = 140
/** Scroll position (px) treated as "at the top of the page". */
const TOP_THRESHOLD = 8
/** The lock releases once no scroll event has fired for this long. */
const SETTLE_MS = 150

interface SectionOffset {
  id: string
  top: number
}

/**
 * Scroll-spy for single-page navigation.
 *
 * - Section offsets are cached and re-measured when the page size changes,
 *   so scrolling only reads `scrollY` (no layout reads per scroll).
 * - The active section is the last one whose top is above the line under
 *   the header, so it always resolves to a real section.
 * - The very top resolves to `homeId`, the very bottom to the last id.
 * - `lock(id)` pins a clicked link while the programmatic scroll runs. It
 *   releases when scrolling has actually settled, or immediately when the
 *   user takes over. Locking a different id mid-scroll simply retargets it.
 */
export function useActiveSection(ids: readonly string[], homeId: string) {
  const [observed, setObserved] = useState(homeId)
  const [locked, setLocked] = useState<string | null>(null)
  const key = ids.join(",")

  useEffect(() => {
    const sectionIds = key.split(",")
    let sections: SectionOffset[] = []

    const resolve = () => {
      const y = window.scrollY
      if (y <= TOP_THRESHOLD) return homeId

      const atBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 4
      if (atBottom) return sections.at(-1)?.id ?? homeId

      let current = homeId
      for (const section of sections) {
        if (section.top <= y + HEADER_OFFSET) current = section.id
      }
      return current
    }

    const sync = () => {
      setObserved(resolve())
    }

    const measure = () => {
      sections = sectionIds.map((id) => {
        const element = document.getElementById(id)
        return {
          id,
          top: element
            ? element.getBoundingClientRect().top + window.scrollY
            : Number.POSITIVE_INFINITY,
        }
      })
      sections.sort((a, b) => a.top - b.top)
      sync()
    }

    // Fires once on observe, then whenever the page height changes
    // (fonts, images, responsive layout shifts).
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(document.body)

    window.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", measure)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("scroll", sync)
      window.removeEventListener("resize", measure)
    }
  }, [key, homeId])

  useEffect(() => {
    if (!locked) return

    const controller = new AbortController()
    const options = { passive: true, signal: controller.signal }
    let timer = 0

    const release = () => {
      setLocked(null)
    }
    // Every scroll event pushes the release back, so the lock lasts exactly
    // as long as the scroll does (also covers "already at the target").
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(release, SETTLE_MS)
    }

    arm()
    window.addEventListener("scroll", arm, options)
    // User input cancels the smooth scroll, so hand control back at once.
    window.addEventListener("wheel", release, options)
    window.addEventListener("touchstart", release, options)
    window.addEventListener("keydown", release, options)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [locked])

  return { activeId: locked ?? observed, lock: setLocked }
}
