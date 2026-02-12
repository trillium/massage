'use client'

import { ClientSlugContext, ClientSlugContextType } from '@/lib/ClientSlugContext'

interface ClientSlugLayoutProps {
  children: React.ReactNode
  data: ClientSlugContextType
}

export default function ClientSlugLayout({ children, data }: ClientSlugLayoutProps) {
  return (
    <ClientSlugContext.Provider value={data}>
      {children}
    </ClientSlugContext.Provider>
  )
}
