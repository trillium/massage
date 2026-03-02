'use client'

import SectionContainer from '@/components/SectionContainer'
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import {
  FaCalendarCheck,
  FaShieldAlt,
  FaBolt,
  FaPaintBrush,
  FaTools,
  FaBell,
  FaMapMarkerAlt,
  FaImages,
  FaCode,
  FaGlobe,
} from 'react-icons/fa'
import { changelog, type ChangelogIcon, type ChangelogCategory } from './changelog.list'
import { buildQuarters, type QuarterGroup } from './buildQuarters'

const iconMap: Record<ChangelogIcon, React.ReactNode> = {
  calendar: <FaCalendarCheck className="text-primary-500" />,
  shield: <FaShieldAlt className="text-red-500" />,
  bolt: <FaBolt className="text-yellow-500" />,
  paint: <FaPaintBrush className="text-purple-500" />,
  tools: <FaTools className="text-gray-500" />,
  bell: <FaBell className="text-amber-500" />,
  map: <FaMapMarkerAlt className="text-blue-500" />,
  images: <FaImages className="text-teal-500" />,
  code: <FaCode className="text-emerald-500" />,
  globe: <FaGlobe className="text-sky-500" />,
}

const quarters = buildQuarters(changelog)
const totalCommits = changelog.reduce((sum, m) => sum + m.commitCount, 0)
const firstDate = new Date(`${changelog[changelog.length - 1].date}-15`)
const lastDate = new Date(`${changelog[0].date}-15`)
const dateRange = `${firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} \u2013 ${lastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

function ConnectedBlock({
  highlights,
  categories,
}: {
  highlights: string[]
  categories: ChangelogCategory[]
}) {
  return (
    <div>
      <div className="rounded-t-lg border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800 dark:bg-primary-950/20">
        <p className="mb-2 text-xs font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
          Highlights
        </p>
        <ul className="space-y-1">
          {highlights.map((h) => (
            <li key={h} className="text-sm font-medium text-gray-800 dark:text-gray-200">
              &bull; {h}
            </li>
          ))}
        </ul>
      </div>
      {categories.map((cat) => (
        <div
          key={cat.label}
          className="border border-t-0 border-gray-200 p-4 last:rounded-b-lg dark:border-gray-700"
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
            {iconMap[cat.icon]}
            {cat.label}
          </h3>
          <ul className="space-y-1.5">
            {cat.items.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                &bull; {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function QuarterSection({
  quarter,
  defaultOpen,
}: {
  quarter: QuarterGroup
  defaultOpen?: boolean
}) {
  return (
    <section id={quarter.label.replace(/\s/g, '-')}>
      <Disclosure as="div" defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-baseline gap-4 text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {quarter.label}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{quarter.dateRange}</span>
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {quarter.commitCount} commits
              </span>
              <ChevronUpIcon
                className={`${open ? '' : 'rotate-180'} ml-auto h-5 w-5 text-gray-400 transition-transform`}
              />
            </DisclosureButton>

            <Transition
              enter="transition duration-150 ease-out"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-100 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-2"
            >
              <DisclosurePanel className="mt-6">
                {quarter.repos.length > 1 && (
                  <p className="mb-4 text-xs text-gray-400 dark:text-gray-600">
                    Repos: {quarter.repos.join(', ')}
                  </p>
                )}

                {quarter.months ? (
                  <div className="space-y-10">
                    {quarter.months.map((month) => (
                      <div key={month.date}>
                        <div className="mb-4 flex items-baseline gap-3">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {new Date(`${month.date}-15`).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </h3>
                          <span className="text-xs text-gray-400 dark:text-gray-600">
                            {month.commitCount} commits
                          </span>
                        </div>
                        <ConnectedBlock
                          highlights={month.highlights}
                          categories={month.categories}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ConnectedBlock highlights={quarter.highlights} categories={quarter.categories} />
                )}
              </DisclosurePanel>
            </Transition>
          </>
        )}
      </Disclosure>
    </section>
  )
}

export default function Page() {
  return (
    <SectionContainer>
      <div className="py-12">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            What&apos;s New
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Changelog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            A timeline of features, fixes, and improvements to the booking platform.
          </p>
        </div>

        <div className="space-y-16">
          {quarters.map((q, i) => (
            <QuarterSection key={q.label} quarter={q} defaultOpen={i === 0} />
          ))}
        </div>

        <p className="mt-16 text-center text-xs text-gray-400 dark:text-gray-600">
          Compiled from {totalCommits.toLocaleString()}+ commits spanning {dateRange}.
        </p>
      </div>
    </SectionContainer>
  )
}
