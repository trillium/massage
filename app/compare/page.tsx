import SectionContainer from '@/components/SectionContainer'
import { FaCheck, FaTimes, FaStar } from 'react-icons/fa'
import { siteConfig } from '@/lib/siteConfig'
import compareData from '@/data/compare.json'

const Check = () => <FaCheck className="text-lg text-emerald-600 dark:text-emerald-400" />
const Cross = () => <FaTimes className="text-lg text-accent-300 dark:text-accent-600" />

interface SoonProps {
  label: string
}

const Soon = ({ label }: SoonProps) => (
  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{label}</span>
)
const Star = () => <FaStar className="text-lg text-amber-500" />

type CellValue = 'yes' | 'no' | 'soon'
type Platform = { name: string; category: string; price: string; features: CellValue[] }

const platforms: Platform[] = compareData.platforms.map((p) =>
  p.name === 'MASSAGE_BUSINESS_NAME' ? { ...p, name: siteConfig.business.name } : p
) as Platform[]

const cellBase = 'px-2 py-2 text-sm'
const headerCell = `${cellBase} text-left font-medium text-accent-500 dark:text-accent-400`
const CellIcon = ({ v }: { v: CellValue }) =>
  v === 'yes' ? <Check /> : v === 'soon' ? <Soon label="Soon" /> : <Cross />

export default function Page() {
  return (
    <SectionContainer>
      <div className="py-12">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            {compareData.pageLabel}
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-accent-900 dark:text-accent-100">
            {compareData.pageTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-accent-600 dark:text-accent-400">
            {compareData.pageDescription}
          </p>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-accent-900 dark:text-accent-100">
          {compareData.whereWeLeadHeading}
        </h2>
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compareData.advantages.map((a) => (
            <div
              key={a.title}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <h3 className="mb-1 font-semibold text-accent-900 dark:text-accent-100">{a.title}</h3>
              <p className="text-sm text-accent-600 dark:text-accent-400">{a.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-accent-900 dark:text-accent-100">
          {compareData.whereWeCatchingUpHeading}
        </h2>
        <p className="mb-4 text-sm text-accent-600 dark:text-accent-400">
          {compareData.whereWeCatchingUpSubtext}
        </p>
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compareData.roadmap.map((r) => (
            <div
              key={r.feature}
              className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20"
            >
              <h3 className="mb-1 font-semibold text-accent-900 dark:text-accent-100">
                <Soon label="Soon" /> <span className="ml-1">{r.feature}</span>
              </h3>
              <p className="text-sm text-accent-600 dark:text-accent-400">{r.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-accent-900 dark:text-accent-100">
          {compareData.fullFeatureGridHeading}
        </h2>
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-accent-200 dark:border-accent-700">
                <th className={headerCell}>{compareData.platformColumnHeader}</th>
                <th className={headerCell}>{compareData.priceColumnHeader}</th>
                {compareData.featureLabels.map((f) => (
                  <th key={f} className={`${headerCell} text-center`} title={f}>
                    <span className="hidden xl:inline">{f}</span>
                    <span className="xl:hidden">{f.split(' ')[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platforms.map((p, i) => {
                const isUs = i === 0
                const rowClass = isUs
                  ? 'bg-primary-50/60 dark:bg-primary-950/30 font-medium'
                  : i % 2 === 1
                    ? 'bg-surface-100/50 dark:bg-surface-800/30'
                    : ''
                return (
                  <tr
                    key={p.name}
                    className={`border-b border-accent-100 dark:border-accent-800 ${rowClass}`}
                  >
                    <td className={`${cellBase} font-medium text-accent-900 dark:text-accent-100`}>
                      {isUs && <Star />} {p.name}
                    </td>
                    <td className={`${cellBase} text-accent-600 dark:text-accent-400`}>
                      {p.price}
                    </td>
                    {p.features.map((v, fi) => (
                      <td key={fi} className={`${cellBase} text-center`}>
                        <CellIcon v={v} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-14 rounded-lg bg-surface-100 p-8 dark:bg-surface-800/50">
          <h2 className="mb-3 text-xl font-bold text-accent-900 dark:text-accent-100">
            {compareData.honestTakeHeading}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-accent-600 dark:text-accent-400">
            <p>{compareData.honestTakeParagraph1}</p>
            <p>{compareData.honestTakeParagraph2}</p>
            <p>
              {compareData.honestTakeParagraph3.replace('<Soon />', '')}
              <Soon label="Soon" />
              {compareData.honestTakeParagraph3.split('<Soon />')[1] || ''}
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-accent-400 dark:text-accent-600">
          {compareData.dataSourceAttribution}
        </p>
      </div>
    </SectionContainer>
  )
}
