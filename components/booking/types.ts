import { PaymentMethodType, LocationObject } from 'lib/types'

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
  /** Location object with street, city, and zip */
  location?: LocationObject
  /** Location as formatted string */
  locationString?: string
  /** City of the requester */
  city?: string
  /** Zip code of the requester */
  zipCode?: string
  /** Phone number of the requester */
  phone?: string
  /** Payment method of the requester */
  paymentMethod?: PaymentMethodType
  /** Hotel room number */
  hotelRoomNumber?: string
  /** Parking instructions */
  parkingInstructions?: string
  /** Additional notes */
  additionalNotes?: string
}
