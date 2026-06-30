import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'

const CartSummary = ({ subtotal, tax, total, itemCount, onCheckout }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Order Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={itemCount === 0}
        className={`w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {itemCount === 0 ? 'Cart is empty' : `Checkout • ${formatCurrency(total)}`}
      </button>
    </div>
  )
}

export default CartSummary