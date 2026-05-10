import type { IconType } from 'react-icons'
import { FaInstagram, FaEnvelope, FaCalendarAlt, FaDollarSign } from 'react-icons/fa'
import { SiVenmo, SiCashapp } from 'react-icons/si'

export type QuickLink = {
  label: string
  href: string
  icon: IconType
  description: string
  accent: string
  iconColor: string
}

export const gratuityLinks: QuickLink[] = [
  {
    label: 'Venmo',
    href: 'https://venmo.com/YourVenmoHandle',
    icon: SiVenmo,
    description: '@YourVenmoHandle',
    accent: 'border-blue-400 dark:border-blue-600',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'CashApp',
    href: 'https://cash.app/$YourCashAppHandle',
    icon: SiCashapp,
    description: '$YourCashAppHandle',
    accent: 'border-emerald-400 dark:border-emerald-600',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
]

export const quickLinks: QuickLink[] = [
  {
    label: 'Book a Session',
    href: '/book',
    icon: FaCalendarAlt,
    description: 'Schedule your in-home massage',
    accent: 'border-primary-400 dark:border-primary-600',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  ...gratuityLinks,
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
    href: 'https://www.instagram.com/yourhandle',
    icon: FaInstagram,
    description: '@yourhandle',
    accent: 'border-pink-400 dark:border-pink-600',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    label: 'Email',
    href: 'mailto:your@email.com',
    icon: FaEnvelope,
    description: 'your@email.com',
    accent: 'border-accent-400 dark:border-accent-600',
    iconColor: 'text-accent-600 dark:text-accent-400',
  },
]
