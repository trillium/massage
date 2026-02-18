'use client'

import { useRegisterActions } from 'kbar'
import { useRouter } from 'next/navigation'
import headerNavLinks from '@/data/headerNavLinks'

export function KBarNavActions() {
  const router = useRouter()

  const actions = [
    { id: 'nav-home', name: 'Home', section: 'Navigate', perform: () => router.push('/') },
    ...headerNavLinks.map((link) => ({
      id: `nav-${link.href}`,
      name: link.title,
      section: 'Navigate',
      perform: () => router.push(link.href),
    })),
  ]

  useRegisterActions(actions, [])

  return null
}
