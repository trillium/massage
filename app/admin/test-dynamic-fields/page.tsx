'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import BookingForm from '@/components/booking/BookingForm'
import { ChairAppointmentBlockProps } from '@/lib/types'

// Create store instance
const store = makeStore()

// Test configuration with new field flags
const testAdditionalData: Partial<ChairAppointmentBlockProps> = {
  showHotelField: true,
  showParkingField: true,
  showNotesField: true,
}

export default function TestDynamicFieldsPage() {
  const [submittedData, setSubmittedData] = React.useState<Record<
    string,
    FormDataEntryValue
  > | null>(null)

  const mockSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    setSubmittedData(data)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Dynamic Booking Form Test Page</h1>
          <p className="text-gray-600">
            This page demonstrates the booking form with additional specific fields:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Hotel Room Number (required text field)</li>
            <li>• Parking Instructions (select dropdown)</li>
            <li>• Additional Notes (textarea)</li>
          </ul>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Test the Booking Form</h2>
          <p className="mb-6 text-gray-600">
            Click on any available time slot to open the booking modal and see the dynamic fields in
            action.
          </p>

          <Provider store={store}>
            <div className="space-y-4">
              {/* Mock time slots for testing */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  className="rounded-md bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
                  onClick={() => {
                    // Mock Redux state setup for testing
                    store.dispatch({
                      type: 'availability/setSelectedTime',
                      payload: {
                        start: new Date().toISOString(),
                        end: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
                      },
                    })
                    store.dispatch({
                      type: 'availability/setTimeZone',
                      payload: 'America/Los_Angeles',
                    })
                    store.dispatch({
                      type: 'availability/setDuration',
                      payload: 90,
                    })
                    store.dispatch({
                      type: 'modal/setModal',
                      payload: { status: 'open' },
                    })
                  }}
                >
                  9:00 AM
                </button>
                <button
                  className="rounded-md bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
                  onClick={() => {
                    store.dispatch({
                      type: 'availability/setSelectedTime',
                      payload: {
                        start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                        end: new Date(Date.now() + 4.5 * 60 * 60 * 1000).toISOString(),
                      },
                    })
                    store.dispatch({
                      type: 'availability/setTimeZone',
                      payload: 'America/Los_Angeles',
                    })
                    store.dispatch({
                      type: 'availability/setDuration',
                      payload: 90,
                    })
                    store.dispatch({
                      type: 'modal/setModal',
                      payload: { status: 'open' },
                    })
                  }}
                >
                  12:00 PM
                </button>
                <button
                  className="rounded-md bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
                  onClick={() => {
                    store.dispatch({
                      type: 'availability/setSelectedTime',
                      payload: {
                        start: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                        end: new Date(Date.now() + 7.5 * 60 * 60 * 1000).toISOString(),
                      },
                    })
                    store.dispatch({
                      type: 'availability/setTimeZone',
                      payload: 'America/Los_Angeles',
                    })
                    store.dispatch({
                      type: 'availability/setDuration',
                      payload: 90,
                    })
                    store.dispatch({
                      type: 'modal/setModal',
                      payload: { status: 'open' },
                    })
                  }}
                >
                  3:00 PM
                </button>
              </div>
            </div>

            <BookingForm
              additionalData={testAdditionalData}
              acceptingPayment={true}
              onSubmit={mockSubmitHandler}
            />

            {submittedData && (
              <div className="mt-4 rounded-lg bg-gray-100 p-4">
                <h3 className="text-lg font-semibold text-gray-800">Submitted Data</h3>
                <pre className="mt-2 text-sm text-gray-600">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </div>
            )}
          </Provider>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">Implementation Notes</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • The additional fields are controlled via boolean flags: <code>showHotelField</code>,{' '}
              <code>showParkingField</code>, <code>showNotesField</code>
            </p>
            <p>• All form data is stored in Redux state with proper typing</p>
            <p>• Each field type has its own dedicated component</p>
            <p>• The form maintains backward compatibility with existing implementations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
