import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiClock, FiXCircle, FiRefreshCw } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { orderService } from '../../services/orderService'
import useSocket from '../../hooks/useSocket'

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { on, off, isConnected } = useSocket()

  useEffect(() => {
    fetchOrders()
    
    // Listen for new orders
    const handleOrderUpdate = () => {
      fetchOrders()
    }

    on('order-update', handleOrderUpdate)

    return () => {
      off('order-update', handleOrderUpdate)
    }
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Get all orders with status filter
      const response = await orderService.getAllOrders({
        limit: 100,
      })
      
      // Filter on frontend for active orders
      const allOrders = response.data.orders || []
      const active = allOrders.filter(o => 
        ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      )
      setOrders(active)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert(error.response?.data?.message || 'Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      served: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Confirm Order',
      confirmed: 'Start Cooking',
      preparing: 'Mark Ready',
    }
    return labels[status] || null
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <p className="text-sm text-gray-500">
              {isConnected ? '🟢 Live updates' : '🟡 Reconnecting...'}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="text-gray-500 hover:text-primary transition p-2"
          >
            <FiRefreshCw size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl shadow">
              <div className="text-6xl mb-4">🍳</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Orders</h3>
              <p className="text-gray-500">Orders will appear here when customers place them</p>
            </div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">
                      Order #{order._id.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Table {order.tableNumber}
                      <span className="mx-2">•</span>
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.itemName}
                      </span>
                      {item.specialInstructions && (
                        <span className="text-xs text-gray-400 italic">
                          ({item.specialInstructions})
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {order.customerNote && (
                  <p className="text-sm text-gray-500 mb-3 italic">
                    📝 Note: {order.customerNote}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  {getStatusLabel(order.status) && (
                    <button
                      onClick={() => {
                        const nextStatus = 
                          order.status === 'pending' ? 'confirmed' :
                          order.status === 'confirmed' ? 'preparing' :
                          'ready'
                        handleStatusUpdate(order._id, nextStatus)
                      }}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle />
                      {getStatusLabel(order.status)}
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'served')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle />
                      Mark Served
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default KitchenDisplay