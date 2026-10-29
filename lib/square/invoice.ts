import type { Currency } from 'square'
import { getSquareClient, getSquareLocationId } from './client'

interface BookingData {
  bookingId: string
  clientEmail: string
  clientFirstName: string
  clientLastName: string
  serviceName: string
  amountCents: number
  currency: string
  dueDate: string
}

export interface InvoiceResult {
  invoiceId: string
  invoiceUrl: string
  invoiceNumber: string
  status: string
  version: number
  orderId: string
  customerId: string
}

export async function createAndPublishInvoice(
  booking: BookingData,
  idempotencyKey: string
): Promise<InvoiceResult> {
  const client = getSquareClient()
  const locationId = getSquareLocationId()

  const customerId = await upsertSquareCustomer(client, booking)

  const orderId = await createSquareOrder(client, locationId, booking, `${idempotencyKey}:order`)

  const { invoiceId, version } = await createSquareDraftInvoice(
    client,
    locationId,
    orderId,
    customerId,
    booking,
    `${idempotencyKey}:invoice`
  )

  const published = await publishSquareInvoice(
    client,
    invoiceId,
    version,
    `${idempotencyKey}:publish`
  )

  return {
    invoiceId: published.invoiceId,
    invoiceUrl: published.publicUrl,
    invoiceNumber: published.invoiceNumber,
    status: published.status,
    version: published.version,
    orderId,
    customerId,
  }
}

async function upsertSquareCustomer(
  client: ReturnType<typeof getSquareClient>,
  booking: BookingData
): Promise<string> {
  const searchResult = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: booking.clientEmail },
      },
    },
  })

  if (searchResult.customers && searchResult.customers.length > 0) {
    return searchResult.customers[0].id!
  }

  const createResult = await client.customers.create({
    emailAddress: booking.clientEmail,
    givenName: booking.clientFirstName,
    familyName: booking.clientLastName,
  })

  return createResult.customer!.id!
}

async function createSquareOrder(
  client: ReturnType<typeof getSquareClient>,
  locationId: string,
  booking: BookingData,
  idempotencyKey: string
): Promise<string> {
  const result = await client.orders.create({
    idempotencyKey,
    order: {
      locationId,
      lineItems: [
        {
          name: booking.serviceName,
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(booking.amountCents),
            currency: booking.currency as Currency,
          },
        },
      ],
      referenceId: booking.bookingId,
    },
  })

  return result.order!.id!
}

async function createSquareDraftInvoice(
  client: ReturnType<typeof getSquareClient>,
  locationId: string,
  orderId: string,
  customerId: string,
  booking: BookingData,
  idempotencyKey: string
): Promise<{ invoiceId: string; version: number }> {
  const result = await client.invoices.create({
    idempotencyKey,
    invoice: {
      locationId,
      orderId,
      primaryRecipient: { customerId },
      deliveryMethod: 'EMAIL',
      paymentRequests: [
        {
          requestType: 'BALANCE',
          dueDate: booking.dueDate,
          automaticPaymentSource: 'NONE',
        },
      ],
      acceptedPaymentMethods: { card: true },
      title: booking.serviceName,
    },
  })

  return {
    invoiceId: result.invoice!.id!,
    version: result.invoice!.version!,
  }
}

async function publishSquareInvoice(
  client: ReturnType<typeof getSquareClient>,
  invoiceId: string,
  version: number,
  idempotencyKey: string
): Promise<{
  invoiceId: string
  publicUrl: string
  invoiceNumber: string
  status: string
  version: number
}> {
  const result = await client.invoices.publish({
    invoiceId,
    idempotencyKey,
    version,
  })

  const invoice = result.invoice!
  return {
    invoiceId: invoice.id!,
    publicUrl: invoice.publicUrl!,
    invoiceNumber: invoice.invoiceNumber!,
    status: invoice.status!,
    version: invoice.version ?? 0,
  }
}
