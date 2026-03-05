import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import { FaInstagram, FaEnvelope, FaCalendarAlt, FaDollarSign } from 'react-icons/fa'
import { SiVenmo, SiCashapp } from 'react-icons/si'

const links = [
  {
    label: 'Book a Session',
    href: '/book',
    icon: FaCalendarAlt,
    description: 'Schedule your in-home massage',
    accent: 'border-primary-400 dark:border-primary-600',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  {
    label: 'Venmo',
    href: 'https://venmo.com/TrilliumSmith',
    icon: SiVenmo,
    description: '@TrilliumSmith \u00b7 last 4: 5344',
    accent: 'border-blue-400 dark:border-blue-600',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'CashApp',
    href: 'https://cash.app/$trilliummassage',
    icon: SiCashapp,
    description: '$trilliummassage',
    accent: 'border-emerald-400 dark:border-emerald-600',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: FaDollarSign,
    description: 'Session rates and details',
    accent: 'border-amber-400 dark:border-amber-600',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/trilliummassage',
    icon: FaInstagram,
    description: '@trilliummassage',
    accent: 'border-pink-400 dark:border-pink-600',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    label: 'Email',
    href: 'mailto:trilliummassagela@gmail.com',
    icon: FaEnvelope,
    description: 'trilliummassagela@gmail.com',
    accent: 'border-gray-400 dark:border-gray-600',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
]

export default function QuicklinksPage() {
  return (
    <SectionContainer>
      <div className="flex min-h-[60vh] flex-col items-center py-12">
        <div className="flex w-full max-w-md flex-col gap-4">
          {links.map((link) => (
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
