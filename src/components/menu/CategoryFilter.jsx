import React from 'react'
import { motion } from 'framer-motion'

const CategoryFilter = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <motion.button
        key="all" // Add unique key
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
          !selectedCategory
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        All
      </motion.button>
      
      {categories.map((category) => (
        <motion.button
          key={category._id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category._id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selectedCategory === category._id
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  )
}

export default CategoryFilter