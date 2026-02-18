'use client'

import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import type { SandboxEvent, SandboxEmail } from './api/sandboxStore'

type SandboxState = {
  sessionId: string
  events: SandboxEvent[]
  emails: SandboxEmail[]
  activeTab: 'user' | 'admin'
}

type SandboxAction =
  | { type: 'SET_STATE'; events: SandboxEvent[]; emails: SandboxEmail[] }
  | { type: 'SET_TAB'; tab: 'user' | 'admin' }
  | { type: 'RESET' }

function reducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, events: action.events, emails: action.emails }
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }
    case 'RESET':
      return { ...state, events: [], emails: [] }
    default:
      return state
  }
}

type SandboxContextType = {
  state: SandboxState
  dispatch: React.Dispatch<SandboxAction>
  refreshState: () => Promise<void>
  approveEvent: (calendarEventId: string) => Promise<void>
  declineEvent: (calendarEventId: string) => Promise<void>
  resetSession: () => Promise<void>
}

const SandboxContext = createContext<SandboxContextType | null>(null)

export function useSandbox() {
  const ctx = useContext(SandboxContext)
  if (!ctx) throw new Error('useSandbox must be used within SandboxProvider')
  return ctx
}

function generateSessionId() {
  return crypto.randomUUID()
}

export default function SandboxProvider({
  children,
  initialTab = 'user',
  initialSessionId,
}: {
  children: React.ReactNode
  initialTab?: 'user' | 'admin'
  initialSessionId?: string
}) {
  const sessionIdRef = useRef(initialSessionId || generateSessionId())

  const [state, dispatch] = useReducer(reducer, {
    sessionId: sessionIdRef.current,
    events: [],
    emails: [],
    activeTab: initialTab,
  })

  const refreshState = useCallback(async () => {
    const res = await fetch(`/sandbox/api/state?sessionId=${sessionIdRef.current}`)
    if (res.ok) {
      const data = await res.json()
      dispatch({ type: 'SET_STATE', events: data.events, emails: data.emails })
    }
  }, [])

  const approve = useCallback(
    async (calendarEventId: string) => {
      await fetch('/sandbox/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, calendarEventId }),
      })
      await refreshState()
    },
    [refreshState]
  )

  const decline = useCallback(
    async (calendarEventId: string) => {
      await fetch('/sandbox/api/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, calendarEventId }),
      })
      await refreshState()
    },
    [refreshState]
  )

  const resetSessionFn = useCallback(async () => {
    await fetch(`/sandbox/api/state?sessionId=${sessionIdRef.current}`, { method: 'DELETE' })
    dispatch({ type: 'RESET' })
  }, [])

  useEffect(() => {
    if (initialTab === 'admin') {
      refreshState()
    }
  }, [initialTab, refreshState])

  return (
    <SandboxContext.Provider
      value={{
        state,
        dispatch,
        refreshState,
        approveEvent: approve,
        declineEvent: decline,
        resetSession: resetSessionFn,
      }}
    >
      {children}
    </SandboxContext.Provider>
  )
}
