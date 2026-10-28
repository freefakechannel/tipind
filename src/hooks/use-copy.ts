"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type CopyState = "idle" | "copied" | "failed"

export function useCopy(resetMs = 2200) {
  const [state, setState] = useState<CopyState>("idle")
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current)
    },
    []
  )

  const copy = useCallback(
    async (text: string) => {
      let ok: boolean
      try {
        await navigator.clipboard.writeText(text)
        ok = true
      } catch {
        ok = false
      }
      setState(ok ? "copied" : "failed")
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        setState("idle")
      }, resetMs)
      return ok
    },
    [resetMs]
  )

  return { copy, state }
}
