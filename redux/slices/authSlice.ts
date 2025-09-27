import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import { AdminAuthManager } from '@/lib/adminAuth'

interface AuthState {
  isAuthenticated: boolean
  adminEmail: string | null
}

const initialState: AuthState = {
  isAuthenticated: AdminAuthManager.isAuthenticated(),
  adminEmail: AdminAuthManager.getCurrentAdminEmail(),
}

export const authSlice: Slice<AuthState> = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; token: string }>) => {
      const success = AdminAuthManager.createSession(action.payload.email, action.payload.token)
      if (success) {
        state.isAuthenticated = true
        state.adminEmail = action.payload.email
      }
    },
    logout: (state) => {
      AdminAuthManager.clearSession()
      state.isAuthenticated = false
      state.adminEmail = null
    },
    checkAuth: (state) => {
      state.isAuthenticated = AdminAuthManager.isAuthenticated()
      state.adminEmail = AdminAuthManager.getCurrentAdminEmail()
    },
  },
})

export const { login, logout, checkAuth } = authSlice.actions

export const selectAuth = (state: RootState) => state.auth

export default authSlice.reducer
