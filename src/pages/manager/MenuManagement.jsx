import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import RoleRoute from '../../components/common/RoleRoute'
import { menuService } from '../../services/menuService'

const MenuManagement = () => {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isVeg: false,
    isBestSeller: false,
    prepTimeMinutes: 15,
    spiceLevel: 'medium',
    ingredients: '',
    isAvailable: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories(),
      ])
      setItems(itemsRes.data.allItems || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        prepTimeMinutes: parseInt(formData.prepTimeMinutes),
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      }

      if (editingItem) {
        await menuService.updateMenuItem(editingItem._id, data)
      } else {
        await menuService.createMenuItem(data)
      }
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        isVeg: false,
        isBestSeller: false,
        prepTimeMinutes: 15,
        spiceLevel: 'medium',
        ingredients: '',
        isAvailable: true,
      })
      fetchData()
    } catch (error) {
      console.error('Failed to save item:', error)
      alert(error.response?.data?.message || 'Failed to save item')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await menuService.deleteMenuItem(id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const handleToggleAvailability = async (id) => {
    try {
      await menuService.toggleAvailability(id)
      fetchData()
    } catch (error) {
      console.error('Failed to toggle availability:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['manager']}>
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading menu...</p>
          </div>
        </RoleRoute>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={['manager']}>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-primary transition"
              >
                <FiRefreshCw size={20} />
              </button>
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    categoryId: categories[0]?._id || '',
                    imageUrl: '',
                    isVeg: false,
                    isBestSeller: false,
                    prepTimeMinutes: 15,
                    spiceLevel: 'medium',
                    ingredients: '',
                    isAvailable: true,
                  })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus />
                Add Item
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{item.categoryId?.name || 'Uncategorized'}</td>
                      <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleAvailability(item._id)}
                          className="flex items-center gap-2 text-sm"
                        >
                          {item.isAvailable ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <FiToggleRight size={20} />
                              Available
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <FiToggleLeft size={20} />
                              Unavailable
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item)
                              setFormData({
                                name: item.name,
                                description: item.description || '',
                                price: item.price,
                                categoryId: item.categoryId?._id || '',
                                imageUrl: item.imageUrl || '',
                                isVeg: item.isVeg,
                                isBestSeller: item.isBestSeller,
                                prepTimeMinutes: item.prepTimeMinutes || 15,
                                spiceLevel: item.spiceLevel || 'medium',
                                ingredients: (item.ingredients || []).join(', '),
                                isAvailable: item.isAvailable,
                              })
                              setShowModal(true)
                            }}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                      <input
                        type="number"
                        value={formData.prepTimeMinutes}
                        onChange={(e) => setFormData({ ...formData, prepTimeMinutes: parseInt(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ingredients (comma separated)</label>
                    <input
                      type="text"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tomatoes, Cheese, Basil"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Spice Level</label>
                      <select
                        value={formData.spiceLevel}
                        onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="mild">Mild</option>
                        <option value="medium">Medium</option>
                        <option value="hot">Hot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Veg</label>
                      <select
                        value={formData.isVeg}
                        onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'true' })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="false">Non-Veg</option>
                        <option value="true">Veg</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Best Seller</label>
                      <select
                        value={formData.isBestSeller}
                        onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.value === 'true' })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 btn-primary">
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </RoleRoute>
    </ProtectedRoute>
  )
}

export default MenuManagement