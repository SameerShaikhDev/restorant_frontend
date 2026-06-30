import api from './api'

export const tableService = {
  // Get all tables
  getTables: async () => {
    const response = await api.get('/tables')
    return response.data
  },

  // Get table by number
  getTableByNumber: async (tableNumber) => {
    const response = await api.get(`/tables/${tableNumber}`)
    return response.data
  },

  // Generate table session (customer)
  generateSession: async (tableNumber) => {
    const response = await api.post(`/tables/${tableNumber}/session`)
    return response.data
  },

  // Create table (manager only)
  createTable: async (data) => {
    const response = await api.post('/tables', data)
    return response.data
  },

  // Update table (manager only)
  updateTable: async (id, data) => {
    const response = await api.put(`/tables/${id}`, data)
    return response.data
  },

  // Delete table (manager only)
  deleteTable: async (id) => {
    const response = await api.delete(`/tables/${id}`)
    return response.data
  },

  // Update table status (manager/waiter)
  updateTableStatus: async (id, data) => {
    const response = await api.patch(`/tables/${id}/status`, data)
    return response.data
  },
}