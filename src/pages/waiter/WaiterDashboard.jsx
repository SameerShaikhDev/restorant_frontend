import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { orderService } from '../../services/orderService'
import { tableService } from '../../services/tableService'
import useSocket from '../../hooks/useSocket'

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const { on, off } = useSocket()

  useEffect(() => {
    fetchData()
    
    const handleOrderUpdate = () => {
      fetchData()
    }

    on('order-update', handleOrderUpdate)

    return () => {
      off('order-update', handleOrderUpdate)
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        orderService.getAllOrders({ status: 'ready,served', limit: 50 }),
        tableService.getTables(),
      ])
      setOrders(ordersRes.data.orders || [])
      setTables(tablesRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServeOrder = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'served')
      fetchData()
    } catch (error) {
      console.error('Failed to serve order:', error)
    }
  }

  const readyOrders = orders.filter(o => o.status === 'ready')
  const servedOrders = orders.filter(o => o.status === 'served')
  const occupiedTables = tables.filter(t => t.status === 'occupied')
  const cleaningTables = tables.filter(t => t.status === 'cleaning')

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Waiter Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiClock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{readyOrders.length}</p>
                <p className="text-sm text-gray-500">Ready to Serve</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{servedOrders.length}</p>
                <p className="text-sm text-gray-500">Served Today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUsers className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{occupiedTables.length}</p>
                <p className="text-sm text-gray-500">Occupied Tables</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <FiUsers className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{cleaningTables.length}</p>
                <p className="text-sm text-gray-500">Cleaning</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ready Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-yellow-500">🟡</span>
            Ready to Serve ({readyOrders.length})
          </h2>
          
          {readyOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No orders ready to serve</p>
          ) : (
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">#{order._id.slice(-6)}</span>
                      <span className="text-sm text-gray-500">Table {order.tableNumber}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      {order.items?.map((item, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {item.quantity}x {item.itemName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleServeOrder(order._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <FiCheckCircle />
                    Serve
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Tables Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Table Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {tables.map((table) => (
              <div
                key={table._id}
                className={`p-3 rounded-lg text-center ${
                  table.status === 'available' ? 'bg-green-100' :
                  table.status === 'occupied' ? 'bg-blue-100' :
                  table.status === 'reserved' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}
              >
                <div className="font-bold">{table.tableNumber}</div>
                <div className="text-xs capitalize">{table.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default WaiterDashboard