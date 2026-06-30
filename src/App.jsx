import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/customer/Landing'
import Menu from './pages/customer/Menu'
import Checkout from './pages/customer/Checkout'
import OrderTracking from './pages/customer/OrderTracking'
import Login from './pages/auth/Login'
import KitchenDisplay from './pages/kitchen/KitchenDisplay'
import WaiterDashboard from './pages/waiter/WaiterDashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import StaffManagement from './pages/manager/StaffManagement'
import ProtectedRoute from './components/common/ProtectedRoute'
import RoleRoute from './components/common/RoleRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes - Always accessible */}
        <Route path="/" element={<Landing />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/tracking" element={<OrderTracking />} />
        
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Staff Routes - Protected */}
        <Route path="/kitchen" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['kitchen']}>
              <KitchenDisplay />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/waiter" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['waiter']}>
              <WaiterDashboard />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/manager" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/manager/staff" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['manager']}>
              <StaffManagement />
            </RoleRoute>
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App