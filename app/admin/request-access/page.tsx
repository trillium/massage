'use client'

import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { AdminAccessRequestSchema } from '@/lib/schema'
import SectionContainer from '@/components/SectionContainer'

interface FormValues {
  email: string
  requestReason: string
}

// Manual validation function that works better with current setup
const validateForm = (values: FormValues) => {
  const result = AdminAccessRequestSchema.safeParse(values)

  if (result.success) {
    return {}
  }

  const errors: Partial<FormValues> = {}
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.') as keyof FormValues
    if (path in values) {
      errors[path] = issue.message
    }
  })

  return errors
}

export default function AdminAccessRequestPage() {
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error'
    message?: string
  }>({ type: 'idle' })

  const handleSubmit = async (values: FormValues) => {
    setSubmitStatus({ type: 'loading' })

    try {
      const response = await fetch('/api/admin/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Admin access link sent successfully!',
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send admin access link',
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      })
    }
  }

  return (
    <SectionContainer>
      <div className="mx-auto max-w-2xl py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Request Admin Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit your email to receive a secure admin access link
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <Formik
            initialValues={{
              email: '',
              requestReason: '',
            }}
            validate={validateForm}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="your.email@example.com"
                    disabled={isSubmitting || submitStatus.type === 'loading'}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="requestReason"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Reason for Access
                  </label>
                  <Field
                    as="textarea"
                    id="requestReason"
                    name="requestReason"
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Please describe why you need admin access..."
                    disabled={isSubmitting || submitStatus.type === 'loading'}
                  />
                  <ErrorMessage
                    name="requestReason"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus.type === 'loading'}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {submitStatus.type === 'loading' ? (
                    <>
                      <svg
                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Request Admin Access'
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Status Messages */}
          {submitStatus.type === 'success' && (
            <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Success!</p>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                    {submitStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitStatus.type === 'error' && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {submitStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Security Information
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>Only authorized admin emails will receive access links</li>
                  <li>Access links expire after 4 hours</li>
                  <li>Each access attempt is logged for security</li>
                  <li>Rate limiting prevents abuse</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
