export function formatDateTime(dateTime?: string): string {
  if (!dateTime) return 'Unknown'
  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
