'use client'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import clsx from 'clsx'

const Header = () => {
  let headerClass = 'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  const pathName = usePathname()

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center justify-between">
          <div className="mr-3">
            <Logo classes="text-primary-500 w-10 h-10 xs:w-12 xs:h-12" />
          </div>
          {typeof siteMetadata.headerTitle === 'string' ? (
            <div
              className={clsx(
                'hidden border-b-[3px] text-2xl font-semibold leading-6 sm:block',
                { 'border-primary-500': pathName === '/' },
                { 'border-transparent': pathName !== '/' }
              )}
            >
              {siteMetadata.headerTitle}
            </div>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        <div className="no-scrollbar hidden max-w-40 items-center space-x-4 overflow-x-auto pr-2 sm:flex sm:space-x-6 md:max-w-72 lg:max-w-96">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => {
              const active = pathName?.includes(link.href)
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className={clsx(
                    'm-1 box-border block border-b-[3px] font-medium text-gray-900 transition hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-400',
                    { 'border-primary-500': active },
                    { 'border-transparent': !active }
                  )}
                >
                  {link.title}
                </Link>
              )
            })}
        </div>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
