"use client"

import { useState, useCallback } from "react"

export function useDialogs<K extends string>(keys: K[]) {
  const [openStates, setOpenStates] = useState<Record<K, boolean>>(() => {
    const initial = {} as Record<K, boolean>
    keys.forEach((k) => {
      initial[k] = false
    })
    return initial
  })

  const isOpen = useCallback((key: K) => !!openStates[key], [openStates])

  const setOpen = useCallback((key: K, open: boolean) => {
    setOpenStates((prev) => ({ ...prev, [key]: open }))
  }, [])

  const open = useCallback((key: K) => {
    setOpenStates((prev) => ({ ...prev, [key]: true }))
  }, [])

  const close = useCallback((key: K) => {
    setOpenStates((prev) => ({ ...prev, [key]: false }))
  }, [])

  const toggle = useCallback((key: K) => {
    setOpenStates((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
  }
}
