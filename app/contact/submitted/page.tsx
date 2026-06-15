'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SectionContainer from '@/components/SectionContainer'
import Link from 'next/link'
import { useReduxContactForm } from '@/redux/hooks'
import { H1 } from '@/components/ui/heading'
import { Caption, TextLg, TextSmMuted,
  TextBase,
} from '@/components/ui/text'

export default function ContactSubmittedPage() {
  return (
    <Suspense>
      <ContactSubmittedContent />
    </Suspense>
  )
}

function ContactSubmittedContent() {
  const searchParams = useSearchParams()
  const confirmationId = searchParams.get('ref')
  const contactForm = useReduxContactForm()
  const hasFormData = contactForm.email !== ''

  if (!confirmationId) {
    return (
      <SectionContainer>
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <H1 className="mb-4">Something went wrong</H1>
          <TextBase className="mb-8 text-surface-600 dark:text-surface-400">
            We couldn't confirm your submission. Please try again.
          </TextBase>
          <Link
            href="/contact"
            className="bg-primary-600 hover:bg-primary-700 rounded px-6 py-2 font-semibold text-white transition-colors"
          >
            Back to Contact
          </Link>
        </div>
      </SectionContainer>
    )
  }

  return (
    <SectionContainer>
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <H1 className="mb-4">Message Received!</H1>
        {hasFormData ? (
          <>
            <TextLg className="mb-2">
              Thank you, {contactForm.name}. We've received your message and sent a confirmation to{' '}
              <span className="font-semibold">{contactForm.email}</span>.
            </TextLg>
            <TextBase className="mb-6 text-surface-600 dark:text-surface-400">
              We'll get back to you as soon as possible.
            </TextBase>
            <div className="mb-8 w-full max-w-lg rounded-lg border-2 border-surface-200 bg-surface-50 text-left shadow-md dark:border-surface-700 dark:bg-surface-900">
              <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
                <TextSmMuted>Subject</TextSmMuted>
                <TextBase className="font-semibold">{contactForm.subject}</TextBase>
              </div>
              <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
                <TextSmMuted>From</TextSmMuted>
                <TextBase>
                  {contactForm.name} · {contactForm.email} · {contactForm.phone}
                </TextBase>
              </div>
              <div className="px-5 py-3">
                <TextSmMuted className="mb-1">Message</TextSmMuted>
                <TextBase className="whitespace-pre-wrap">{contactForm.message}</TextBase>
              </div>
            </div>
          </>
        ) : (
          <TextLg className="mb-8">
            Your message has been received. A confirmation email is on its way.
          </TextLg>
        )}
        <Caption className="mb-6">Confirmation: {confirmationId}</Caption>
        <Link
          href="/"
          className="bg-primary-600 hover:bg-primary-700 rounded px-6 py-2 font-semibold text-white transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </SectionContainer>
  )
}
