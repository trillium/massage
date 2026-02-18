import { SearchParamsType } from '@/lib/types'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import { DEFAULT_DURATION } from 'config'
import SandboxClientPage from './SandboxClientPage'

export default async function SandboxPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsType>
}) {
  const resolvedParams = await searchParams

  const mockData = {
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    busy: [],
    timeZone: 'America/Los_Angeles',
  }

  const result = await createPageConfiguration({
    resolvedParams: { duration: resolvedParams.duration || DEFAULT_DURATION.toString() },
    mocked: mockData,
  })

  const initialTab = resolvedParams.tab === 'admin' ? 'admin' : 'user'
  const sessionId =
    typeof resolvedParams.sessionId === 'string' ? resolvedParams.sessionId : undefined

  return (
    <SandboxClientPage
      pageConfig={result}
      initialTab={initialTab as 'user' | 'admin'}
      initialSessionId={sessionId}
    />
  )
}
