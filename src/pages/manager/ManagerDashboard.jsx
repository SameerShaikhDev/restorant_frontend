import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiUsers, FiCoffee, FiTrendingUp, FiCalendar, 
  FiGrid, FiList, FiBarChart2,
  FiArrowRight, FiUserCheck
} from 'react-icons/fi'
import Navbar from '../../components/common/Navbar'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import RoleRoute from '../../components/common/RoleRoute'
import { orderService } from '../../services/orderService'
import { tableService } from '../../services/tableService'
import { menuService } from '../../services/menuService'
import api from '../../services/api'

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    tables: 0,
    menuItems: 0,
    revenue: 0,
  })
  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    fetchStaff()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, tablesRes, menuRes] = await Promise.allSettled([
        orderService.getAllOrders({ limit: 10 }),
        tableService.getTables(),
        menuService.getMenuItems(),
      ])
      
      let orders = []
      let tables = []
      let menuItems = []
      
      if (ordersRes.status === 'fulfilled') {
        orders = ordersRes.value.data.orders || []
      }
      if (tablesRes.status === 'fulfilled') {
        tables = tablesRes.value.data || []
      }
      if (menuRes.status === 'fulfilled') {
        menuItems = menuRes.value.data?.allItems || []
      }
      
      setRecentOrders(orders.slice(0, 5))
      
      const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      
      setStats({
        orders: orders.length,
        tables: tables.length,
        menuItems: menuItems.length,
        revenue: revenue,
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    setStaffLoading(true)
    try {
      const response = await api.get('/users')
      setStaff(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch staff:', error)
      setStaff([])
    } finally {
      setStaffLoading(false)
    }
  }

  const cards = [
    {
      title: 'Orders',
      value: stats.orders,
      icon: FiCoffee,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      link: '/manager/orders',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      icon: FiTrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-50',
      link: '/manager/analytics',
    },
    {
      title: 'Tables',
      value: stats.tables,
      icon: FiGrid,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      link: '/manager/tables',
    },
    {
      title: 'Menu Items',
      value: stats.menuItems,
      icon: FiList,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      link: '/manager/menu',
    },
  ]

  const quickActions = [
    { title: 'Manage Staff', icon: FiUsers, link: '/manager/staff' },
    { title: 'Manage Tables', icon: FiGrid, link: '/manager/tables' },
    { title: 'Manage Menu', icon: FiList, link: '/manager/menu' },
    { title: 'Analytics', icon: FiBarChart2, link: '/manager/analytics' },
  ]

  // Get today's online staff
  const onlineStaff = staff.filter(s => s.isActive !== false)

  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={['manager']}>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
            <p className="text-gray-500 mb-6">Welcome back! Here's what's happening today</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <Link to={card.link}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${card.bg} p-3 rounded-full`}>
                      <card.icon className={card.color} size={24} />
                    </div>
                    <FiArrowRight className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.title}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.link}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                    >
                      <action.icon className="text-gray-400 group-hover:text-primary transition" />
                      <span className="text-gray-700 group-hover:text-primary transition">
                        {action.title}
                      </span>
                      <FiArrowRight className="ml-auto text-gray-400 group-hover:text-primary transition" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Staff Online */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiUserCheck className="text-primary" />
                  Staff Online
                </h2>
                {staffLoading ? (
                  <p className="text-gray-500 text-center py-2">Loading...</p>
                ) : onlineStaff.length === 0 ? (
                  <p className="text-gray-500 text-center py-2">No staff online</p>
                ) : (
                  <div className="space-y-2">
                    {onlineStaff.map((s) => (
                      <div key={s._id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({s.role})</span>
                        </div>
                        <span className="text-xs text-green-600">🟢 Online</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Loading...</p>
                ) : recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order._id.slice(-6)}</span>
                            <span className="text-sm text-gray-500">
                              Table {order.tableNumber}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items?.length} items • {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            ${order.totalAmount?.toFixed(2)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'served' ? 'bg-green-100 text-green-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </RoleRoute>
    </ProtectedRoute>
  )
}

export default ManagerDashboard