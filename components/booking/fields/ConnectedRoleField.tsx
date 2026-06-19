'use client'

import { useAppDispatch, useReduxEdgeRole } from '@/redux/hooks'
import { setEdgeRole } from '@/redux/slices/edgeRoleSlice'
import RoleField from './RoleField'

export default function ConnectedRoleField() {
  const role = useReduxEdgeRole()
  const dispatch = useAppDispatch()
  return <RoleField value={role} onChange={(v) => dispatch(setEdgeRole(v))} />
}
