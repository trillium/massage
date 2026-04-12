'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SectionContainer from '@/components/SectionContainer'
import Link from 'next/link'
import { useReduxContactForm } from '@/redux/hooks'

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
          <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>
          <p className="mb-8 text-surface-600 dark:text-surface-400">
            We couldn't confirm your submission. Please try again.
          </p>
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
        <h1 className="mb-4 text-3xl font-bold">Message Received!</h1>
        {hasFormData ? (
          <>
            <p className="mb-2 text-lg">
              Thank you, {contactForm.name}. We've received your message and sent a confirmation to{' '}
              <span className="font-semibold">{contactForm.email}</span>.
            </p>
            <p className="mb-6 text-surface-600 dark:text-surface-400">
              We'll get back to you as soon as possible.
            </p>
            <div className="mb-8 w-full max-w-lg rounded-lg border-2 border-surface-200 bg-surface-50 text-left shadow-md dark:border-surface-700 dark:bg-surface-900">
              <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
                <p className="text-sm text-surface-500 dark:text-surface-400">Subject</p>
                <p className="font-semibold">{contactForm.subject}</p>
              </div>
              <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
                <p className="text-sm text-surface-500 dark:text-surface-400">From</p>
                <p>
                  {contactForm.name} · {contactForm.email} · {contactForm.phone}
                </p>
              </div>
              <div className="px-5 py-3">
                <p className="mb-1 text-sm text-surface-500 dark:text-surface-400">Message</p>
                <p className="whitespace-pre-wrap">{contactForm.message}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="mb-8 text-lg">
            Your message has been received. A confirmation email is on its way.
          </p>
        )}
        <p className="mb-6 text-xs text-surface-400">Confirmation: {confirmationId}</p>
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
