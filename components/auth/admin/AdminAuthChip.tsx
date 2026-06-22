'use client'

import { Menu, MenuItems, MenuItem, MenuButton } from '@headlessui/react'
import Link from '@/components/Link'
import authHeaderNavLinks from '@/data/authHeaderNavLinks'
import { FaCheck, FaChevronDown } from 'react-icons/fa'
import auth from '@/data/auth.json'
import { TextSm } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface AdminAuthChipProps {
  adminEmail?: string | null
  onLogout?: () => void
}

export function AdminAuthChip({ adminEmail, onLogout }: AdminAuthChipProps) {
  if (!adminEmail) {
    return null
  }

  return (
    <Box className="absolute top-0 left-0">
      <Menu as="div">
        <MenuButton className="rounded-br-3xl border-b border-l bg-blue-50 px-4 py-2 text-sm transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
          <Stack direction="row" align="center" justify="between">
            <TextSm as="span" status="info" className="flex items-center">
              <FaCheck className="mr-1" /> {auth.authChip.admin} {adminEmail}
            </TextSm>
            <TextSm as="span" status="info" className="pl-2">
              <FaChevronDown />
            </TextSm>
          </Stack>
        </MenuButton>
        <MenuItems className="ring-opacity-5 absolute right-0 mt-2 w-56 origin-top-right divide-y divide-accent-100 rounded-md bg-surface-50 shadow-lg ring-1 ring-black focus:outline-none dark:divide-accent-700 dark:bg-surface-800">
          <Box className="px-1 py-1">
            {authHeaderNavLinks.map((link) => (
              <MenuItem key={link.href}>
                <Link
                  href={link.href}
                  className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-accent-900 hover:bg-blue-500 hover:text-white dark:text-accent-100 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  {link.title}
                </Link>
              </MenuItem>
            ))}
          </Box>
          <Box className="px-1 py-1">
            <MenuItem>
              <Button
                onClick={onLogout}
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-accent-900 hover:bg-red-500 hover:text-white dark:text-accent-100 dark:hover:bg-red-500 dark:hover:text-white"
              >
                {auth.authChip.logout}
              </Button>
            </MenuItem>
          </Box>
        </MenuItems>
      </Menu>
    </Box>
  )
}
