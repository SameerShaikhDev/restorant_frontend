import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiSmartphone, FiRefreshCw } from 'react-icons/fi'
import { FaQrcode } from 'react-icons/fa'
import useTableSession from '../../hooks/useTableSession'
import Navbar from '../../components/common/Navbar'

const Landing = () => {
  const navigate = useNavigate()
  const { tableNumber, hasSession, generateSession, clearSession } = useTableSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const table = params.get('table')
    
    if (table && !hasSession) {
      handleGenerateSession(table)
    }
  }, [])

  const handleGenerateSession = async (table) => {
    setLoading(true)
    setError(null)
    try {
      await generateSession(table)
      const url = new URL(window.location)
      url.searchParams.delete('table')
      window.history.replaceState({}, '', url)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to connect to table')
    } finally {
      setLoading(false)
    }
  }

  const handleManualEntry = () => {
    const table = prompt('Enter your table number (e.g., T001):')
    if (table) {
      handleGenerateSession(table.toUpperCase())
    }
  }

  if (hasSession && tableNumber) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-cream flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-8xl mb-6"
            >
              🍽️
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-secondary mb-4">
              Welcome to
              <span className="text-primary block">Our Restaurant</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Enjoy a seamless dining experience right from your phone.
              Browse the menu, place orders, and track them in real-time.
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="inline-block bg-primary text-white px-8 py-3 rounded-full text-2xl font-bold mb-8"
            >
              Table {tableNumber}
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/menu')}
                className="btn-primary text-lg flex items-center justify-center gap-2"
              >
                Start Ordering
                <FiArrowRight />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  clearSession()
                  navigate('/')
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2"
              >
                <FiRefreshCw />
                Switch Table
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex justify-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <FiSmartphone />
                <span>Order from your phone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Live tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span>Real-time updates</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-cream flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-6"
          >
            📱
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-4">
            Scan to Order
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Scan the QR code on your table to start ordering.
            No app needed - just scan and enjoy!
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-6 rounded-full">
                <FaQrcode className="text-primary" size={64} />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">How it works:</h3>
            <ol className="text-left text-gray-600 space-y-2 max-w-sm mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Scan the QR code on your table</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Browse the menu and add items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Place your order and track it live</span>
              </li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <span className="animate-spin">⏳</span>
              Connecting to table...
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleManualEntry}
                className="btn-secondary text-lg flex items-center justify-center gap-2"
              >
                Enter Table Number
              </button>
            </div>
          )}

          <p className="text-sm text-gray-400 mt-6">
            💡 Tip: Look for the QR code on your table or ask your server
          </p>
        </motion.div>
      </div>
    </>
  )
}

export default Landing