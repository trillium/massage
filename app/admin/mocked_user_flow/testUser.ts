import { PaymentMethodType, LocationObject } from '@/lib/types'

export const testUser = {
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bobsmith@example.com',
  phone: '555-444-3333',
  location: {
    street: '123 Fake St',
    city: 'Torrance',
    zip: '99999',
  } as LocationObject,
  paymentMethod: 'cash' as PaymentMethodType,
}
