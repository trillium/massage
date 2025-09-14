import { paymentMethod } from '@/data/paymentMethods'

export type PaymentMethodType = (typeof paymentMethod)[number]['value'] | null
