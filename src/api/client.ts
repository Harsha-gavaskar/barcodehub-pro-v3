import axios from 'axios'
import { store } from '../redux/store'
import { setToken, logout } from '../redux/slices/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inject authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Auto-refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) {
          throw new Error('No refresh token available')
        }

        // Call refresh endpoint directly
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh,
        })
        
        const { access } = res.data
        store.dispatch(setToken(access))
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (err) {
        // Clear auth and logout
        store.dispatch(logout())
        localStorage.removeItem('refresh_token')
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)
