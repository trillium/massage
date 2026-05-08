'use client'

import { FeedtackProvider } from 'feedtack/react'
import { WebhookAdapter, ConsoleAdapter } from 'feedtack'

const isDev = process.env.NODE_ENV === 'development'

const adapter = isDev
  ? new ConsoleAdapter()
  : new WebhookAdapter({
      submitUrl: '/api/feedtack',
      updateUrl: '/api/feedtack',
      loadFeedback: async (filter) => {
        const params = filter?.pathname ? `?pathname=${encodeURIComponent(filter.pathname)}` : ''
        const res = await fetch(`/api/feedtack${params}`)
        if (!res.ok) return []
        return res.json()
      },
    })

export default function FeedtackOverlay({
  user,
}: {
  user: { id?: string; email?: string | null } | null
}) {
  return (
    <FeedtackProvider
      adapter={adapter}
      currentUser={{ id: user?.id ?? 'dev', name: user?.email ?? 'Dev', role: 'admin' }}
      hotkey="p"
    >
      <span />
    </FeedtackProvider>
  )
}
