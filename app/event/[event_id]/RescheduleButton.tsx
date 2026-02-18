import Link from '@/components/Link'

export default function RescheduleButton({ rescheduleUrl }: { rescheduleUrl: string }) {
  return (
    <Link
      href={rescheduleUrl}
      className="rounded-lg border border-primary-300 px-5 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20"
    >
      Reschedule
    </Link>
  )
}
