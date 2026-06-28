import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  avatar?: string
  company: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const DEMO_USER: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@barcodehub.pro',
  role: 'admin',
  company: 'BarcodeHub Industries',
}

const initialState: AuthState = {
  user: DEMO_USER,
  token: 'demo-jwt-token',
  isAuthenticated: true,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setUser, setToken, logout, setLoading } = authSlice.actions
export default authSlice.reducer
