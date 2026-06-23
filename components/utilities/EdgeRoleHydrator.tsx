'use client'

import { useEffect } from 'react'
import { useAppDispatch, useReduxEdgeRole } from '@/redux/hooks'
import { setEdgeRole } from '@/redux/slices/edgeRoleSlice'

const STORAGE_KEY = 'edgeRole'

type EdgeRole = 'attendee' | 'volunteer' | 'team'

function normalizeRole(v: unknown): EdgeRole | null {
  if (v === 'attendee' || v === 'volunteer' || v === 'team') return v
  if (v === 'community') return 'volunteer'
  return null
}

export default function EdgeRoleHydrator({ forceRole }: { forceRole?: EdgeRole } = {}) {
  const dispatch = useAppDispatch()
  const currentRole = useReduxEdgeRole()

  useEffect(() => {
    if (forceRole) {
      dispatch(setEdgeRole(forceRole))
      return
    }
    const param = new URLSearchParams(window.location.search).get('role')
    const fromParam = normalizeRole(param)
    if (fromParam) {
      dispatch(setEdgeRole(fromParam))
      return
    }
    try {
      const fromStorage = normalizeRole(localStorage.getItem(STORAGE_KEY))
      if (fromStorage) {
        dispatch(setEdgeRole(fromStorage))
        return
      }
    } catch {
      // localStorage unavailable
    }
    dispatch(setEdgeRole('attendee'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRole])

  useEffect(() => {
    if (forceRole) return
    if (currentRole === undefined) return
    try {
      localStorage.setItem(STORAGE_KEY, currentRole)
    } catch {
      // localStorage unavailable
    }
  }, [currentRole, forceRole])

  return null
}
