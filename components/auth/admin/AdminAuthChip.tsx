'use client'

import { Menu, MenuItems, MenuItem, MenuButton } from '@headlessui/react'
import Link from '@/components/Link'
import authHeaderNavLinks from '@/data/authHeaderNavLinks'
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FaCheck, FaChevronDown } from 'react-icons/fa'

interface AdminAuthChipProps {
  adminEmail?: string | null
  onLogout?: () => void
}

interface AdminState {
  isAdmin: boolean
  email: string | null
}

export function AdminAuthChip({ adminEmail, onLogout }: AdminAuthChipProps) {
  const [adminState, setAdminState] = useState<AdminState>({ isAdmin: false, email: null })
  const [isClient, setIsClient] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    const checkAdminStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setAdminState({ isAdmin: false, email: null })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        setAdminState({ isAdmin: true, email: user.email || null })
      } else {
        setAdminState({ isAdmin: false, email: null })
      }
    }

    checkAdminStatus()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      await supabase.auth.signOut()
      setAdminState({ isAdmin: false, email: null })
      router.push('/auth/login')
    }
  }

  const displayEmail = adminEmail ?? adminState.email

  if (!isClient || (!adminEmail && !adminState.isAdmin)) {
    return null
  }

  return (
    <div className="absolute top-0 left-0">
      <Menu as="div">
        <MenuButton className="rounded-br-3xl border-b border-l bg-blue-50 px-4 py-2 text-sm transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-blue-800 dark:text-blue-200">
              <FaCheck className="mr-1" /> Admin {displayEmail}
            </span>
            <span className="pl-2 text-blue-600 dark:text-blue-300">
              <FaChevronDown />
            </span>
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
