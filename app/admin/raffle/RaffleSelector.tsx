'use client'

import { useRouter } from 'next/navigation'

interface RaffleSelectorProps {
  raffles: { id: string; name: string; status: string; is_active: boolean }[]
  currentRaffleId: string
}

export function RaffleSelector({ raffles, currentRaffleId }: RaffleSelectorProps) {
  const router = useRouter()

  return (
    <select
      value={currentRaffleId}
      onChange={(e) => router.push(`/admin/raffle?id=${e.target.value}`)}
      className="w-full rounded-md border border-accent-300 px-3 py-2 shadow-sm focus:border-blue-500 dark:border-accent-600 dark:bg-surface-700 dark:text-accent-100"
    >
      {raffles.map((raffle) => (
        <option key={raffle.id} value={raffle.id}>
          {raffle.name} ({raffle.status}){raffle.is_active ? ' (active)' : ''}
        </option>
      ))}
    </select>
  )
}
