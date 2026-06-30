import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTableSessionStore from '../store/useTableSessionStore'
import { tableService } from '../services/tableService'

const useTableSession = () => {
  const navigate = useNavigate()
  const { token, tableId, tableNumber, setSession, clearSession, loadSession } = useTableSessionStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const hasSession = loadSession()
    if (!hasSession) {
      const params = new URLSearchParams(window.location.search)
      const table = params.get('table')
      if (table) {
        generateSession(table)
      }
    }
  }, [])

  const generateSession = async (tableNumber) => {
    setLoading(true)
    setError(null)
    try {
      const response = await tableService.generateSession(tableNumber)
      if (response.data && response.data.sessionToken) {
        setSession(response.data)
        // Remove table from URL
        const url = new URL(window.location)
        url.searchParams.delete('table')
        window.history.replaceState({}, '', url)
        return response.data
      }
    } catch (error) {
      console.error('Failed to generate table session:', error)
      const message = error.response?.data?.message || 'Unable to connect to table'
      setError(message)
      
      // Show user-friendly error with more info
      let errorMessage = `❌ ${message}\n\n`
      
      if (message.includes('occupied')) {
        errorMessage += 'This table is currently being used. Please:\n'
        errorMessage += '• Wait for the current customers to finish\n'
        errorMessage += '• Ask staff to reset the table\n'
        errorMessage += '• Try another table'
      } else if (message.includes('reserved')) {
        errorMessage += 'This table is reserved. Please:\n'
        errorMessage += '• Check with staff about the reservation\n'
        errorMessage += '• Try another table'
      } else if (message.includes('cleaning')) {
        errorMessage += 'This table is being cleaned. Please:\n'
        errorMessage += '• Wait a few minutes\n'
        errorMessage += '• Ask staff when it will be ready'
      } else {
        errorMessage += 'Please try again or contact staff for assistance.'
      }
      
      alert(errorMessage)
      
      // Clear any existing session
      clearSession()
      
      // Remove table from URL
      const url = new URL(window.location)
      url.searchParams.delete('table')
      window.history.replaceState({}, '', url)
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearAndRedirect = () => {
    clearSession()
    navigate('/')
  }

  return {
    token,
    tableId,
    tableNumber,
    hasSession: !!token,
    loading,
    error,
    generateSession,
    clearSession: clearAndRedirect,
  }
}

export default useTableSession