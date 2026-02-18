'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react'
import headerNavLinks from '@/data/headerNavLinks'
import Link from '@/components/Link'
import clsx from 'clsx'

type NavItemBase = {
  title: string
}

type NavItemWithHref = NavItemBase & {
  href: string
  children?: never
}

type NavItemWithChildren = NavItemBase & {
  children: NavItemChild[]
  href?: never
}

export type NavItemChild = {
  href: string
  title: string
}

export type NavItem = NavItemWithHref | NavItemWithChildren

export const NavOptions = () => {
  return (
    <div className="hidden items-center space-x-4 sm:flex sm:space-x-6">
      {headerNavLinks.map((link) => (
        <RenderNavLink navItem={link} key={link.title} />
      ))}
    </div>
  )
}

const RenderNavLink = ({ navItem }: { navItem: NavItem }) => {
  const pathname = usePathname()
  const isActive = pathname === navItem.href

  if (!navItem.children) {
    return (
      <Link
        key={navItem.title}
        href={navItem.href}
        className={clsx(
          'hover:text-primary-500 dark:hover:text-primary-400 xs:text-base text-sm font-medium sm:block',
          {
            'text-primary-400 scale-105 font-bold underline underline-offset-2': isActive,
            'text-gray-900 dark:text-gray-100': !isActive,
          }
        )}
      >
        {navItem.title}
      </Link>
    )
  }
  return (
    <div className="mr-5">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          {navItem.title && (
            <MenuButton
              className={
                'hover:text-primary-500 dark:hover:text-primary-400 hidden font-medium text-gray-900 sm:block dark:text-gray-100'
              }
            >
              {navItem.title}
            </MenuButton>
          )}
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="ring-opacity-5 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800">
            <div className="p-1">
              {navItem.children &&
                navItem.children.map((link: NavItemChild) => (
                  <Menu.Item key={link.title}>
                    {({ focus }) => (
                      <Link
                        href={link.href}
                        className={`${
                          focus ? 'bg-primary-600 text-white' : ''
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {link.title}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  )
}
