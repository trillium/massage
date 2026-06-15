'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import BookingForm from '@/components/booking/BookingForm'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import { ChairAppointmentBlockProps } from '@/lib/types'
import { H1, H2, H3 } from '@/components/ui/heading'

import { Button } from '@/components/ui/button'
import { Code } from '@/components/ui/code'

import { TextBase } from '@/components/ui/text'

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

  const mockSubmitHandler = (values: Record<string, unknown>) => {
    setSubmittedData(values as Record<string, FormDataEntryValue>)
  }

  return (
    <div className="min-h-screen bg-surface-100 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <H1 className="mb-4">Dynamic Booking Form Test Page</H1>
          <TextBase className="text-accent-600">
            This page demonstrates the booking form with additional specific fields:
          </TextBase>
          <ul className="mt-4 space-y-2 text-sm text-accent-600">
            <li>• Hotel Room Number (required text field)</li>
            <li>• Parking Instructions (select dropdown)</li>
            <li>• Additional Notes (textarea)</li>
          </ul>
        </div>

        <div className="rounded-lg bg-surface-50 p-6 shadow-lg">
          <H2 className="mb-4">Test the Booking Form</H2>
          <TextBase className="mb-6 text-accent-600">
            Click on any available time slot to open the booking modal and see the dynamic fields in
            action.
          </TextBase>

          <Provider store={store}>
            <div className="space-y-4">
              {/* Mock time slots for testing */}
              <div className="grid grid-cols-3 gap-4">
                <Button
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
                </Button>
                <Button
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
                </Button>
                <Button
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
                </Button>
              </div>
            </div>

            <SlotHoldProvider>
              <BookingForm
                additionalData={testAdditionalData}
                acceptingPayment={true}
                onSubmit={mockSubmitHandler}
              />
            </SlotHoldProvider>

            {submittedData && (
              <div className="mt-4 rounded-lg bg-surface-200 p-4">
                <H3>Submitted Data</H3>
                <pre className="mt-2 text-sm text-accent-600">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </div>
            )}
          </Provider>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <H3 className="mb-2" status="info">
            Implementation Notes
          </H3>
          <div className="space-y-2 text-sm text-blue-800">
            <TextBase>
              • The additional fields are controlled via boolean flags: <Code>showHotelField</Code>,{' '}
              <Code>showParkingField</Code>, <Code>showNotesField</Code>
            </TextBase>
            <TextBase>• All form data is stored in Redux state with proper typing</TextBase>
            <TextBase>• Each field type has its own dedicated component</TextBase>
            <TextBase>• The form maintains backward compatibility with existing implementations</TextBase>
          </div>
        </div>
      </div>
    </div>
  )
}
