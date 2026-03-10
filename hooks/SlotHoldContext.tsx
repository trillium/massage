'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSlotHold } from './useSlotHold'

type SlotHoldContextValue = ReturnType<typeof useSlotHold>

const SlotHoldContext = createContext<SlotHoldContextValue | null>(null)

export function SlotHoldProvider({ children }: { children: ReactNode }) {
  const hold = useSlotHold()
  return <SlotHoldContext.Provider value={hold}>{children}</SlotHoldContext.Provider>
}

export function useSlotHoldContext(): SlotHoldContextValue {
  const ctx = useContext(SlotHoldContext)
  if (!ctx) throw new Error('useSlotHoldContext must be used within SlotHoldProvider')
  return ctx
}
