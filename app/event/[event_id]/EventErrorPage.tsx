import SectionContainer from '@/components/SectionContainer'
import { H1 } from '@/components/ui/heading'
import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

export default function EventErrorPage({ heading, message }: { heading: string; message: string }) {
  return (
    <SectionContainer>
      <Box className="py-16 text-center">
        <H1 className="dark:text-white">{heading}</H1>
        <TextBase status="secondary" className="mt-2">
          {message}
        </TextBase>
      </Box>
    </SectionContainer>
  )
}
