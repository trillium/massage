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
import pages from '@/data/pages.json'
import { changelog, type ChangelogIcon, type ChangelogCategory } from './changelog.list'
import { buildQuarters, type QuarterGroup } from './buildQuarters'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextLgMuted, TextSmMuted, TextSmSemibold, TextXsMuted,
  TextXs,
} from '@/components/ui/text'

const iconMap: Record<ChangelogIcon, React.ReactNode> = {
  calendar: <FaCalendarCheck className="text-primary-500" />,
  shield: <FaShieldAlt className="text-red-500" />,
  bolt: <FaBolt className="text-yellow-500" />,
  paint: <FaPaintBrush className="text-purple-500" />,
  tools: <FaTools className="text-accent-500" />,
  bell: <FaBell className="text-amber-500" />,
  map: <FaMapMarkerAlt className="text-blue-500" />,
  images: <FaImages className="text-primary-500" />,
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
        <TextXs className="mb-2 text-xs font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
          {pages.changelog.header.highlights}
        </TextXs>
        <ul className="space-y-1">
          {highlights.map((h) => (
            <li key={h} className="text-sm font-medium text-accent-800 dark:text-accent-200">
              {pages.changelog.symbols.bullet}
              {h}
            </li>
          ))}
        </ul>
      </div>
      {categories.map((cat) => (
        <div
          key={cat.label}
          className="border border-t-0 border-accent-200 p-4 last:rounded-b-lg dark:border-accent-700"
        >
          <H3 className="mb-3 flex items-center gap-2">
            {iconMap[cat.icon]}
            {cat.label}
          </H3>
          <ul className="space-y-1.5">
            {cat.items.map((item) => (
              <li
                key={item}
                className="text-sm leading-relaxed text-accent-600 dark:text-accent-400"
              >
                {pages.changelog.symbols.bullet}
                {item}
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
              <H2>{quarter.label}</H2>
              <TextSmMuted>{quarter.dateRange}</TextSmMuted>
              <TextXsMuted>
                {quarter.commitCount} {pages.changelog.labels.commits}
              </TextXsMuted>
              <ChevronUpIcon
                className={`${open ? '' : 'rotate-180'} ml-auto h-5 w-5 text-accent-400 transition-transform`}
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
                  <TextXsMuted className="mb-4">
                    {pages.changelog.labels.repos} {quarter.repos.join(', ')}
                  </TextXsMuted>
                )}

                {quarter.months ? (
                  <div className="space-y-10">
                    {quarter.months.map((month) => (
                      <div key={month.date}>
                        <div className="mb-4 flex items-baseline gap-3">
                          <H3>
                            {new Date(`${month.date}-15`).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </H3>
                          <TextXsMuted>
                            {month.commitCount} {pages.changelog.labels.commits}
                          </TextXsMuted>
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
          <TextSmSemibold className="mb-2 uppercase">{pages.changelog.header.label}</TextSmSemibold>
          <H1 className="mb-4">{pages.changelog.header.title}</H1>
          <TextLgMuted className="mx-auto max-w-2xl">
            {pages.changelog.header.description}
          </TextLgMuted>
        </div>

        <div className="space-y-16">
          {quarters.map((q, i) => (
            <QuarterSection key={q.label} quarter={q} defaultOpen={i === 0} />
          ))}
        </div>

        <TextXsMuted className="mt-16 text-center">
          {pages.changelog.footer
            .replace('{commits}', totalCommits.toLocaleString())
            .replace('{dateRange}', dateRange)}
        </TextXsMuted>
      </div>
    </SectionContainer>
  )
}
