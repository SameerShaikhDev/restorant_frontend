import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMinus, FiPlus, FiStar, FiClock } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatCurrency'

const ItemDetailsModal = ({ item, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')

  if (!item) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-56 object-cover rounded-t-2xl"
              />
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold">{item.name}</h2>
              {item.isVeg && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Veg</span>
              )}
            </div>

            <p className="text-gray-600 mb-4">{item.description}</p>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
              {item.rating > 0 && (
                <span className="flex items-center gap-1">
                  <FiStar className="text-yellow-500" />
                  {item.rating}
                </span>
              )}
              {item.prepTimeMinutes && (
                <span className="flex items-center gap-1">
                  <FiClock />
                  {item.prepTimeMinutes} min
                </span>
              )}
              {item.spiceLevel && (
                <span className="capitalize">🌶️ {item.spiceLevel}</span>
              )}
            </div>

            {item.ingredients && item.ingredients.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient, i) => (
                    <span
                      key={i}
                      className="text-sm bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block font-semibold mb-1">Special Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special requests?"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows="2"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border rounded-lg p-2 hover:bg-gray-100 transition"
                >
                  <FiMinus />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  className="border rounded-lg p-2 hover:bg-gray-100 transition"
                >
                  <FiPlus />
                </button>
              </div>
              <button
                onClick={() => {
                  onAdd({ ...item, quantity, specialInstructions: instructions })
                  onClose()
                }}
                className="btn-primary"
              >
                Add {quantity > 1 ? `${quantity}x ` : ''}for {formatCurrency(item.price * quantity)}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ItemDetailsModal