'use client'

import {
  type Entry,
  type SlugOption,
  TemplateEditor,
  TemplateVarsPanel,
} from './WinnerMessageComponents'
import { WinnerCard, NonWinnerCard } from './WinnerCards'
import { useWinnerMessages } from './useWinnerMessages'
import { H2 } from '@/components/ui/heading'
import { TextSmMuted, TextXsMuted, TextXsMedium } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import type { FieldHistoryEntry } from '@/lib/raffle'

interface WinnerMessagesProps {
  winner: Entry
  nonWinners: Entry[]
  raffleName: string
  raffleId: string
  savedWinnerTemplate: string | null
  savedNonWinnerTemplate: string | null
  savedUpgradeMinutes: number
  savedBookingLink: string | null
  expirationDate: string | null
  slugOptions: SlugOption[]
  fieldHistory: FieldHistoryEntry[]
}

export function WinnerMessages({
  winner,
  nonWinners,
  raffleName,
  raffleId,
  savedWinnerTemplate,
  savedNonWinnerTemplate,
  savedUpgradeMinutes,
  savedBookingLink,
  expirationDate,
  slugOptions,
  fieldHistory,
}: WinnerMessagesProps) {
  const {
    winnerTemplate,
    nonWinnerTemplate,
    upgradeMinutes,
    bookingLink,
    saveStatus,
    lastUpdatedFormatted,
    smsSent,
    raffleVars,
    entryVarOverrides,
    getResolvedMessage,
    handleVarOverride,
    setOverride,
    toggleSmsSent,
    handleWinnerTemplateChange,
    handleNonWinnerTemplateChange,
    handleUpgradeMinutesChange,
    handleBookingLinkChange,
    exportJson,
    sentCount,
    totalCount,
  } = useWinnerMessages({
    winner,
    nonWinners,
    raffleName,
    raffleId,
    savedWinnerTemplate,
    savedNonWinnerTemplate,
    savedUpgradeMinutes,
    savedBookingLink,
    expirationDate,
    fieldHistory,
  })

  return (
    <Stack gap={6}>
      <Stack direction="row" align="start" justify="between">
        <Box className="flex-1">
          <TemplateVarsPanel
            upgradeMinutes={upgradeMinutes}
            bookingLink={bookingLink}
            slugOptions={slugOptions}
            onUpgradeMinutesChange={handleUpgradeMinutesChange}
            onBookingLinkChange={handleBookingLinkChange}
          />
        </Box>
        <Stack gap={2} align="end" className="ml-4 mt-1 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={exportJson}>
            {`Export JSON (${sentCount}/${totalCount} sent)`}
          </Button>
          {saveStatus !== 'idle' && (
            <TextXsMedium status={saveStatus === 'saved' ? 'success' : 'muted'}>
              {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </TextXsMedium>
          )}
        </Stack>
      </Stack>

      <WinnerCard
        winner={winner}
        smsSent={smsSent[winner.id] ?? false}
        onToggleSmsSent={() => toggleSmsSent(winner)}
        winnerTemplate={winnerTemplate}
        onTemplateChange={handleWinnerTemplateChange}
        resolvedMessage={getResolvedMessage(winner.id, winnerTemplate, winner)}
        onMessageOverride={(v) => setOverride(winner.id, v)}
        noExpiration={!expirationDate}
        lastUpdated={lastUpdatedFormatted.winnerTemplate}
      />

      <Box variant="card">
        <H2 className="mb-4">
          {`Non-Winners (${nonWinners.length})`}
          {sentCount > 0 && <TextSmMuted className="ml-2">{`· ${sentCount} sent`}</TextSmMuted>}
        </H2>
        <TemplateEditor
          label="Non-Winner SMS Template"
          template={nonWinnerTemplate}
          onChange={handleNonWinnerTemplateChange}
        />
        {lastUpdatedFormatted.nonWinnerTemplate && (
          <TextXsMuted className="mt-1">{`Last saved ${lastUpdatedFormatted.nonWinnerTemplate}`}</TextXsMuted>
        )}
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
                template={nonWinnerTemplate}
                raffleVars={raffleVars}
                varOverrides={entryVarOverrides[entry.id] ?? {}}
                onVarOverride={(varName, value) => handleVarOverride(entry.id, varName, value)}
              />
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
