'use client'

import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux/store'
import { selectAuth, logout } from '@/redux/slices/authSlice'
import { Menu, MenuItems, MenuItem, MenuButton } from '@headlessui/react'
import Link from '@/components/Link'
import authHeaderNavLinks from '@/data/authHeaderNavLinks'
import { useEffect, useState } from 'react'

interface AdminAuthChipProps {
  adminEmail?: string | null
  onLogout?: () => void
}

export function AdminAuthChip({ adminEmail, onLogout }: AdminAuthChipProps) {
  const reduxAuth = useSelector(selectAuth)
  const dispatch = useDispatch<AppDispatch>()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const displayEmail = adminEmail ?? reduxAuth.adminEmail
  const handleLogout = onLogout ?? (() => dispatch({ type: 'auth/logout' }))

  if (!isClient || !reduxAuth.isAuthenticated) {
    return null
  }

  return (
    <div className="absolute top-0 left-0">
      <Menu as="div">
        <MenuButton className="rounded-br-3xl border-b border-l bg-blue-50 px-4 py-2 text-sm transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">✓ Admin {displayEmail}</span>
            <span className="pl-2 text-blue-600 dark:text-blue-300">▼</span>
          </div>
        </MenuButton>
        <MenuItems className="ring-opacity-5 absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
          <div className="px-1 py-1">
            {authHeaderNavLinks.map((link) => (
              <MenuItem key={link.href}>
                <Link
                  href={link.href}
                  className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-blue-500 hover:text-white dark:text-gray-100 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  {link.title}
                </Link>
              </MenuItem>
            ))}
          </div>
          <div className="px-1 py-1">
            <MenuItem>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-red-500 hover:text-white dark:text-gray-100 dark:hover:bg-red-500 dark:hover:text-white"
              >
                Logout
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}
