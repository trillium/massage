'use client'

import clsx from 'clsx'
import type { PageConfigurationReturnType } from '@/lib/componentTypes'
import SandboxProvider, { useSandbox } from './SandboxProvider'
import UserView from './components/UserView'
import AdminView from './components/AdminView'
import pagesData from '@/data/pages.json'
import { TextXs, TextXsMuted } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

function TabBar() {
  const { state, dispatch, resetSession } = useSandbox()
  const { activeTab } = state
  const pendingCount = state.events.filter((e) => e.status === 'pending').length
  const { sandbox } = pagesData

  const handleReset = async () => {
    await resetSession()
    dispatch({ type: 'SET_TAB', tab: 'user' })
  }

  return (
    <nav className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-lg bg-surface-50 px-4 py-3 shadow-md dark:bg-surface-800">
      <Stack direction="row" gap={1}>
        {(['user', 'admin'] as const).map((tab) => (
          <Button
            key={tab}
            onClick={() => dispatch({ type: 'SET_TAB', tab })}
            className={clsx(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-accent-600 hover:bg-surface-200 dark:text-accent-300 dark:hover:bg-surface-700'
            )}
          >
            {sandbox.tabs[tab]}
            {tab === 'admin' && pendingCount > 0 && (
              <TextXs className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                {' '}
                {/* ds-ignore */}
                {pendingCount}
              </TextXs>
            )}
          </Button>
        ))}
      </Stack>
      <Stack direction="row" align="center" gap={3}>
        <TextXsMuted className="hidden sm:inline">{sandbox.labels.mode}</TextXsMuted>
        <Button
          onClick={handleReset}
          className="rounded-md bg-surface-200 px-3 py-1.5 text-sm font-medium text-accent-700 transition-colors hover:bg-surface-300 dark:bg-surface-700 dark:text-accent-300 dark:hover:bg-surface-600"
        >
          {sandbox.buttons.reset}
        </Button>
      </Stack>
    </nav>
  )
}

function SandboxContent({ pageConfig }: { pageConfig: PageConfigurationReturnType }) {
  const { state } = useSandbox()

  return (
    <Box className="mx-auto max-w-4xl px-4 py-6">
      <TabBar />
      {state.activeTab === 'user' ? <UserView pageConfig={pageConfig} /> : <AdminView />}
    </Box>
  )
}

export default function SandboxClientPage({
  pageConfig,
  initialTab,
  initialSessionId,
}: {
  pageConfig: PageConfigurationReturnType
  initialTab: 'user' | 'admin'
  initialSessionId?: string
}) {
  return (
    <SandboxProvider initialTab={initialTab} initialSessionId={initialSessionId}>
      <SandboxContent pageConfig={pageConfig} />
    </SandboxProvider>
  )
}
