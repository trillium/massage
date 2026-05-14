export interface RaffleFormProps {
  raffleId: string
  raffleName: string
}

export interface FormValues {
  name: string
  email: string
  phone: string
  zip_code: string
  interested_in: string[]
}

export const validate = (values: FormValues) => {
  const errors: Partial<Record<keyof FormValues, string>> = {}

  if (!values.name.trim()) errors.name = 'Please enter your name'
  if (!values.email.trim()) errors.email = 'Please enter your email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "That doesn't look quite right"
  if (!values.phone.trim()) errors.phone = 'Please enter a phone number'
  if (!values.zip_code.trim()) errors.zip_code = 'Please enter a zip code'
  if (values.interested_in.length === 0) errors.interested_in = 'Please select at least one'

  return errors
}

export const inputClasses =
  'focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2'

export const labelClasses = 'block text-sm font-medium text-accent-900 dark:text-accent-100'

export const checkboxClasses =
  'h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500'
