import SectionContainer from '@/components/SectionContainer'
import PageTitle from '@/components/PageTitle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import RaffleForm from './RaffleForm'
import raffleData from '@/data/raffle.json'
import { Caption } from '@/components/ui/text'

const openclawData = raffleData.openclaw

interface Raffle {
  id: string
  name: string
}

export default async function OpenClawRafflePage() {
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
          <PageTitle>{openclawData.pageHeadingNotActive}</PageTitle>
          <p className="mt-4 text-surface-600 dark:text-surface-400">
            {openclawData.pageSubtextNotActive}
          </p>
        </div>
      </SectionContainer>
    )
  }

  return (
    <SectionContainer>
      <PageTitle>{raffle.name}</PageTitle>
      <p className="mb-2 text-surface-600 dark:text-surface-400">{openclawData.pageSubtext}</p>
      <Caption className="mb-6">
        {openclawData.redeemDeadline}
      </Caption>
      <div className="mx-auto max-w-2xl">
        <RaffleForm raffleId={raffle.id} raffleName={raffle.name} />
      </div>
    </SectionContainer>
  )
}
