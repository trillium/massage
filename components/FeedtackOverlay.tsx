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
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  return (
    <FeedtackProvider
      adapter={adapter}
      currentUser={{ id: userId, name: userName, role: 'admin' }}
      hotkey="p"
    >
      <span />
    </FeedtackProvider>
  )
}
