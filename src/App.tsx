import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { inject } from '@vercel/analytics'
import AgeGate from './components/AgeGate'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import Menu from './pages/Menu'
import WholesaleMenu from './pages/WholesaleMenu'
import PendingApproval from './pages/PendingApproval'
import ReserveProduct from './pages/ReserveProduct'
import ReservationConfirmed from './pages/ReservationConfirmed'
import MyReservations from './pages/MyReservations'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminDashboard from './pages/admin/Dashboard'
import AdminReservations from './pages/admin/Reservations'
import AdminInventory from './pages/admin/Inventory'
import AdminSales from './pages/admin/Sales'
import AdminAccounts from './pages/admin/Accounts'
import AdminSettings from './pages/admin/Settings'
import Privacy from './pages/Privacy'
import Services from './pages/Services'

inject()

export default function App() {
  const [ageVerified, setAgeVerified] = useState(
    () => localStorage.getItem('age_verified') === 'true'
  )

  if (!ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Patient-facing */}
        <Route element={<Layout />}>
          <Route path="/"                       element={<Home />} />
          <Route path="/about"                  element={<About />} />
          <Route path="/services"               element={<Services />} />
          <Route path="/menu"                   element={<Menu />} />
          <Route path="/wholesale"              element={<WholesaleMenu />} />
          <Route path="/pending-approval"       element={<PendingApproval />} />
          <Route path="/reservations/new"       element={<ReserveProduct />} />
          <Route path="/reservations/confirmed" element={<ReservationConfirmed />} />
          <Route path="/reservations"           element={<MyReservations />} />
          <Route path="/auth/login"             element={<Login />} />
          <Route path="/auth/signup"            element={<Signup />} />
          <Route path="/privacy"               element={<Privacy />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path="/admin"                  element={<AdminDashboard />} />
          <Route path="/admin/reservations"     element={<AdminReservations />} />
          <Route path="/admin/accounts"         element={<AdminAccounts />} />
          <Route path="/admin/inventory"        element={<AdminInventory />} />
          <Route path="/admin/sales"            element={<AdminSales />} />
          <Route path="/admin/settings"         element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
