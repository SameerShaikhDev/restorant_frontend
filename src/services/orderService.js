import api from './api'

export const orderService = {
  // Create order (customer)
  createOrder: async (data) => {
    const response = await api.post('/orders', data)
    return response.data
  },

  // Get active orders (customer)
  getActiveOrders: async () => {
    const response = await api.get('/orders/active')
    return response.data
  },

  // Get single order (customer/staff)
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  // Get all orders (staff)
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders/all', { params })
    return response.data
  },

  // Update order status (staff)
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  // Reject order (manager only)
  rejectOrder: async (id, reason) => {
    const response = await api.patch(`/orders/${id}/reject`, { reason })
    return response.data
  },

  // Cancel order (staff)
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`)
    return response.data
  },
}