import React from 'react'
import { motion } from 'framer-motion'
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatCurrency'

const CartItem = ({ item, onUpdate, onRemove }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex gap-3 py-3 border-b"
    >
      <div className="flex-1">
        <h4 className="font-medium">{item.itemName}</h4>
        <p className="text-sm text-gray-500">{formatCurrency(item.itemPrice)}</p>
        {item.specialInstructions && (
          <p className="text-xs text-gray-400 italic">{item.specialInstructions}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(item.menuItemId, item.quantity - 1)}
            className="border rounded p-1 hover:bg-gray-100 transition"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdate(item.menuItemId, item.quantity + 1)}
            className="border rounded p-1 hover:bg-gray-100 transition"
          >
            <FiPlus size={14} />
          </button>
        </div>
        
        <button
          onClick={() => onRemove(item.menuItemId)}
          className="text-red-500 hover:text-red-700 transition p-1"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  )
}

export default CartItem