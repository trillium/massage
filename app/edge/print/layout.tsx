import Link from 'next/link'
import { TextSm } from '@/components/ui/text'

const PRINT_PAGES = [
  { href: '/edge/print/comes-to-you', label: 'Comes to You Ad' },
  { href: '/edge/print/tip', label: 'Tip Page' },
]

export default function EdgePrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="print:hidden flex items-center gap-4 border-b border-surface-200 bg-surface-50 px-4 py-2 text-sm dark:border-surface-700 dark:bg-surface-900">
        <TextSm as="span" status="muted">
          Print pages:
        </TextSm>
        {PRINT_PAGES.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded px-2 py-1 text-primary-600 hover:bg-surface-200 hover:text-primary-700 dark:text-primary-400 dark:hover:bg-surface-800"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  )
}
