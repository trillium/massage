'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'

export function CreateRaffleForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const res = await adminFetch('/api/admin/raffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Raffle "${name.trim()}" created`)
      setName('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create raffle')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label
          htmlFor="raffle-name"
          className="mb-1 block text-sm font-medium text-accent-700 dark:text-accent-300"
        >
          New Raffle
        </label>
        <input
          id="raffle-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Raffle name"
          className="w-full rounded-md border border-accent-300 px-3 py-2 shadow-sm focus:border-blue-500 dark:border-accent-600 dark:bg-surface-700 dark:text-accent-100"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:bg-surface-300"
      >
        {submitting ? 'Creating…' : 'Create'}
      </button>
    </form>
  )
}
