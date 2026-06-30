import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiCopy } from 'react-icons/fi'
import { FaQrcode } from 'react-icons/fa'
import { QRCodeSVG } from 'qrcode.react'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import RoleRoute from '../../components/common/RoleRoute'
import { tableService } from '../../services/tableService'

const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [editingTable, setEditingTable] = useState(null)
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    floorSection: 'Main',
    status: 'available',
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    try {
      const response = await tableService.getTables()
      setTables(response.data || [])
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable._id, formData)
      } else {
        await tableService.createTable(formData)
      }
      setShowModal(false)
      setEditingTable(null)
      setFormData({ tableNumber: '', capacity: 4, floorSection: 'Main', status: 'available' })
      fetchTables()
    } catch (error) {
      console.error('Failed to save table:', error)
      alert(error.response?.data?.message || 'Failed to save table')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return
    try {
      await tableService.deleteTable(id)
      fetchTables()
    } catch (error) {
      console.error('Failed to delete table:', error)
      alert(error.response?.data?.message || 'Failed to delete table')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await tableService.updateTableStatus(id, { status })
      fetchTables()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert(error.response?.data?.message || 'Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusEmoji = (status) => {
    const emojis = {
      available: '🟢',
      occupied: '🔵',
      reserved: '🟡',
      cleaning: '🔴',
    }
    return emojis[status] || '⚪'
  }

  const handleShowQR = (table) => {
    setSelectedTable(table)
    setShowQRModal(true)
  }

  const copyQRUrl = () => {
    const url = `${window.location.origin}/?table=${selectedTable.tableNumber}`
    navigator.clipboard?.writeText(url)
    alert('QR URL copied to clipboard!')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['manager']}>
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading tables...</p>
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
            <h1 className="text-2xl font-bold">Table Management</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchTables}
                className="p-2 text-gray-500 hover:text-primary transition"
              >
                <FiRefreshCw size={20} />
              </button>
              <button
                onClick={() => {
                  setEditingTable(null)
                  setFormData({ tableNumber: '', capacity: 4, floorSection: 'Main', status: 'available' })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus />
                Add Table
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <motion.div
                key={table._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold">{table.tableNumber}</span>
                    <div className="text-sm text-gray-500">
                      {getStatusEmoji(table.status)} {table.status}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(table.status)}`}>
                    {table.capacity} seats
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  {table.floorSection}
                  {table.reservedFor && (
                    <div className="text-xs text-yellow-600">Reserved: {table.reservedFor}</div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleShowQR(table)}
                    className="p-1.5 text-gray-500 hover:text-primary transition rounded hover:bg-gray-100"
                    title="Show QR Code"
                  >
                    <FaQrcode size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTable(table)
                      setFormData({
                        tableNumber: table.tableNumber,
                        capacity: table.capacity,
                        floorSection: table.floorSection,
                        status: table.status,
                      })
                      setShowModal(true)
                    }}
                    className="p-1.5 text-blue-500 hover:text-blue-700 transition rounded hover:bg-gray-100"
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(table._id)}
                    className="p-1.5 text-red-500 hover:text-red-700 transition rounded hover:bg-gray-100"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <select
                    value={table.status}
                    onChange={(e) => handleStatusChange(table._id, e.target.value)}
                    className={`w-full text-xs px-2 py-1 rounded-lg border-0 focus:ring-2 focus:ring-primary ${getStatusColor(table.status)}`}
                  >
                    <option value="available">🟢 Available</option>
                    <option value="occupied">🔵 Occupied</option>
                    <option value="reserved">🟡 Reserved</option>
                    <option value="cleaning">🔴 Cleaning</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Table Number *</label>
                    <input
                      type="text"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value.toUpperCase() })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="T001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacity *</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Floor Section</label>
                    <select
                      value={formData.floorSection}
                      onChange={(e) => setFormData({ ...formData, floorSection: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Main">Main Dining</option>
                      <option value="Terrace">Terrace</option>
                      <option value="Garden">Garden</option>
                      <option value="Private">Private Room</option>
                      <option value="Bar">Bar Area</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="cleaning">Cleaning</option>
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
                      {editingTable ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showQRModal && selectedTable && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-sm w-full p-6 text-center"
              >
                <h2 className="text-2xl font-bold mb-2">Table {selectedTable.tableNumber}</h2>
                <p className="text-gray-500 text-sm mb-4">Scan to order from this table</p>
                
                <div className="flex justify-center mb-4">
                  <QRCodeSVG
                    value={`${window.location.origin}/?table=${selectedTable.tableNumber}`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 break-all">
                    {window.location.origin}/?table={selectedTable.tableNumber}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyQRUrl}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <FiCopy />
                    Copy URL
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 btn-primary"
                  >
                    Done
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  <p>📱 Scan with any QR code reader</p>
                  <p>Or share the link with customers</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </RoleRoute>
    </ProtectedRoute>
  )
}

export default TableManagement