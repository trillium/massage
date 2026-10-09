import SectionContainer from '@/components/SectionContainer'
import { H1 } from '@/components/ui/heading'
import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

export default function Page() {
  return (
    <SectionContainer>
      <Box className="mx-auto max-w-xl py-8 sm:py-16">
        <H1>{'Payment cancelled'}</H1>
        <TextBase status="secondary" className="mt-4">
          {'No charge was made. You can return to your confirmation to pay when you are ready.'}
        </TextBase>
      </Box>
    </SectionContainer>
  )
}
