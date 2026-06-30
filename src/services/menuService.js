import api from './api'

export const menuService = {
  // Get all menu items
  getMenuItems: async (params = {}) => {
    const response = await api.get('/menu-items', { params })
    return response.data
  },

  // Get single menu item
  getMenuItem: async (id) => {
    const response = await api.get(`/menu-items/${id}`)
    return response.data
  },

  // Create menu item (manager only)
  createMenuItem: async (data) => {
    const response = await api.post('/menu-items', data)
    return response.data
  },

  // Update menu item (manager only)
  updateMenuItem: async (id, data) => {
    const response = await api.put(`/menu-items/${id}`, data)
    return response.data
  },

  // Delete menu item (manager only)
  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu-items/${id}`)
    return response.data
  },

  // Toggle availability (manager only)
  toggleAvailability: async (id) => {
    const response = await api.patch(`/menu-items/${id}/toggle-availability`)
    return response.data
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  // Create category (manager only)
  createCategory: async (data) => {
    const response = await api.post('/categories', data)
    return response.data
  },

  // Update category (manager only)
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  // Delete category (manager only)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}