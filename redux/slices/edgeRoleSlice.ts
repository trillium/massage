import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

type EdgeRole = 'community' | 'team' | undefined

type EdgeRoleState = { role: EdgeRole }

const initialState: EdgeRoleState = { role: undefined }

export const edgeRoleSlice: Slice<EdgeRoleState> = createSlice({
  name: 'edgeRole',
  initialState,
  reducers: {
    setEdgeRole: (state, action: PayloadAction<EdgeRole>) => {
      state.role = action.payload
    },
  },
})

export const { setEdgeRole } = edgeRoleSlice.actions

export const selectEdgeRole = (state: RootState) => state.edgeRole.role

export default edgeRoleSlice.reducer
