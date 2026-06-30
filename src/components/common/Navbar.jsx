import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiHome, FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'
import useTableSession from '../../hooks/useTableSession'
import useCartStore from '../../store/useCartStore'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { tableNumber } = useTableSession()
  const { itemCount } = useCartStore()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            🍽️ Restaurant
          </Link>
          
          <div className="flex items-center gap-4">
            {tableNumber && (
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                Table {tableNumber}
              </span>
            )}
            
            <Link to="/menu" className="text-gray-600 hover:text-primary transition">
              <FiHome size={24} />
            </Link>
            
            <button
              onClick={() => navigate('/checkout')}
              className="relative text-gray-600 hover:text-primary transition"
            >
              <FiShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-red-500 transition"
                >
                  <FiLogOut size={24} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-primary transition">
                <FiUser size={24} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar