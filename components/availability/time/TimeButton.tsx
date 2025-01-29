import clsx from 'clsx'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

import { formatLocalTime } from 'lib/availability/helpers'
import type { StringDateTimeInterval } from 'lib/types'

import { setSelectedTime } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { clearEventContainers, setEventContainers } from '@/redux/slices/eventContainersSlice'

type TimeProps = {
  time: StringDateTimeInterval
  active: boolean
} & { location?: string } & DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function TimeButton({
  time: { start, end },
  active,
  location,
  ...props
}: TimeProps) {
  const { timeZone } = useReduxAvailability()
  const dispatchRedux = useAppDispatch()

  return (
    <button
      type="button"
      className={clsx(
        'rounded-md border border-slate-300 px-3 py-2 shadow-sm transition-all',
        'text-sm text-gray-900',
        'hocus:bg-primary-50/20 hocus:shadow-sm hocus:shadow-primary-100 hocus:border-primary-500 dark:hocus:text-gray-200',
        'outline-primary-600 active:-mb-0.5  active:mt-0.5',
        {
          'bg-primary-500 font-bold text-white': active,
          'bg-white font-semibold text-gray-900': !active,
        }
      )}
      onClick={() => {
        dispatchRedux(
          setSelectedTime({
            start: start,
            end: end,
          })
        )
        if (location) {
          dispatchRedux(setEventContainers({ location: location || '' }))
        } else {
          dispatchRedux(clearEventContainers())
        }
        dispatchRedux(setModal({ status: 'open' }))
      }}
      {...props}
    >
      {formatLocalTime(start, { timeZone })} – {formatLocalTime(end, { timeZone })}
    </button>
  )
}
