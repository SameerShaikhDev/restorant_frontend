import React from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiClock, FiPlus } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatCurrency'

const FoodCard = ({ item, onAdd }) => {
  const {
    name,
    description,
    price,
    imageUrl,
    isVeg,
    isBestSeller,
    rating,
    prepTimeMinutes,
    spiceLevel,
    isAvailable,
  } = item

  if (!isAvailable) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card"
    >
      <div className="relative">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        )}
        {isBestSeller && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
            Best Seller
          </span>
        )}
        {isVeg && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Veg
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2">{description}</p>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {rating > 0 && (
            <span className="flex items-center gap-1">
              <FiStar className="text-yellow-500" />
              {rating}
            </span>
          )}
          {prepTimeMinutes && (
            <span className="flex items-center gap-1">
              <FiClock />
              {prepTimeMinutes}m
            </span>
          )}
          {spiceLevel && (
            <span className="capitalize">🌶️ {spiceLevel}</span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(price)}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdd(item)}
            className="bg-primary text-white p-2 rounded-full hover:opacity-90 transition"
          >
            <FiPlus size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default FoodCard