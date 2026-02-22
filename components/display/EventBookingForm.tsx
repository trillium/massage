'use client'

import { useState } from 'react'
import { useReduxAvailability } from '@/redux/hooks'
import { formatLocalTime } from 'lib/availability/helpers'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function EventBookingForm() {
  const { selectedTime, timeZone, duration } = useReduxAvailability()
  const [name, setName] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')

  if (!selectedTime || !timeZone) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !selectedTime || !duration) return

    setFormState('submitting')

    try {
      const res = await fetch('/api/event-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          start: selectedTime.start,
          end: selectedTime.end,
          duration,
        }),
      })

      if (!res.ok) throw new Error()
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">You're booked!</p>
        <p className="mt-1 text-sm text-green-600">
          {formatLocalTime(selectedTime.start, { timeZone })} –{' '}
          {formatLocalTime(selectedTime.end, { timeZone })}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-700">
          {formatLocalTime(selectedTime.start, { timeZone })} –{' '}
          {formatLocalTime(selectedTime.end, { timeZone })} ({duration}min)
        </p>
      </div>

      <div>
        <label htmlFor="event-name" className="block text-sm font-medium text-gray-700">
          Your name
        </label>
        <input
          id="event-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none sm:text-sm"
          placeholder="First name"
        />
      </div>

      {formState === 'error' && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={formState === 'submitting' || !name.trim()}
        className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50"
      >
        {formState === 'submitting' ? 'Booking...' : 'Book this slot'}
      </button>
    </form>
  )
}
