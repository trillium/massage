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

interface WinnerMessagesProps {
  winner: Entry
  nonWinners: Entry[]
  expirationDate: string
}

function WinnerCard({
  winner,
  followedUp,
  onToggleFollowedUp,
  winnerTemplate,
  onTemplateChange,
  resolvedMessage,
  onMessageOverride,
}: {
  winner: Entry
  followedUp: boolean
  onToggleFollowedUp: () => void
  winnerTemplate: string
  onTemplateChange: (v: string) => void
  resolvedMessage: string
  onMessageOverride: (v: string) => void
}) {
  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
      <div className="mb-4 flex items-center justify-between">
        <H2 status="warning">Winner</H2>
        <label className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
          <input
            type="checkbox"
            checked={followedUp}
            onChange={onToggleFollowedUp}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          Followed up
        </label>
      </div>
      <EntryDetails entry={winner} />
      <div className="mt-4 space-y-3">
        <TemplateEditor
          label="Winner SMS Template"
          template={winnerTemplate}
          onChange={onTemplateChange}
        />
        <EditableMessage
          message={resolvedMessage}
          onChange={onMessageOverride}
          label="Winner SMS"
        />
      </div>
    </div>
  )
}

function NonWinnerCard({
  entry,
  followedUp,
  onToggleFollowedUp,
  resolvedMessage,
  onMessageOverride,
}: {
  entry: Entry
  followedUp: boolean
  onToggleFollowedUp: () => void
  resolvedMessage: string
  onMessageOverride: (v: string) => void
}) {
  return (
    <div className="rounded-lg border border-accent-100 p-4 dark:border-accent-800">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={followedUp}
            onChange={onToggleFollowedUp}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="font-medium text-accent-900 dark:text-accent-100">
            {capitalizeName(entry.name)}
          </span>
        </label>
        <span className="flex items-center gap-2">
          <TextXsMuted>{entry.phone}</TextXsMuted>
          <CopyButton text={entry.phone} label="Phone">
            Copy Phone
          </CopyButton>
        </span>
      </div>
      <EditableMessage
        message={resolvedMessage}
        onChange={onMessageOverride}
        label={`SMS for ${entry.name.split(' ')[0]}`}
      />
    </div>
  )
}

export function WinnerMessages({ winner, nonWinners, expirationDate }: WinnerMessagesProps) {
  const [winnerTemplate, setWinnerTemplate] = useState(DEFAULT_WINNER_TEMPLATE)
  const [nonWinnerTemplate, setNonWinnerTemplate] = useState(DEFAULT_NON_WINNER_TEMPLATE)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [followedUp, setFollowedUp] = useState<Record<string, boolean>>({})

  function getResolvedMessage(entryId: string, template: string, entry: Entry) {
    return overrides[entryId] !== undefined
      ? overrides[entryId]
      : resolveTemplate(template, entry, expirationDate)
  }

  function setOverride(entryId: string, value: string) {
    setOverrides((prev) => ({ ...prev, [entryId]: value }))
  }

  function toggleFollowedUp(entryId: string) {
    setFollowedUp((p) => ({ ...p, [entryId]: !p[entryId] }))
  }

  function handleTemplateChange(setter: (v: string) => void, value: string) {
    setter(value)
    setOverrides({})
  }

  const followedUpCount = nonWinners.filter((e) => followedUp[e.id]).length

  return (
    <div className="space-y-6">
      <TemplateVarsPanel />

      <WinnerCard
        winner={winner}
        followedUp={followedUp[winner.id] ?? false}
        onToggleFollowedUp={() => toggleFollowedUp(winner.id)}
        winnerTemplate={winnerTemplate}
        onTemplateChange={(v) => handleTemplateChange(setWinnerTemplate, v)}
        resolvedMessage={getResolvedMessage(winner.id, winnerTemplate, winner)}
        onMessageOverride={(v) => setOverride(winner.id, v)}
      />

      <div className="rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800">
        <H2 className="mb-4">
          Non-Winners ({nonWinners.length})
          {followedUpCount > 0 && (
            <TextSmMuted className="ml-2">· {followedUpCount} followed up</TextSmMuted>
          )}
        </H2>
        <TemplateEditor
          label="Non-Winner SMS Template"
          template={nonWinnerTemplate}
          onChange={(v) => handleTemplateChange(setNonWinnerTemplate, v)}
        />
        <div className="mt-4 space-y-4">
          {nonWinners.length === 0 ? (
            <TextSmMuted>No non-winner entries</TextSmMuted>
          ) : (
            nonWinners.map((entry) => (
              <NonWinnerCard
                key={entry.id}
                entry={entry}
                followedUp={followedUp[entry.id] ?? false}
                onToggleFollowedUp={() => toggleFollowedUp(entry.id)}
                resolvedMessage={getResolvedMessage(entry.id, nonWinnerTemplate, entry)}
                onMessageOverride={(v) => setOverride(entry.id, v)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
