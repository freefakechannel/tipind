"use client"

import { useEffect } from "react"

import { STORAGE_KEY } from "../constants"
import { isStorageWritable } from "../lib/storage"
import { useEstimateStore } from "../store/estimate-store"
import { EstimateDrawer } from "./estimate-drawer"

export function EstimateRoot() {
  useEffect(() => {
    const { persist } = useEstimateStore

    void Promise.resolve(persist.rehydrate()).then(() => {
      useEstimateStore.setState({
        isHydrated: true,
        isStorageAvailable: isStorageWritable(),
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

  return <EstimateDrawer />
}
