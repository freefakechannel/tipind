import { Fragment, type ReactNode } from "react"

import { findRanges } from "../lib/search"
import type { SearchQuery } from "../types"

interface HighlightedTextProps {
  query: SearchQuery
  text: string
}

/** Highlights exactly the matched letters, wherever they are in a word. */
export function HighlightedText({ query, text }: HighlightedTextProps) {
  if (!text) return <>—</>

  const ranges = findRanges(text, query)
  if (ranges.length === 0) return <>{text}</>

  const parts: ReactNode[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (start > cursor) {
      parts.push(
        <Fragment key={`t${cursor.toString()}`}>
          {text.slice(cursor, start)}
        </Fragment>
      )
    }
    parts.push(
      <mark
        className="rounded-xs bg-warning-200 text-warning-950 dark:bg-warning-600/60 dark:text-warning-50"
        key={`m${start.toString()}`}
      >
        {text.slice(start, end)}
      </mark>
    )
    cursor = end
  }
  if (cursor < text.length) {
    parts.push(
      <Fragment key={`t${cursor.toString()}`}>{text.slice(cursor)}</Fragment>
    )
  }

  return <>{parts}</>
}
