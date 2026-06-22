import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { TextSmMedium, TextSmSemibold, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

export function StatusBadge({ status }: { status: 'pending' | 'confirmed' | 'cancelled' }) {
  const config = {
    pending: {
      label: 'Pending Request',
      icon: <FaHourglassHalf className="h-4 w-4" />,
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    confirmed: {
      label: 'Confirmed',
      icon: <FaCheckCircle className="h-4 w-4" />,
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-300 dark:border-green-700',
    },
    cancelled: {
      label: 'Cancelled',
      icon: <FaTimesCircle className="h-4 w-4" />,
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
    },
  }

  const c = config[status]
  return (
    <TextSmSemibold className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${c.bg} ${c.text} ${c.border}">
      {c.icon}
      {c.label}
    </TextSmSemibold>
  )
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="col" className="gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <TextSmMedium className="min-w-24 uppercase">{label}</TextSmMedium>
      <TextLg>{value}</TextLg>
    </Stack>
  )
}
