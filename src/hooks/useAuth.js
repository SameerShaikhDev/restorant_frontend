import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth, initialize } = useAuthStore()

  useEffect(() => {
    // Check auth state on mount
    const hasAuth = checkAuth()
    if (!hasAuth) {
      initialize()
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    isManager: user?.role === 'manager',
    isKitchen: user?.role === 'kitchen',
    isWaiter: user?.role === 'waiter',
  }
}

export default useAuth