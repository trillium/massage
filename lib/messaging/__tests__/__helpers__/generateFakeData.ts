import type { OnSiteRequestType } from '../../../types'

export function generateFakeOnSiteRequest(): OnSiteRequestType {
  return {
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-123-4567',
    email: 'john.doe@example.com',
    location: {
      street: '123 Main St',
      city: 'Anytown',
      zip: '12345',
    },
    paymentMethod: 'cash',
    start: '2025-01-01T10:00:00Z',
    end: '2025-01-01T11:00:00Z',
    duration: '60',
    price: '100',
    timeZone: 'America/Los_Angeles',
    eventBaseString: '__EVENT__',
    eventContainerString: '__EVENT__CONTAINER__',
    allowedDurations: [60, 90],
    eventName: 'Test Event',
    paymentOptions: 'cash,venmo',
    leadTime: 24,
    instantConfirm: false,
  }
}
