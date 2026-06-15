'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import eventContent from '@/data/event.json'
import { H2 } from '@/components/ui/heading'
import { TextSm, TextSmMuted } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CancelButton({ eventId, token }: { eventId: string; token: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canConfirm = confirmText.toLowerCase() === 'cancel'

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setConfirmText('')
      setError(null)
    }
  }, [open])

  async function handleCancel() {
    if (!canConfirm) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/event/${eventId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to cancel')
        setLoading(false)
        return
      }

      setOpen(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        {eventContent.cancelButton.buttonLabel}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-surface-50 p-6 shadow-xl dark:bg-surface-800">
            <H2 className="dark:text-white">{eventContent.cancelButton.modalTitle}</H2>
            <TextSmMuted className="mt-2">
              {eventContent.cancelButton.modalMessage}
              <strong>{eventContent.cancelButton.modalConfirmWord}</strong>
              {eventContent.cancelButton.modalConfirmSuffix}
            </TextSmMuted>

            <Input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) handleCancel()
                if (e.key === 'Escape') setOpen(false)
              }}
              placeholder={eventContent.cancelButton.placeholder}
              className="mt-4 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 placeholder:text-accent-400 dark:border-accent-600 dark:bg-surface-700 dark:text-white dark:placeholder:text-accent-500"
            />

            {error && (
              <TextSm className="mt-2" status="error">
                {error}
              </TextSm>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <Button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-accent-600 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-200"
              >
                {eventContent.cancelButton.neverMind}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={!canConfirm || loading}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? eventContent.cancelButton.confirming : eventContent.cancelButton.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
