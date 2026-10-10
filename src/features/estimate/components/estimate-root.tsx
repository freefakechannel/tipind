"use client"

import { useEffect } from "react"

import { DEFAULT_WIDTH, STORAGE_KEY } from "../constants"
import { isStorageWritable } from "../lib/storage"
import { clampWidth, readStoredWidth } from "../lib/width"
import { useEstimateStore, type EstimateState } from "../store/estimate-store"
import { EstimateSidebar } from "./estimate-sidebar"

/** Mount once in the layout: hydrates the estimate, syncs tabs, drives the page offset. */
export function EstimateRoot() {
  useEffect(() => {
    const { persist } = useEstimateStore

    void Promise.resolve(persist.rehydrate()).then(() => {
      useEstimateStore.setState({
        isHydrated: true,
        isStorageAvailable: isStorageWritable(),
        width: clampWidth(readStoredWidth() ?? DEFAULT_WIDTH),
      })
    })

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        void persist.rehydrate()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  // main.css reads these to make room for the sidebar.
  useEffect(() => {
    const root = document.documentElement
    const apply = (state: EstimateState) => {
      root.dataset.estimate = state.isOpen ? "open" : "closed"
      root.style.setProperty("--estimate-width", `${state.width.toString()}px`)
    }
    apply(useEstimateStore.getState())

    const unsubscribe = useEstimateStore.subscribe((state, previous) => {
      if (state.isOpen !== previous.isOpen || state.width !== previous.width) {
        apply(state)
      }
    })
    return () => {
      unsubscribe()
      delete root.dataset.estimate
      root.style.removeProperty("--estimate-width")
    }
  }, [])

  return <EstimateSidebar />
}
