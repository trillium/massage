import { createContext } from 'react'

export interface ClientSlugContextType {
  propertyName?: string
  clientName?: string
  location?: {
    street?: string
    city?: string
    zip?: string
  }
}

export const ClientSlugContext = createContext<ClientSlugContextType>({})
