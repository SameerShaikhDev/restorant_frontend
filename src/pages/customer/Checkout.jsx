import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import useCartStore from '../../store/useCartStore'
import useTableSession from '../../hooks/useTableSession'
import { orderService } from '../../services/orderService'
import { formatCurrency } from '../../utils/formatCurrency'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, totalAmount, clearCart } = useCartStore()
  const { tableNumber, token } = useTableSession()
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [customerNote, setCustomerNote] = useState('')

  const subtotal = totalAmount
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const handlePlaceOrder = async () => {
    if (!token) {
      alert('Please scan the QR code again')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || '',
        })),
        customerNote: customerNote || `Table ${tableNumber}`,
      }

      const response = await orderService.createOrder(orderData)
      setOrderId(response.data._id)
      setOrderSuccess(true)
      clearCart()
      
      // Redirect to tracking after 2 seconds
      setTimeout(() => {
        navigate('/tracking', { state: { orderId: response.data._id } })
      }, 2000)
    } catch (error) {
      console.error('Failed to place order:', error)
      alert(error.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items from the menu</p>
          <button onClick={() => navigate('/menu')} className="btn-primary">
            Browse Menu
          </button>
        </div>
      </>
    )
  }

  if (orderSuccess) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Order Placed! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Your order has been received and is being prepared.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Order #{orderId?.slice(-6)}
            </p>
            <button
              onClick={() => navigate('/tracking')}
              className="btn-primary"
            >
              Track Your Order
            </button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition mb-4"
        >
          <FiArrowLeft />
          Back to Menu
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="ml-2">{item.itemName}</span>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-400 italic">{item.specialInstructions}</p>
                    )}
                  </div>
                  <span>{formatCurrency(item.itemPrice * item.quantity)}</span>
                </div>
              ))}

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Table {tableNumber}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Special Notes</label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Any special requests?"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full btn-primary text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Placing Order...
                  </span>
                ) : (
                  `Place Order • ${formatCurrency(total)}`
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                By placing this order, you agree to our terms
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Checkout