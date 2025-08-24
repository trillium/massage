'use client'

import { useState } from 'react'
import { ContactFormType } from '@/lib/types'

interface ContactFormProps {
  defaultSubject?: string
}

export default function ContactForm({ defaultSubject = '' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Store form reference before async operations
    const formElement = e.currentTarget

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    const formData = new FormData(formElement)
    const contactData: ContactFormType = {
      subject: formData.get('subject') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })

      if (response.ok) {
        const responseData = await response.json()

        setSubmitStatus('success')

        // Reset form using stored reference
        if (formElement) {
          formElement.reset()
          // Reset default subject if it was pre-filled
          if (defaultSubject) {
            const subjectInput = formElement.querySelector('#subject') as HTMLInputElement
            if (subjectInput) {
              subjectInput.value = defaultSubject
            }
          }
        }
      } else {
        try {
          const errorData = await response.json()
          setErrorMessage(errorData.error || 'Failed to send message')
        } catch (parseError) {
          setErrorMessage('Server error - please try again')
        }
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('[ContactForm] Network error:', error)
      setErrorMessage('Network error. Please try again.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border500 border-white-500 focus-within:border-primary-500 flex w-full flex-col items-center space-y-4 rounded-lg border-2 bg-white p-6 shadow-md dark:bg-slate-900"
    >
      {submitStatus === 'success' && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          Thank you! Your message has been sent successfully. We'll shorlty :)
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="w-full">
        <label htmlFor="subject" className="block font-medium">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          defaultValue={defaultSubject}
          className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="w-full">
        <label htmlFor="name" className="block font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="w-full">
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="w-full">
        <label htmlFor="phone" className="block font-medium">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          required
          className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="w-full">
        <label htmlFor="message" className="block font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary-600 hover:bg-primary-700 border-primary-500 rounded border-2 px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
