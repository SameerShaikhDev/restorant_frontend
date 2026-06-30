import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import RoleRoute from '../../components/common/RoleRoute'
import { orderService } from '../../services/orderService'
import { tableService } from '../../services/tableService'
import { menuService } from '../../services/menuService'

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrder: 0,
    topItems: [],
    tableUtilization: 0,
    ordersByStatus: {},
    dailyData: [],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        orderService.getAllOrders({ limit: 100 }),
        tableService.getTables(),
        menuService.getMenuItems(),
      ])

      const orders = ordersRes.data.orders || []
      const tables = tablesRes.data || []
      
      // Calculate stats
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      const completedOrders = orders.filter(o => o.status === 'served')
      const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
      
      // Top items
      const itemMap = {}
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (!itemMap[item.itemName]) {
            itemMap[item.itemName] = { name: item.itemName, quantity: 0, revenue: 0 }
          }
          itemMap[item.itemName].quantity += item.quantity
          itemMap[item.itemName].revenue += item.itemPrice * item.quantity
        })
      })
      const topItems = Object.values(itemMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      // Orders by status
      const statusMap = {}
      orders.forEach(order => {
        statusMap[order.status] = (statusMap[order.status] || 0) + 1
      })

      // Table utilization
      const occupiedTables = tables.filter(t => t.status === 'occupied').length
      const utilization = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        averageOrder,
        topItems,
        tableUtilization: utilization,
        ordersByStatus: statusMap,
        dailyData: [],
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiUsers,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      title: 'Average Order',
      value: `$${stats.averageOrder.toFixed(2)}`,
      icon: FiTrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      title: 'Table Utilization',
      value: `${stats.tableUtilization.toFixed(1)}%`,
      icon: FiCalendar,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  ]

  if (loading) {
    return (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['manager']}>
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </RoleRoute>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={['manager']}>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${card.bg} p-3 rounded-full`}>
                    <card.icon className={card.color} size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">Top Selling Items</h2>
              {stats.topItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {stats.topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.quantity} sold</div>
                        <div className="text-xs text-gray-500">${item.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">Order Status</h2>
              {Object.keys(stats.ordersByStatus).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'served' ? 'bg-green-500' :
                              status === 'rejected' ? 'bg-red-500' :
                              status === 'cancelled' ? 'bg-gray-500' :
                              'bg-blue-500'
                            }`}
                            style={{
                              width: `${(count / stats.totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Refresh Data
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </RoleRoute>
    </ProtectedRoute>
  )
}

export default Analytics