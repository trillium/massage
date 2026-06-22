'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'
import { H1 } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TextSm, TextSmMono } from '@/components/ui/text'

const KNOWN_QUERIES = [
  'free-30',
  'recharge_chair',
  '100Devs',
  'scale23x',
  'scale23x_after_hours',
  'chat',
  'the_kinn',
  'mr_pasadena',
  'overtime',
]

export default function CreateContainerPage() {
  const [containerQuery, setContainerQuery] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [titlePrefix, setTitlePrefix] = useState('')
  const [loading, setLoading] = useState(false)

  const containerString = `${containerQuery}__EVENT__CONTAINER__`
  const eventTitle = titlePrefix ? `${titlePrefix} ${containerString}` : containerString
  const canSubmit = containerQuery.trim() && date && startTime && endTime && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const response = await adminFetch('/api/admin/create-container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerQuery, date, startTime, endTime, titlePrefix }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to create container')

      toast.success(
        <Stack gap={1}>
          <Box>{'Container created!'}</Box>
          <Stack direction="row" gap={3}>
            <a
              href={result.event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {'Open in Calendar'}
            </a>
            <a
              href="/admin/active-event-containers"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {'View all containers'}
            </a>
          </Stack>
        </Stack>
      )
      setDate('')
      setStartTime('')
      setEndTime('')
      setTitlePrefix('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="mx-auto max-w-xl p-4 lg:p-6">
      <H1 className="mb-6">{'Create Event Container'}</H1>

      <Stack
        gap={4}
        className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800"
      >
        <Box>
          <Input
            id="containerQuery"
            label="Container query"
            type="text"
            list="known-queries"
            value={containerQuery}
            onChange={(e) => setContainerQuery(e.target.value)}
            placeholder="e.g. my-new-event"
          />
          <datalist id="known-queries">
            {KNOWN_QUERIES.map((q) => (
              <option key={q} value={q} />
            ))}
          </datalist>
        </Box>

        <Input
          id="date"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Box className="grid grid-cols-2 gap-3">
          <Input
            id="startTime"
            label="Start (LA time)"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            id="endTime"
            label="End (LA time)"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Box>

        <Input
          id="titlePrefix"
          label="Title prefix (optional)"
          type="text"
          value={titlePrefix}
          onChange={(e) => setTitlePrefix(e.target.value)}
          placeholder="e.g. Morning session"
        />

        <Box className="rounded-md border border-accent-200 bg-accent-50 px-3 py-2 text-sm dark:border-accent-700 dark:bg-surface-900">
          <TextSm as="span" status="muted">
            {'Event title: '}
          </TextSm>
          <TextSmMono as="span">{eventTitle}</TextSmMono>
        </Box>

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          {loading ? 'Creating…' : 'Create Container'}
        </Button>
      </Stack>
    </Box>
  )
}
