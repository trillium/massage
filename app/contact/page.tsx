import SectionContainer from '@/components/SectionContainer'
import Image from 'next/image'
import ContactForm from '@/components/ContactForm'
import { pages } from '@/data'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>
}) {
  const params = await searchParams
  const defaultSubject = params?.subject || ''

  return (
    <SectionContainer>
      <H1 className="mb-4">{pages.contact.heading}</H1>
      <TextBase className="mb-6">{pages.contact.intro}</TextBase>
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <ContactForm defaultSubject={defaultSubject} />
        <div className="flex flex-col justify-center space-y-4">
          <div className="border-primary-500 flex w-full items-center justify-center rounded border-2 bg-surface-200 text-center text-accent-500">
            <Image
              src="/static/images/service-area.jpg"
              alt="Los Angeles map"
              width={600}
              height={400}
              className="rounded object-cover"
            />
          </div>
          <div>
            <span className="font-semibold">{pages.contact.serviceArea}</span>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
