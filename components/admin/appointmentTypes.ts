export interface Appointment {
  id: string
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  status: string
  promo: string | null
  location: string | null
  admin_notes?: string | null
  created_at: string
}

export const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}
