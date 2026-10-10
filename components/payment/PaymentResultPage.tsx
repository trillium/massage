import SectionContainer from '@/components/SectionContainer'
import { H1 } from '@/components/ui/heading'
import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

type Props = {
  title: string
  message: string
}

export default function PaymentResultPage({ title, message }: Props) {
  return (
    <SectionContainer>
      <Box className="mx-auto max-w-xl py-8 sm:py-16">
        <H1>{title}</H1>
        <TextBase status="secondary" className="mt-4">
          {message}
        </TextBase>
      </Box>
    </SectionContainer>
  )
}
