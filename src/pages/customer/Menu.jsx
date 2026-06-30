import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiClipboard } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import CategoryFilter from '../../components/menu/CategoryFilter'
import FoodCard from '../../components/menu/FoodCard'
import ItemDetailsModal from '../../components/menu/ItemDetailsModal'
import CartDrawer from '../../components/cart/CartDrawer'
import { MenuSkeleton } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { menuService } from '../../services/menuService'
import useCartStore from '../../store/useCartStore'
import useTableSession from '../../hooks/useTableSession'

const Menu = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCartStore()
  const { hasSession } = useTableSession()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const response = await menuService.getMenuItems()
      setItems(response.data.allItems || [])
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useCallback(() => {
    let filtered = items
    
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.categoryId?._id === selectedCategory
      )
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [items, selectedCategory, searchQuery])

  const handleAddToCart = (item) => {
    addItem({
      menuItemId: item._id,
      itemName: item.name,
      itemPrice: item.price,
      quantity: item.quantity || 1,
      specialInstructions: item.specialInstructions || '',
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <MenuSkeleton />
        </div>
      </>
    )
  }

  const displayItems = filteredItems()

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Top Bar with Track Order Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Our Menu</h2>
          {hasSession && (
            <button
              onClick={() => navigate('/tracking')}
              className="flex items-center gap-2 text-primary hover:opacity-80 transition px-3 py-2 border border-primary rounded-lg"
            >
              <FiClipboard />
              Track Orders
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="sticky top-20 bg-cream z-10 pb-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          {displayItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                title="No items found"
                description="Try adjusting your search or filter"
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FoodCard
                    item={item}
                    onAdd={() => setSelectedItem(item)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item Details Modal */}
        {selectedItem && (
          <ItemDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAdd={handleAddToCart}
          />
        )}

        {/* Cart Button (Floating) */}
        {cartItems.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40"
          >
            <span>🛒</span>
            <span className="font-bold">{cartItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
          </motion.button>
        )}

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdate={updateQuantity}
          onRemove={removeItem}
          onCheckout={() => {
            setIsCartOpen(false)
            navigate('/checkout')
          }}
        />
      </div>
    </>
  )
}

export default Menu