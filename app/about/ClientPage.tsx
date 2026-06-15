import AboutCard from 'components/AboutCard'
import BookSessionButton from 'components/BookSessionButton'
import { Stack } from '@/components/ui/stack'

export default function About() {
  return (
    <Stack direction="col" align="center">
      <AboutCard />
      <BookSessionButton title="Book a Session!" href="/book" />
    </Stack>
  )
}
