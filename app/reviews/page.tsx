import React from 'react'

import SectionContainer from '@/components/SectionContainer'
import ReviewCard from '@/components/ReviewCard/ReviewCard'
import BookSessionButton from '@/components/BookSessionButton'
import { Stack } from '@/components/ui/stack'

export default async function Page() {
  return (
    <SectionContainer>
      <Stack direction="col" align="center">
        <ReviewCard />
        <BookSessionButton title="Book a Session!" href="/book" />
      </Stack>
    </SectionContainer>
  )
}
