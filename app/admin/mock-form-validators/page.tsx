'use client'

import React from 'react'
import SectionContainer from '@/components/SectionContainer'
import { FaCheck, FaFolder } from 'react-icons/fa'
import { H1, H2, H3, H4 } from '@/components/ui/heading'
import { TextSm,
  TextBase,
} from '@/components/ui/text'

export default function MockFormValidatorsPage() {
  return (
    <SectionContainer>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <H1 className="mb-8">Form Validation Examples</H1>

          <div className="space-y-12">
            {/* Updated BookingForm */}
            <section>
              <H2 className="mb-4">BookingForm with Formik + Zod Integration</H2>
              <TextBase className="mb-6 text-accent-600 dark:text-accent-400">
                The existing BookingForm component has been updated to use Formik for form state
                management and Zod for validation. This provides type-safe form handling with
                real-time validation while keeping all existing field components unchanged.
              </TextBase>

              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <H3 status="success">
                  <FaCheck className="mr-1 inline text-green-600" /> BookingForm Updated
                  Successfully
                </H3>
                <TextSm className="mt-2" status="success">
                  The BookingForm now uses Formik + Zod while maintaining compatibility with all
                  existing field components. You can test it by triggering the booking modal in the
                  main application.
                </TextSm>
              </div>
            </section>

            {/* Implementation Notes */}
            <section className="rounded-lg bg-surface-100 p-6 dark:bg-surface-800">
              <H3 className="mb-4">Implementation Highlights</H3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <H4 className="mb-2">Zod Schema Benefits</H4>
                  <ul className="space-y-1 text-sm text-accent-600 dark:text-accent-400">
                    <li>• Automatic TypeScript type generation</li>
                    <li>• Rich validation rules (regex, min/max, custom)</li>
                    <li>• Composable and reusable schemas</li>
                    <li>• Server-side validation compatibility</li>
                    <li>• Excellent error messages</li>
                  </ul>
                </div>

                <div>
                  <H4 className="mb-2">Formik Integration Benefits</H4>
                  <ul className="space-y-1 text-sm text-accent-600 dark:text-accent-400">
                    <li>• Seamless form state management</li>
                    <li>• Real-time validation feedback</li>
                    <li>• Touch/blur/change event handling</li>
                    <li>• Automatic error message display</li>
                    <li>• Form submission handling</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <H4 className="mb-2" status="info">
                  Key Integration Pattern Used
                </H4>
                <pre className="overflow-x-auto text-xs text-blue-700 dark:text-blue-300">
                  {`// 1. Define Zod schema with location validation
const createBookingFormSchema = (config) => {
  return z.object({
    firstName: z.string().min(1, 'First name is required'),
    email: z.string().email('Invalid email address'),
    location: createLocationSchema(config),
    // ... other fields
  })
}

// 2. Convert to Formik validation schema
const validationSchema = toFormikValidationSchema(
  createBookingFormSchema({ cities: ['Playa Vista'] })
)

// 3. Use with existing field components
<Formik validationSchema={validationSchema}>
  {({ values, setFieldValue, errors, touched }) => (
    <Form>
      <NameFields
        firstName={values.firstName}
        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
      />
      {touched.firstName && errors.firstName && (
        <div className="text-red-600">{errors.firstName}</div>
      )}
    </Form>
  )}
</Formik>`}
                </pre>
              </div>
            </section>

            {/* Code Example */}
            <section>
              <H3 className="mb-4">Updated Files</H3>
              <div className="rounded-lg bg-surface-900 p-4 font-mono text-sm text-green-400">
                <TextBase>
                  <FaFolder className="mr-1 inline" /> components/booking/BookingForm.tsx (
                  <FaCheck className="mr-1 inline" /> Updated with Formik + Zod)
                </TextBase>
                <TextBase>
                  <FaFolder className="mr-1 inline" />{' '}
                  components/booking/fields/validations/locationValidation.ts
                </TextBase>
                <TextBase>
                  <FaFolder className="mr-1 inline" /> docs/FORMIK_ZOD_GUIDE.md
                </TextBase>
              </div>

              <div className="mt-4 rounded-lg bg-surface-100 p-4 dark:bg-surface-800">
                <H4 className="mb-2">What Changed:</H4>
                <ul className="space-y-1 text-sm text-accent-600 dark:text-accent-400">
                  <li>• Added Formik for form state management</li>
                  <li>• Added Zod schema validation with type safety</li>
                  <li>• Real-time validation with error display</li>
                  <li>• Kept all existing field components unchanged</li>
                  <li>• Maintained compatibility with existing Redux state</li>
                  <li>• Added proper TypeScript types throughout</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
