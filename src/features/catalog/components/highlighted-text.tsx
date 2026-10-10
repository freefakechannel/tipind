import { normalizeText } from "@/lib/format"

const TOKENS = /[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu
const IS_WORD = /^[\p{L}\p{N}]/u

interface HighlightedTextProps {
  terms: readonly string[]
  text: string
}

export function HighlightedText({ terms, text }: HighlightedTextProps) {
  if (!text) return <>—</>
  if (terms.length === 0) return <>{text}</>

  const wanted = new Set(terms.map(normalizeText))

  return (
    <>
      {Array.from(text.matchAll(TOKENS), (token) => {
        const part = token[0]
        return IS_WORD.test(part) && wanted.has(normalizeText(part)) ? (
          <mark
            className="rounded-xs bg-warning-200 px-0.5 font-extrabold text-warning-950 dark:bg-warning-700/70 dark:text-warning-50"
            key={token.index}
          >
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </>
  )
}
