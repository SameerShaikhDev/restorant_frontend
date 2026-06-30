import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import OrderTimeline from '../../components/tracking/OrderTimeline'
import { orderService } from '../../services/orderService'
import useSocket from '../../hooks/useSocket'
import useTableSession from '../../hooks/useTableSession'

const OrderTracking = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { tableNumber } = useTableSession()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('id')
  const { on, off, isConnected } = useSocket()

  useEffect(() => {
    if (!orderId) {
      setError('No order found')
      setLoading(false)
      return
    }
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    // Listen for order updates via socket
    const handleOrderUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrder(data.order)
      }
    }

    on('order-update', handleOrderUpdate)

    return () => {
      off('order-update', handleOrderUpdate)
    }
  }, [on, off, orderId])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getOrder(orderId)
      setOrder(response.data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      setError(error.response?.data?.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading your order...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'Could not find your order'}</p>
          <button onClick={() => navigate('/menu')} className="btn-primary">
            Back to Menu
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition mb-4"
        >
          <FiArrowLeft />
          Back to Menu
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Order Status</h2>
              <p className="text-sm text-gray-500">Table {tableNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order #{order._id?.slice(-6)}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <OrderTimeline
            currentStatus={order.status}
            order={order}
          />

          {isConnected && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live updates connected</span>
            </div>
          )}

          {!isConnected && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={fetchOrder}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Order Items Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.itemName}
                </span>
                <span>${(item.itemPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderTracking