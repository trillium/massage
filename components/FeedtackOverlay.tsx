'use client'

import { FeedtackProvider } from 'feedtack/react'
import { WebhookAdapter } from 'feedtack'

const adapter = new WebhookAdapter({
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
      theme={{
        primary: '#2563eb',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textMuted: '#6b7280',
        border: '#e5e7eb',
        radius: '8px',
        badge: '#f59e0b',
      }}
    >
      <span />
    </FeedtackProvider>
  )
}
