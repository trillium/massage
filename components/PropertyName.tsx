'use client'

import { useContext } from 'react'
import { ClientSlugContext } from '@/lib/ClientSlugContext'

export default function PropertyName() {
  const { propertyName } = useContext(ClientSlugContext)
  return <>{propertyName || 'Your Property'}</>
}
