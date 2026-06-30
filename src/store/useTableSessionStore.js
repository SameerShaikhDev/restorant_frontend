import { create } from 'zustand'

const useTableSessionStore = create((set) => ({
  token: null,
  tableId: null,
  tableNumber: null,
  tableStatus: null,

  setSession: (data) => {
    const { sessionToken, tableId, tableNumber, tableStatus } = data
    sessionStorage.setItem('tableSessionToken', sessionToken)
    sessionStorage.setItem('tableId', tableId)
    sessionStorage.setItem('tableNumber', tableNumber)
    set({ token: sessionToken, tableId, tableNumber, tableStatus })
  },

  clearSession: () => {
    sessionStorage.removeItem('tableSessionToken')
    sessionStorage.removeItem('tableId')
    sessionStorage.removeItem('tableNumber')
    set({ token: null, tableId: null, tableNumber: null, tableStatus: null })
  },

  loadSession: () => {
    const token = sessionStorage.getItem('tableSessionToken')
    const tableId = sessionStorage.getItem('tableId')
    const tableNumber = sessionStorage.getItem('tableNumber')
    if (token && tableId && tableNumber) {
      set({ token, tableId, tableNumber })
      return true
    }
    return false
  },

  getToken: () => {
    return sessionStorage.getItem('tableSessionToken')
  },
}))

export default useTableSessionStore