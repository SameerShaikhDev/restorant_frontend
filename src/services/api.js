import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage first
    let token = localStorage.getItem('accessToken')
    
    // If not found, try sessionStorage for table session
    if (!token) {
      token = sessionStorage.getItem('tableSessionToken')
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth tokens if it's not a table session request
      const isTableSession = error.config.url?.includes('/tables/') && 
                           error.config.url?.includes('/session')
      
      if (!isTableSession) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        sessionStorage.removeItem('tableSessionToken')
        sessionStorage.removeItem('tableId')
        sessionStorage.removeItem('tableNumber')
        
        // Redirect to login if on protected page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api