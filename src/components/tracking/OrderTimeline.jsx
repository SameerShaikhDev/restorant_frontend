import React from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiClock } from 'react-icons/fi'

const ORDER_STATUSES = [
  { key: 'pending', label: 'Received', icon: '📥' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '🍽️' },
  { key: 'served', label: 'Served', icon: '👍' },
]

const OrderTimeline = ({ currentStatus, order }) => {
  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === currentStatus)

  const getStatusColor = (index) => {
    if (index <= currentIndex) return 'bg-primary'
    return 'bg-gray-300'
  }

  const getTextColor = (index) => {
    if (index <= currentIndex) return 'text-primary'
    return 'text-gray-400'
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-start relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
          />
        </div>

        {/* Status dots */}
        {ORDER_STATUSES.map((status, index) => (
          <div key={status.key} className="flex flex-col items-center flex-1 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(index)} z-10`}
            >
              {index < currentIndex ? <FiCheckCircle /> : status.icon}
            </motion.div>
            <span className={`text-xs mt-1 font-medium ${getTextColor(index)}`}>
              {status.label}
            </span>
            {index === currentIndex && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-6 text-xs text-primary font-semibold"
              >
                Current
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {order && (
        <div className="mt-8 bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order #{order._id?.slice(-6)}</span>
            <span className="text-gray-500">
              {new Date(order.createdAt).toLocaleTimeString()}
            </span>
          </div>
          {order.items && (
            <div className="mt-2 space-y-1 text-sm">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.itemName}
                  </span>
                  <span>${(item.itemPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTimeline