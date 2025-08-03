import { PaymentMethodType } from '@/lib/types'

export const testUser = {
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bobsmith@example.com',
  phone: '555-444-3333',
  location: '123 Fake St',
  city: 'Torrance',
  zipCode: '99999',
  paymentMethod: 'cash' as PaymentMethodType,
}
