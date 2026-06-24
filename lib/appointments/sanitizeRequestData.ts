import { z } from 'zod'
import type { AppointmentRequestSchema } from '../schema'
import { escapeHtml } from '../messaging/escapeHtml'
import { flattenLocation } from '../helpers/locationHelpers'

type AppointmentRequestData = z.output<typeof AppointmentRequestSchema>

export type SafeAppointmentData = {
  firstName: string
  lastName: string
  phone: string
  telegramHandle: string
  email: string
  promo: string | undefined
  timeZone: string
}

export type SafeExtraFields = {
  hotelRoomNumber: string | undefined
  parkingInstructions: string | undefined
  additionalNotes: string | undefined
}

export function sanitizeAppointmentData(data: AppointmentRequestData): {
  safeData: SafeAppointmentData
  safeLocation: string
  safeExtraFields: SafeExtraFields
} {
  const safeLocation = escapeHtml(flattenLocation(data.locationObject || data.locationString || ''))

  const safeData: SafeAppointmentData = {
    firstName: escapeHtml(data.firstName),
    lastName: escapeHtml(data.lastName),
    phone: escapeHtml(data.phone),
    telegramHandle: data.telegramHandle ? escapeHtml(data.telegramHandle) : data.telegramHandle,
    email: escapeHtml(data.email),
    promo: data.promo ? escapeHtml(data.promo) : data.promo,
    timeZone: escapeHtml(data.timeZone),
  }

  const safeExtraFields: SafeExtraFields = {
    hotelRoomNumber: data.hotelRoomNumber ? escapeHtml(data.hotelRoomNumber) : data.hotelRoomNumber,
    parkingInstructions: data.parkingInstructions
      ? escapeHtml(data.parkingInstructions)
      : data.parkingInstructions,
    additionalNotes: data.additionalNotes ? escapeHtml(data.additionalNotes) : data.additionalNotes,
  }

  return { safeData, safeLocation, safeExtraFields }
}
