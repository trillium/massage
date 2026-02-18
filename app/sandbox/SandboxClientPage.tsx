'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { PageConfigurationReturnType } from '@/lib/componentTypes'
import SandboxProvider, { useSandbox } from './SandboxProvider'
import UserView from './components/UserView'
import AdminView from './components/AdminView'

function TabBar() {
  const { state, dispatch, resetSession } = useSandbox()
  const { activeTab } = state

  const handleReset = async () => {
    await resetSession()
    dispatch({ type: 'SET_TAB', tab: 'user' })
  }

  return (
    <nav className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-md dark:bg-gray-800">
      <div className="flex gap-1">
        {(['user', 'admin'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => dispatch({ type: 'SET_TAB', tab })}
            className={clsx(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {tab === 'user' ? 'Book a Massage' : 'Therapist Dashboard'}
            {tab === 'admin' && state.events.filter((e) => e.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {state.events.filter((e) => e.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-gray-400 sm:inline">Sandbox Mode</span>
        <button
          onClick={handleReset}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </nav>
  )
}

function SandboxContent({ pageConfig }: { pageConfig: PageConfigurationReturnType }) {
  const { state } = useSandbox()

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <TabBar />
      {state.activeTab === 'user' ? <UserView pageConfig={pageConfig} /> : <AdminView />}
    </div>
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
