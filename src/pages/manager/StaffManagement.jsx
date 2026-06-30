import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiUserCheck, FiUserX } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import RoleRoute from '../../components/common/RoleRoute'
import api from '../../services/api'

const StaffManagement = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter',
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users')
      setStaff(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStaff) {
        await api.put(`/users/${editingStaff._id}`, formData)
      } else {
        await api.post('/auth/register', formData)
      }
      setShowModal(false)
      setEditingStaff(null)
      setFormData({ name: '', email: '', password: '', role: 'waiter' })
      fetchStaff()
    } catch (error) {
      console.error('Failed to save staff:', error)
      alert(error.response?.data?.message || 'Failed to save staff')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchStaff()
    } catch (error) {
      console.error('Failed to delete staff:', error)
      alert(error.response?.data?.message || 'Failed to delete staff')
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      await api.patch(`/users/${id}/toggle`, { isActive: !isActive })
      fetchStaff()
    } catch (error) {
      console.error('Failed to toggle staff:', error)
      alert(error.response?.data?.message || 'Failed to update staff')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      manager: 'bg-purple-100 text-purple-800',
      kitchen: 'bg-orange-100 text-orange-800',
      waiter: 'bg-blue-100 text-blue-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleEmoji = (role) => {
    const emojis = {
      manager: '👔',
      kitchen: '👨‍🍳',
      waiter: '👨‍💼',
    }
    return emojis[role] || '👤'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['manager']}>
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading staff...</p>
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
            <div>
              <h1 className="text-2xl font-bold">Staff Management</h1>
              <p className="text-gray-500 text-sm">Manage your restaurant staff</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchStaff}
                className="p-2 text-gray-500 hover:text-primary transition"
              >
                <FiRefreshCw size={20} />
              </button>
              <button
                onClick={() => {
                  setEditingStaff(null)
                  setFormData({ name: '', email: '', password: '', role: 'waiter' })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus />
                Add Staff
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getRoleEmoji(member.role)}</div>
                    <div>
                      <h3 className="font-bold">{member.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(member._id, member.isActive)}
                    className={`p-2 rounded-full transition ${
                      member.isActive 
                        ? 'text-green-500 hover:bg-green-50' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {member.isActive ? <FiUserCheck size={20} /> : <FiUserX size={20} />}
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <p>{member.email}</p>
                  {member.lastLogin && (
                    <p className="text-xs mt-1">
                      Last login: {new Date(member.lastLogin).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingStaff(member)
                      setFormData({
                        name: member.name,
                        email: member.email,
                        password: '',
                        role: member.role,
                      })
                      setShowModal(true)
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                  >
                    <FiEdit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="flex-1 px-3 py-2 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1"
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {staff.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Staff Members</h3>
              <p className="text-gray-500">Click "Add Staff" to create your first staff member</p>
            </div>
          )}

          {/* Add/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-md w-full p-6"
              >
                <h2 className="text-2xl font-bold mb-4">
                  {editingStaff ? 'Edit Staff' : 'Add New Staff'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  {!editingStaff && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        minLength="6"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="waiter">Waiter</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="manager">Manager</option>
                    </select>
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
                      {editingStaff ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </RoleRoute>
    </ProtectedRoute>
  )
}

export default StaffManagement