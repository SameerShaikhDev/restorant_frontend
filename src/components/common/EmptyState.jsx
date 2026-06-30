import React from 'react'
import { FiShoppingBag } from 'react-icons/fi'

const EmptyState = ({ 
  icon: Icon = FiShoppingBag, 
  title = 'Nothing here yet', 
  description = 'Start adding items to see them here',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="text-gray-300 text-6xl mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  )
}

export default EmptyState