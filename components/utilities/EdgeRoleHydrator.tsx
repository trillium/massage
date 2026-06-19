'use client'

import { useEffect } from 'react'
import { useAppDispatch, useReduxEdgeRole } from '@/redux/hooks'
import { setEdgeRole } from '@/redux/slices/edgeRoleSlice'

const STORAGE_KEY = 'edgeRole'

type EdgeRole = 'community' | 'team'

function isEdgeRole(v: unknown): v is EdgeRole {
  return v === 'community' || v === 'team'
}

export default function EdgeRoleHydrator() {
  const dispatch = useAppDispatch()
  const currentRole = useReduxEdgeRole()

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('role')
    if (isEdgeRole(param)) {
      dispatch(setEdgeRole(param))
      return
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isEdgeRole(stored)) {
        dispatch(setEdgeRole(stored))
      }
    } catch {
      // localStorage unavailable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentRole === undefined) return
    try {
      localStorage.setItem(STORAGE_KEY, currentRole)
    } catch {
      // localStorage unavailable
    }
  }, [currentRole])

  return null
}
