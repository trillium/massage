/* ds-ignore-file */
import { FaSearch } from 'react-icons/fa'
import admin from '@/data/admin.json'
import type { QueryGroup } from './getActiveContainers'
import { EventList } from './EventList'
import { formatDateTime } from './formatDateTime'
import { H3, H4 } from '@/components/ui/heading'
import { TextSmMuted, TextXsMedium, TextXsMuted } from '@/components/ui/text'

import { Code } from '@/components/ui/code'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export function QueryGroupCard({ group }: { group: QueryGroup }) {
  return (
    <Box className="overflow-hidden rounded-lg bg-surface-50 shadow dark:bg-surface-800">
      <Box className="bg-surface-100 px-6 py-4 dark:bg-surface-700">
        <Stack direction="row" align="center" justify="between">
          <Box>
            <H3 className="dark:text-white">
              {admin.activeEventContainers.queryLabel}
              <Code className="text-blue-600 dark:text-blue-400">{group.query}</Code>
            </H3>
            <Box className="mt-2">
              <TextSmMuted>
                {admin.activeEventContainers.slugsPreamble
                  .replace('{count}', String(group.slugs.length))
                  .replace('{plural}', group.slugs.length !== 1 ? 's' : '')}
              </TextSmMuted>
              <Stack className="mt-1" direction="row" wrap gap={2}>
                {group.slugs.map((slugInfo) => (
                  <TextXsMedium
                    key={slugInfo.slug}
                    className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 dark:bg-blue-800"
                    status="info"
                  >
                    {admin.activeEventContainers.slugPrefix}
                    {slugInfo.slug}
                    <span className="ml-1 text-blue-600 dark:text-blue-300">
                      {admin.activeEventContainers.slugTypePairOpen}
                      {admin.activeEventContainers.typeLabel}
                      {admin.activeEventContainers.slugTypeColon}
                      {slugInfo.type}
                      {admin.activeEventContainers.slugTypePairClose}
                    </span>
                  </TextXsMedium>
                ))}
              </Stack>
            </Box>
            <Box className="mt-3 space-y-1">
              <TextXsMuted>
                {admin.activeEventContainers.searchQueryLabel}{' '}
                <Code className="bg-surface-200 px-1 dark:bg-surface-600">
                  {admin.activeEventContainers.searchQueryGeneric}
                </Code>
              </TextXsMuted>
              <TextXsMuted>
                {admin.activeEventContainers.localFilterLabel}{' '}
                <Code className="bg-blue-100 px-1 dark:bg-blue-800">{group.searchQuery}</Code>
              </TextXsMuted>
              <TextXsMuted>
                {admin.activeEventContainers.containerPatternLabel}{' '}
                <Code className="bg-green-100 px-1 dark:bg-green-800">
                  {group.eventContainerString}
                </Code>
              </TextXsMuted>
              <TextXsMuted>
                {admin.activeEventContainers.memberPatternLabel}{' '}
                <Code className="bg-orange-100 px-1 dark:bg-orange-800">
                  {group.eventMemberString}
                </Code>
              </TextXsMuted>
            </Box>
          </Box>
          <Stack className="space-x-4 text-sm" direction="row">
            <Box className="text-center">
              <Box className="font-semibold text-green-600 dark:text-green-400">
                {group.containers.length}
              </Box>
              <Box className="text-accent-500 dark:text-accent-400">
                {admin.activeEventContainers.containersLabel}
              </Box>
            </Box>
            <Box className="text-center">
              <Box className="font-semibold text-orange-600 dark:text-orange-400">
                {group.members.length}
              </Box>
              <Box className="text-accent-500 dark:text-accent-400">
                {admin.activeEventContainers.membersLabel}
              </Box>
            </Box>
            <Box className="text-center">
              <Box className="font-semibold text-accent-600 dark:text-accent-400">
                {group.allEvents.length}
              </Box>
              <Box className="text-accent-500 dark:text-accent-400">
                {admin.activeEventContainers.totalEventsLabel}
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Box className="p-6">
        {group.allEvents.length > 0 && (
          <Box className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <H4 className="mb-2" status="info">
              <FaSearch className="mr-1 inline" />
              {admin.activeEventContainers.debugHeaderPrefix}
              {group.searchQuery}
              {admin.activeEventContainers.debugHeaderSuffix}
              {admin.activeEventContainers.debugCounterOpen}
              {group.allEvents.length}
              {admin.activeEventContainers.debugCounterClose}
            </H4>
            <Box className="max-h-40 overflow-y-auto">
              {group.allEvents.map((event) => (
                <Box key={event.id} className="mb-1 text-xs">
                  <span className="font-mono text-blue-800 dark:text-blue-200">
                    {admin.activeEventContainers.eventQuotePrefix}
                    {event.summary}
                    {admin.activeEventContainers.eventQuoteSuffix}
                    {admin.activeEventContainers.eventSummaryEventDateSeparator}
                    {formatDateTime(event.start.dateTime)}
                  </span>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box className="grid gap-6 md:grid-cols-2">
          <EventList
            events={group.containers}
            color="green"
            label={admin.activeEventContainers.containerEventsLabel}
            emptyMessage={admin.activeEventContainers.noContainerEventsMessage}
            patternString={group.eventContainerString}
          />
          <EventList
            events={group.members}
            color="orange"
            label={admin.activeEventContainers.memberEventsLabel}
            emptyMessage={admin.activeEventContainers.noMemberEventsMessage}
          />
        </Box>
      </Box>
    </Box>
  )
}
