import React from 'react'

import SectionContainer from '@/components/SectionContainer'
import ReviewCard from '@/components/ReviewCard'
import BookSessionButton from '@/components/BookSessionButton'

export default async function Page() {
  return (
    <SectionContainer>
      <div className="flex flex-col items-center">
        <ReviewCard />
        <BookSessionButton title="Book a Session!" href="/book" />
      </div>
    </SectionContainer>
  )
}
