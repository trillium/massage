import SectionContainer from '@/components/SectionContainer'
import PageTitle from '@/components/PageTitle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import raffleData from '@/data/raffle.json'
import RaffleForm from './RaffleForm'
import { Caption, TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { getActiveRaffle } from '@/lib/raffle'

export default async function NerdstageRafflePage() {
  const supabase = getSupabaseAdminClient()
  const raffle = supabase ? await getActiveRaffle(supabase) : null

  if (!raffle) {
    return (
      <SectionContainer>
        <Stack className="min-h-[40vh] items-center justify-center text-center">
          <PageTitle>{raffleData.nerdstage.pageHeadingNotActive}</PageTitle>
          <TextBase status="surface" className="mt-4">
            {raffleData.nerdstage.pageSubtextNotActive}
          </TextBase>
        </Stack>
      </SectionContainer>
    )
  }

  return (
    <SectionContainer>
      <PageTitle>{raffle.name}</PageTitle>
      <TextBase status="surface" className="mb-2">
        {raffleData.nerdstage.pageSubtext}
      </TextBase>
      <Caption className="mb-6">{raffleData.nerdstage.redeemDeadline}</Caption>
      <Box className="mx-auto max-w-2xl">
        <RaffleForm raffleId={raffle.id} raffleName={raffle.name} />
      </Box>
    </SectionContainer>
  )
}
