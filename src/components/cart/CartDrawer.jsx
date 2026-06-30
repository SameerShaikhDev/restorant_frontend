import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

const CartDrawer = ({ isOpen, onClose, items, onUpdate, onRemove, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-xl flex flex-col"
          >
            <div className="bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">🛒</p>
                  <p>Your cart is empty</p>
                  <p className="text-sm">Start adding items from the menu</p>
                </div>
              ) : (
                <div>
                  {items.map((item) => (
                    <CartItem
                      key={item.menuItemId}
                      item={item}
                      onUpdate={onUpdate}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t">
              <CartSummary
                subtotal={subtotal}
                tax={tax}
                total={total}
                itemCount={itemCount}
                onCheckout={onCheckout}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer