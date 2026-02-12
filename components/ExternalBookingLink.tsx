'use client'

import { ExternalLinkIcon } from '@heroicons/react/24/outline'

interface ExternalBookingLinkProps {
  href: string
  platform?: string
  className?: string
  children?: React.ReactNode
}

export default function ExternalBookingLink({
  href,
  platform = 'Book Now',
  className = '',
  children,
}: ExternalBookingLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-blue-700 hover:to-blue-800 ${className}`}
    >
      {children || platform}
      <ExternalLinkIcon className="h-5 w-5" />
    </a>
  )
}
