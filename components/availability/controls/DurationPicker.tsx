'use client'

import clsx from 'clsx'

import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING } from 'config'
import { setDuration } from '@/redux/slices/availabilitySlice'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxConfig,
  useReduxEdgeRole,
} from '@/redux/hooks'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import { TextSm } from '@/components/ui/text'
import type { durationPropsType } from '@/lib/types'

import { PeerRadio } from '@/components/ui/peer-radio'
import { Box } from '@/components/ui/box'

export default function DurationPicker({
  allowedDurations: allowedDurationsProps,
  price: priceProps,
  duration: durationProps,
  configuration,
  showPrice = true,
}: durationPropsType) {
  const {
    pricing: priceRedux,
    allowedDurations: allowedDurationsRedux,
    customFields,
  } = useReduxConfig()
  const { duration: durationRedux } = useReduxAvailability()
  const edgeRole = useReduxEdgeRole()
  const dispatch = useAppDispatch()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDuration(Number(event.target.value)))
  }

  const duration = durationRedux || durationProps || DEFAULT_DURATION
  const allowedDurations = allowedDurationsRedux || allowedDurationsProps || ALLOWED_DURATIONS
  const price = priceRedux || priceProps || DEFAULT_PRICING
  const sessionCost = price[duration || DEFAULT_DURATION] ?? ''
  const roleBonus = edgeRole ? (customFields?.roleBonus?.[edgeRole] ?? 0) : 0
  const effectiveDuration = (duration || DEFAULT_DURATION) + roleBonus
  const rawRoleHint =
    edgeRole && customFields?.roleHints ? customFields.roleHints[edgeRole] : undefined
  const roleHint = rawRoleHint
    ? typeof rawRoleHint === 'string'
      ? rawRoleHint
      : (rawRoleHint[duration || DEFAULT_DURATION] ??
        rawRoleHint[Math.min(...Object.keys(rawRoleHint).map(Number))])
    : undefined
  const pricingLabel = roleHint ?? configuration?.pricingLabels?.[duration || DEFAULT_DURATION]
  const hidePricing = configuration?.acceptingPayment === false

  const cols = 3
  const useGrid = allowedDurations.length > 4

  return (
    <fieldset>
      <legend className="block pb-2 text-sm leading-5 font-medium text-accent-900 dark:text-accent-100">
        <span>
          {`${effectiveDuration} minute session`}
          {roleBonus > 0 ? ` (+${roleBonus} min bonus)` : ''}
          {pricingLabel ? ',' : ''}
        </span>{' '}
        {pricingLabel ? (
          <TextSm as="span" status="primary">
            {pricingLabel}
          </TextSm>
        ) : (
          !hidePricing &&
          showPrice && <GeneratePrice price={sessionCost} discount={configuration?.discount} />
        )}
      </legend>
      <Box
        className={clsx(
          'isolate mt-1 overflow-hidden rounded-lg border border-accent-200 bg-surface-50 shadow-sm dark:border-accent-700 dark:bg-surface-800',
          useGrid ? 'grid grid-cols-3 max-w-sm sm:inline-flex' : 'inline-flex'
        )}
      >
        {allowedDurations.map((theDuration, i) => (
          <Box key={theDuration}>
            <PeerRadio
              id={`duration-${theDuration}`}
              name="duration"
              value={theDuration}
              checked={duration === theDuration}
              onChange={handleChange}
              className="peer sr-only"
            />
            <label
              htmlFor={`duration-${theDuration}`}
              className={clsx(
                'relative flex cursor-pointer items-center justify-center px-3 py-2.5 text-sm font-semibold transition-colors duration-150',
                'peer-focus-visible:z-10 peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-primary-500',
                useGrid
                  ? {
                      'border-b border-accent-200 dark:border-accent-700 sm:border-b-0':
                        i < allowedDurations.length - (allowedDurations.length % cols || cols),
                      'border-r border-accent-200 dark:border-accent-700':
                        (i + 1) % cols !== 0 && i < allowedDurations.length - 1,
                      'sm:border-r sm:border-accent-200 sm:dark:border-accent-700':
                        i < allowedDurations.length - 1 && (i + 1) % cols === 0,
                    }
                  : {
                      'border-r border-accent-200 dark:border-accent-700':
                        i < allowedDurations.length - 1,
                    },
                theDuration === duration
                  ? 'bg-primary-500 text-white shadow-inner'
                  : 'bg-surface-50 text-accent-900 hocus:bg-surface-200 dark:bg-surface-800 dark:text-accent-100 dark:hocus:bg-surface-700'
              )}
            >
              {theDuration}m
            </label>
          </Box>
        ))}
      </Box>
    </fieldset>
  )
}
