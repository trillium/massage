'use client'

import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import type { LocationObject } from '@/lib/locationTypes'
import eventContent from '@/data/event.json'
import { TextSm, TextSmMedium } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface EditFormProps {
  eventId: string
  token: string
  initialValues: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: LocationObject
  }
}

export default function EditForm({ eventId, token, initialValues }: EditFormProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState(initialValues)
  const uid = useId()

  async function handleSave() {
    setLoading(true)
    setError(null)

    const changed: Record<string, unknown> = {}
    if (values.firstName !== initialValues.firstName) changed.firstName = values.firstName
    if (values.lastName !== initialValues.lastName) changed.lastName = values.lastName
    if (values.email !== initialValues.email) changed.email = values.email
    if (values.phone !== initialValues.phone) changed.phone = values.phone
    const loc = values.location
    const initLoc = initialValues.location
    if (loc.street !== initLoc.street || loc.city !== initLoc.city || loc.zip !== initLoc.zip) {
      changed.location = loc
    }

    if (Object.keys(changed).length === 0) {
      setEditing(false)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/event/${eventId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, fields: changed }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        setLoading(false)
        return
      }

      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setEditing(!editing)}
        className="rounded-lg border border-accent-300 px-5 py-2.5 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-800"
      >
        {editing ? eventContent.editForm.button.close : eventContent.editForm.button.edit}
      </Button>
      {editing && (
        <Box className="mt-4 basis-full space-y-4 rounded-2xl border-2 border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800">
          <Box className="grid gap-4 sm:grid-cols-2">
            <label htmlFor={`${uid}-firstName`} className="block">
              <TextSmMedium>{eventContent.editForm.fields.firstName}</TextSmMedium>
              <Input
                id={`${uid}-firstName`}
                type="text"
                value={values.firstName}
                onChange={(e) => setValues({ ...values, firstName: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
              />
            </label>
            <label htmlFor={`${uid}-lastName`} className="block">
              <TextSmMedium>{eventContent.editForm.fields.lastName}</TextSmMedium>
              <Input
                id={`${uid}-lastName`}
                type="text"
                value={values.lastName}
                onChange={(e) => setValues({ ...values, lastName: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
              />
            </label>
          </Box>

          <label htmlFor={`${uid}-email`} className="block">
            <TextSmMedium>{eventContent.editForm.fields.email}</TextSmMedium>
            <Input
              id={`${uid}-email`}
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
            />
          </label>

          <label htmlFor={`${uid}-phone`} className="block">
            <TextSmMedium>{eventContent.editForm.fields.phone}</TextSmMedium>
            <Input
              id={`${uid}-phone`}
              type="tel"
              value={values.phone}
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
            />
          </label>

          <label htmlFor={`${uid}-street`} className="block">
            <TextSmMedium>{eventContent.editForm.fields.street}</TextSmMedium>
            <Input
              id={`${uid}-street`}
              type="text"
              value={values.location.street}
              onChange={(e) =>
                setValues({ ...values, location: { ...values.location, street: e.target.value } })
              }
              className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
            />
          </label>

          <Box className="grid gap-4 sm:grid-cols-2">
            <label htmlFor={`${uid}-city`} className="block">
              <TextSmMedium>{eventContent.editForm.fields.city}</TextSmMedium>
              <Input
                id={`${uid}-city`}
                type="text"
                value={values.location.city}
                onChange={(e) =>
                  setValues({ ...values, location: { ...values.location, city: e.target.value } })
                }
                className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
              />
            </label>
            <label htmlFor={`${uid}-zip`} className="block">
              <TextSmMedium>{eventContent.editForm.fields.zipCode}</TextSmMedium>
              <Input
                id={`${uid}-zip`}
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={values.location.zip}
                onChange={(e) =>
                  setValues({ ...values, location: { ...values.location, zip: e.target.value } })
                }
                className="mt-1 block w-full rounded-lg border border-accent-300 px-3 py-2 text-accent-900 dark:border-accent-600 dark:bg-surface-700 dark:text-white"
              />
            </label>
          </Box>

          {error && <TextSm status="error">{error}</TextSm>}

          <Stack direction="row" gap={3}>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {loading ? eventContent.editForm.button.saving : eventContent.editForm.button.save}
            </Button>
            <Button
              onClick={() => {
                setValues(initialValues)
                setEditing(false)
                setError(null)
              }}
              disabled={loading}
              className="rounded-lg border border-accent-300 px-5 py-2.5 text-sm font-medium text-accent-600 transition-colors hover:bg-surface-100 dark:border-accent-600 dark:text-accent-400 dark:hover:bg-surface-800"
            >
              {eventContent.editForm.button.cancel}
            </Button>
          </Stack>
        </Box>
      )}
    </>
  )
}
