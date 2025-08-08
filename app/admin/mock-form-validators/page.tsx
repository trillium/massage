'use client'

import React from 'react'
import BookingForm from 'components/booking/BookingForm'

export default function MockFormValidatorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Form Validation Examples
        </h1>

        <div className="space-y-12">
          {/* Updated BookingForm */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              BookingForm with Formik + Zod Integration
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              The existing BookingForm component has been updated to use Formik for form state
              management and Zod for validation. This provides type-safe form handling with
              real-time validation while keeping all existing field components unchanged.
            </p>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <h3 className="font-medium text-green-800 dark:text-green-200">
                ✅ BookingForm Updated Successfully
              </h3>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                The BookingForm now uses Formik + Zod while maintaining compatibility with all
                existing field components. You can test it by triggering the booking modal in the
                main application.
              </p>
            </div>
          </section>

          {/* Implementation Notes */}
          <section className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              Implementation Highlights
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Zod Schema Benefits
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Automatic TypeScript type generation</li>
                  <li>• Rich validation rules (regex, min/max, custom)</li>
                  <li>• Composable and reusable schemas</li>
                  <li>• Server-side validation compatibility</li>
                  <li>• Excellent error messages</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Formik Integration Benefits
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Seamless form state management</li>
                  <li>• Real-time validation feedback</li>
                  <li>• Touch/blur/change event handling</li>
                  <li>• Automatic error message display</li>
                  <li>• Form submission handling</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
                Key Integration Pattern Used
              </h4>
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
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              Updated Files
            </h3>
            <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
              <p>📁 components/booking/BookingForm.tsx (✅ Updated with Formik + Zod)</p>
              <p>📁 components/booking/fields/validations/locationValidation.ts</p>
              <p>📁 docs/FORMIK_ZOD_GUIDE.md</p>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">What Changed:</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
  )
}
