'use client'

import {
  type Entry,
  type RaffleVars,
  type VarOverrides,
  capitalizeName,
  CopyButton,
  EntryDetails,
  EntryVarPanel,
  TemplateEditor,
  EditableMessage,
} from './WinnerMessageComponents'
import { H2 } from '@/components/ui/heading'
import { TextXsMuted, TextSmMedium, TextSm } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'

export function WinnerCard({
  winner,
  smsSent,
  onToggleSmsSent,
  winnerTemplate,
  onTemplateChange,
  resolvedMessage,
  onMessageOverride,
  noExpiration,
  lastUpdated,
}: {
  winner: Entry
  smsSent: boolean
  onToggleSmsSent: () => void
  winnerTemplate: string
  onTemplateChange: (v: string) => void
  resolvedMessage: string
  onMessageOverride: (v: string) => void
  noExpiration: boolean
  lastUpdated: string | null
}) {
  return (
    <Box variant="card-warning">
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
        <Box>
          <TemplateEditor
            label={`Winner SMS Template${noExpiration ? ' (no expiration set)' : ''}`}
            template={winnerTemplate}
            onChange={onTemplateChange}
          />
          {lastUpdated && <TextXsMuted className="mt-1">{`Last saved ${lastUpdated}`}</TextXsMuted>}
        </Box>
        <EditableMessage message={resolvedMessage} onChange={onMessageOverride} label="Winner SMS" />
      </Stack>
    </Box>
  )
}

export function NonWinnerCard({
  entry,
  smsSent,
  onToggleSmsSent,
  resolvedMessage,
  onMessageOverride,
  template,
  raffleVars,
  varOverrides,
  onVarOverride,
}: {
  entry: Entry
  smsSent: boolean
  onToggleSmsSent: () => void
  resolvedMessage: string
  onMessageOverride: (v: string) => void
  template: string
  raffleVars: RaffleVars
  varOverrides: VarOverrides
  onVarOverride: (varName: string, value: string) => void
}) {
  return (
    <Box className="rounded-lg border border-accent-100 p-4 dark:border-accent-800">
      <Stack direction="row" align="center" justify="between" className="mb-1">
        <label className="flex items-center gap-2">
          <input // ds-ignore - checkbox; Input is for text fields
            type="checkbox"
            checked={smsSent}
            onChange={onToggleSmsSent}
            className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
          />
          <TextSmMedium as="span">{capitalizeName(entry.name)}</TextSmMedium>
        </label>
        <TextSm as="span" className="flex items-center gap-2">
          <TextXsMuted>{entry.phone}</TextXsMuted>
          <CopyButton text={entry.phone} label="Phone">{'Copy Phone'}</CopyButton>
        </TextSm>
      </Stack>
      <EntryVarPanel
        template={template}
        entry={entry}
        raffleVars={raffleVars}
        varOverrides={varOverrides}
        onVarOverride={onVarOverride}
      />
      <Box className="mt-2">
        <EditableMessage
          message={resolvedMessage}
          onChange={onMessageOverride}
          label={`SMS for ${entry.name.split(' ')[0]}`}
        />
      </Box>
    </Box>
  )
}
