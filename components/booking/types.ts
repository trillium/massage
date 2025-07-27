import { PaymentMethodType } from 'lib/types'

/**
 * Represents form data from the booking form
 */
export type BookingFormData = {
  /** firstName of the requester */
  firstName?: string
  /** lastName of the requester */
  lastName?: string
  /** Email address of the requester */
  email?: string
  /** Address of the requester */
  location?: string
  /** City of the requester */
  city?: string
  /** Zip code of the requester */
  zipCode?: string
  /** Phone number of the requester */
  phone?: string
  /** Payment method of the requester */
  paymentMethod?: PaymentMethodType
}
