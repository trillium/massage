'use client'

import { useAppDispatch, useReduxEdgeRole } from '@/redux/hooks'
import { setEdgeRole } from '@/redux/slices/edgeRoleSlice'
import RoleField from './RoleField'

export default function ConnectedRoleField() {
  const role = useReduxEdgeRole()
  const dispatch = useAppDispatch()
  const publicRole = role === 'attendee' || role === 'volunteer' ? role : undefined
  return <RoleField value={publicRole} onChange={(v) => dispatch(setEdgeRole(v))} />
}
