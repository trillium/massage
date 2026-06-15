'use client'

import { useState } from 'react'
import {
  type Entry,
  DEFAULT_WINNER_TEMPLATE,
  DEFAULT_NON_WINNER_TEMPLATE,
  capitalizeName,
  resolveTemplate,
  CopyButton,
  EntryDetails,
  TemplateEditor,
  EditableMessage,
  TemplateVarsPanel,
} from './WinnerMessageComponents'
import { H2 } from '@/components/ui/heading'
import { TextSmMuted, TextXsMuted } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { adminFetch } from '@/lib/adminFetch'

interface WinnerMessagesProps {
  winner: Entry
  nonWinners: Entry[]
  expirationDate: string | null
  raffleName: string
}

function WinnerCard({
  winner,
  smsSent,
  onToggleSmsSent,
  winnerTemplate,
  onTemplateChange,
  resolvedMessage,
  onMessageOverride,
  expirationDate,
}: {
  winner: Entry
  smsSent: boolean
  onToggleSmsSent: () => void
  winnerTemplate: string
  onTemplateChange: (v: string) => void
  resolvedMessage: string
  onMessageOverride: (v: string) => void
  expirationDate: string | null
}) {
  return (
    <Box className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
      <Stack direction="row" align="center" justify="between" className="mb-4">
        <H2 status="warning">{'Winner'}</H2>
        <label className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
          <input // ds-ignore - checkbox; Input is for text fields
            type="checkbox"
            checked={smsSent}
            onChange={onToggleSmsSent}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          {'SMS sent'}
        </label>
      </Stack>
      <EntryDetails entry={winner} />
      <Stack gap={3} className="mt-4">
        <TemplateEditor
          label={`Winner SMS Template${expirationDate ? '' : ' (no expiration set)'}`}
          template={winnerTemplate}
          onChange={onTemplateChange}
        />
        <EditableMessage
          message={resolvedMessage}
          onChange={onMessageOverride}
          label="Winner SMS"
        />
      </Stack>
    </Box>
  )
}

function NonWinnerCard({
  entry,
  smsSent,
  onToggleSmsSent,
  resolvedMessage,
  onMessageOverride,
}: {
  entry: Entry
  smsSent: boolean
  onToggleSmsSent: () => void
  resolvedMessage: string
  onMessageOverride: (v: string) => void
}) {
  return (
    <Box className="rounded-lg border border-accent-100 p-4 dark:border-accent-800">
      <Stack direction="row" align="center" justify="between" className="mb-2">
        <label className="flex items-center gap-2">
          <input // ds-ignore - checkbox; Input is for text fields
            type="checkbox"
            checked={smsSent}
            onChange={onToggleSmsSent}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="font-medium text-accent-900 dark:text-accent-100">
            {capitalizeName(entry.name)}
          </span>
        </label>
        <span className="flex items-center gap-2">
          <TextXsMuted>{entry.phone}</TextXsMuted>
          <CopyButton text={entry.phone} label="Phone">
            {'Copy Phone'}
          </CopyButton>
        </span>
      </Stack>
      <EditableMessage
        message={resolvedMessage}
        onChange={onMessageOverride}
        label={`SMS for ${entry.name.split(' ')[0]}`}
      />
    </Box>
  )
}

export function WinnerMessages({
  winner,
  nonWinners,
  expirationDate,
  raffleName,
}: WinnerMessagesProps) {
  const [winnerTemplate, setWinnerTemplate] = useState(DEFAULT_WINNER_TEMPLATE)
  const [nonWinnerTemplate, setNonWinnerTemplate] = useState(DEFAULT_NON_WINNER_TEMPLATE)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [smsSent, setSmsSent] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    if (winner.sms_sent_at) init[winner.id] = true
    for (const e of nonWinners) if (e.sms_sent_at) init[e.id] = true
    return init
  })

  function getResolvedMessage(entryId: string, template: string, entry: Entry) {
    return overrides[entryId] !== undefined
      ? overrides[entryId]
      : resolveTemplate(template, entry, expirationDate)
  }

  function setOverride(entryId: string, value: string) {
    setOverrides((prev) => ({ ...prev, [entryId]: value }))
  }

  async function toggleSmsSent(entry: Entry) {
    const nowSent = !smsSent[entry.id]
    setSmsSent((p) => ({ ...p, [entry.id]: nowSent }))
    try {
      await adminFetch(`/api/admin/raffle/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_sent_at: nowSent ? new Date().toISOString() : null }),
      })
    } catch {
      setSmsSent((p) => ({ ...p, [entry.id]: !nowSent }))
    }
  }

  function handleTemplateChange(setter: (v: string) => void, value: string) {
    setter(value)
    setOverrides({})
  }

  function exportJson() {
    const allEntries = [winner, ...nonWinners]
    const messages = allEntries.map((entry) => ({
      id: entry.id,
      name: capitalizeName(entry.name),
      phone: entry.phone,
      email: entry.email,
      type: entry.is_winner ? 'winner' : 'non-winner',
      message: getResolvedMessage(
        entry.id,
        entry.is_winner ? winnerTemplate : nonWinnerTemplate,
        entry
      ),
      status: smsSent[entry.id] ? 'sent' : 'draft',
      sent_at: smsSent[entry.id] ? (entry.sms_sent_at ?? new Date().toISOString()) : null,
    }))

    const blob = new Blob(
      [
        JSON.stringify(
          { raffle: raffleName, exported_at: new Date().toISOString(), messages },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sms-${raffleName.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sentCount = Object.values(smsSent).filter(Boolean).length
  const totalCount = 1 + nonWinners.length

  return (
    <Stack gap={6}>
      <Stack direction="row" align="center" justify="between">
        <TemplateVarsPanel />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={exportJson}
          className="ml-4 shrink-0"
        >
          {`Export JSON (${sentCount}/${totalCount} sent)`}
        </Button>
      </Stack>

      <WinnerCard
        winner={winner}
        smsSent={smsSent[winner.id] ?? false}
        onToggleSmsSent={() => toggleSmsSent(winner)}
        winnerTemplate={winnerTemplate}
        onTemplateChange={(v) => handleTemplateChange(setWinnerTemplate, v)}
        resolvedMessage={getResolvedMessage(winner.id, winnerTemplate, winner)}
        onMessageOverride={(v) => setOverride(winner.id, v)}
        expirationDate={expirationDate}
      />

      <Box className="rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800">
        <H2 className="mb-4">
          {`Non-Winners (${nonWinners.length})`}
          {sentCount > 0 && <TextSmMuted className="ml-2">{`· ${sentCount} sent`}</TextSmMuted>}
        </H2>
        <TemplateEditor
          label="Non-Winner SMS Template"
          template={nonWinnerTemplate}
          onChange={(v) => handleTemplateChange(setNonWinnerTemplate, v)}
        />
        <Stack gap={4} className="mt-4">
          {nonWinners.length === 0 ? (
            <TextSmMuted>{'No non-winner entries'}</TextSmMuted>
          ) : (
            nonWinners.map((entry) => (
              <NonWinnerCard
                key={entry.id}
                entry={entry}
                smsSent={smsSent[entry.id] ?? false}
                onToggleSmsSent={() => toggleSmsSent(entry)}
                resolvedMessage={getResolvedMessage(entry.id, nonWinnerTemplate, entry)}
                onMessageOverride={(v) => setOverride(entry.id, v)}
              />
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
