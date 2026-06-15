'use client'

import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/select'

interface RaffleSelectorProps {
  raffles: { id: string; name: string; status: string; is_active: boolean }[]
  currentRaffleId: string
  basePath?: string
}

export function RaffleSelector({
  raffles,
  currentRaffleId,
  basePath = '/admin/raffle',
}: RaffleSelectorProps) {
  const router = useRouter()

  return (
    <Select
      value={currentRaffleId}
      onChange={(e) => router.push(`${basePath}?id=${e.target.value}`)}
    >
      {raffles.map((raffle) => (
        <option key={raffle.id} value={raffle.id}>
          {`${raffle.name} (${raffle.status})${raffle.is_active ? ' (active)' : ''}`}
        </option>
      ))}
    </Select>
  )
}
