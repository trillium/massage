import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import { quickLinks } from '@/data/paymentLinks'

export default function QuicklinksPage() {
  return (
    <SectionContainer>
      <div className="flex min-h-[60vh] flex-col items-center py-12">
        <div className="flex w-full max-w-md flex-col gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              classes={`flex items-center gap-4 rounded-2xl border-2 ${link.accent} bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-900`}
            >
              <link.icon className={`shrink-0 text-2xl ${link.iconColor}`} />
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{link.label}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
