import SectionContainer from '@/components/SectionContainer'
import PageTitle from '@/components/PageTitle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import raffleData from '@/data/raffle.json'
import RaffleForm from './RaffleForm'

interface Raffle {
  id: string
  name: string
}

export default async function NerdstageRafflePage() {
  const supabase = getSupabaseAdminClient()

  let raffle: Raffle | null = null
  if (supabase) {
    const { data } = await supabase
      .from('raffles' as never)
      .select('id, name')
      .eq('is_active' as never, true)
      .limit(1)
      .single()
    raffle = data as Raffle | null
  }

  if (!raffle) {
    return (
      <SectionContainer>
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <PageTitle>{raffleData.nerdstage.pageHeadingNotActive}</PageTitle>
          <p className="mt-4 text-surface-600 dark:text-surface-400">
            {raffleData.nerdstage.pageSubtextNotActive}
          </p>
        </div>
      </SectionContainer>
    )
  }

  return (
    <SectionContainer>
      <PageTitle>{raffle.name}</PageTitle>
      <p className="mb-2 text-surface-600 dark:text-surface-400">
        {raffleData.nerdstage.pageSubtext}
      </p>
      <p className="mb-6 text-xs text-surface-400 dark:text-surface-500">
        {raffleData.nerdstage.redeemDeadline}
      </p>
      <div className="mx-auto max-w-2xl">
        <RaffleForm raffleId={raffle.id} raffleName={raffle.name} />
      </div>
    </SectionContainer>
  )
}
