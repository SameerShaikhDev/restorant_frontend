import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Initialize auth state from localStorage
  initialize: () => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, isAuthenticated: true })
        return true
      } catch (e) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false })
        return false
      }
    }
    return false
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, accessToken } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true, user }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    // Clear localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: () => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, isAuthenticated: true })
        return true
      } catch (e) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false })
        return false
      }
    }
    set({ user: null, isAuthenticated: false })
    return false
  },
}))

export default useAuthStore