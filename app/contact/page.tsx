import SectionContainer from '@/components/SectionContainer'
import Image from 'next/image'
import ContactForm from '@/components/ContactForm'

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>
}) {
  const params = await searchParams
  const defaultSubject = params?.subject || ''

  return (
    <SectionContainer>
      <h1 className="mb-4 text-3xl font-bold">Contact Us</h1>
      <p className="mb-6">Thanks for reaching out! Happy to answer any questions you have :)</p>
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <ContactForm defaultSubject={defaultSubject} />
        <div className="flex flex-col justify-center space-y-4">
          <div className="border-primary-500 flex w-full items-center justify-center rounded border-2 bg-gray-200 text-center text-gray-500">
            <Image
              src="/static/images/foo/service-area.jpg"
              alt="Los Angeles map"
              width={600}
              height={400}
              className="rounded object-cover"
            />
          </div>
          <div>
            <span className="font-semibold">Serving the LA Metro Area</span>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
