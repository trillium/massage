'use client'

import { createContext, useContext, useState } from 'react'

type EdgeRole = 'attendee' | 'volunteer' | 'team' | undefined

interface EdgeRoleContextValue {
  role: EdgeRole
  setRole: (role: EdgeRole) => void
}

const EdgeRoleContext = createContext<EdgeRoleContextValue>({
  role: undefined,
  setRole: () => {},
})

export function EdgeRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<EdgeRole>(undefined)
  return <EdgeRoleContext.Provider value={{ role, setRole }}>{children}</EdgeRoleContext.Provider>
}

export function useEdgeRole() {
  return useContext(EdgeRoleContext)
}
