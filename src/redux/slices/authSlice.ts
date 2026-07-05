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

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

let parsedUser = null
try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null
} catch (e) {
  localStorage.removeItem('user')
}

const initialState: AuthState = {
  user: parsedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setUser, setToken, logout, setLoading } = authSlice.actions
export default authSlice.reducer
