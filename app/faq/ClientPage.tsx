'use client'
import { FAQCard } from 'components/FAQ'
import BookSessionButton from 'components/BookSessionButton'
import { Stack } from '@/components/ui/stack'

export default function About() {
  return (
    <Stack direction="col" align="center">
      <FAQCard />
      <BookSessionButton title="Book a Session!" href="/book" />
    </Stack>
  )
}
