'use client'

import { Transition } from '@headlessui/react'
import { RAFFLE_INTEREST_OPTIONS } from '@/lib/schema'
import { fieldClasses } from './classes'
import { TextSmSemibold, TextXsMuted,
  TextBase,
} from '@/components/ui/text'

import { Input } from '@/components/ui/input'

type RaffleOptInFieldProps = {
  optIn: boolean
  zipCode: string
  interestedIn: string[]
  onChange: (field: string, value: unknown) => void
}

export default function RaffleOptInField({
  optIn,
  zipCode,
  interestedIn,
  onChange,
}: RaffleOptInFieldProps) {
  return (
    <div className="rounded-md border-2 border-primary-200 bg-primary-50 p-3 dark:border-primary-800 dark:bg-primary-950/30">
      <div className="flex items-start gap-3">
        <Input
          type="checkbox"
          id="raffleOptIn"
          checked={optIn}
          onChange={(e) => onChange('raffleOptIn', e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="raffleOptIn" className="cursor-pointer">
          <TextSmSemibold className="block">Enter me in the raffle</TextSmSemibold>
          <TextXsMuted className="block">
            Win a free massage session — drawing held at the end of the event
          </TextXsMuted>
        </label>
      </div>

      <Transition
        show={optIn}
        enter="transition-opacity ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="mt-4 space-y-4 border-t border-primary-200 pb-3 pt-4 dark:border-primary-700">
          <div>
            <label htmlFor="raffleZipCode" className={fieldClasses.label}>
              Home zip code <span className="text-primary-500">*</span>
            </label>
            <Input
              type="text"
              id="raffleZipCode"
              value={zipCode}
              onChange={(e) => onChange('raffleZipCode', e.target.value)}
              placeholder="90210"
              maxLength={10}
              className="focus:ring-primary-500 focus:border-primary-500 mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <TextBase className={fieldClasses.label}>
              Interested in <span className="text-primary-500">*</span>
            </TextBase>
            <div className="mt-1 space-y-2">
              {RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center">
                  <Input
                    type="checkbox"
                    id={`raffle-interest-${value}`}
                    checked={interestedIn.includes(value)}
                    onChange={() => {
                      const next = interestedIn.includes(value)
                        ? interestedIn.filter((v) => v !== value)
                        : [...interestedIn, value]
                      onChange('raffleInterestedIn', next)
                    }}
                    className="h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor={`raffle-interest-${value}`}
                    className="ms-2 text-sm font-medium text-accent-800 dark:text-accent-100"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}
