import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../hooks/useAdmin'

const NAV = [
  { to: '/admin',              label: 'Dashboard',    icon: '⊞', end: true },
  { to: '/admin/reservations', label: 'Reservations', icon: '📋'           },
  { to: '/admin/accounts',     label: 'Accounts',     icon: '👥'           },
  { to: '/admin/inventory',    label: 'Inventory',    icon: '📦'           },
  { to: '/admin/sales',        label: 'Sales',        icon: '💰'           },
]

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/auth/login')
  }, [isAdmin, loading, navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return <div className="min-h-screen bg-brand-darker" />

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">

      {/* Top bar */}
      <header className="bg-brand-darker text-white px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white text-xs transition-colors">
            ← Site
          </Link>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-brand-primary font-heading font-semibold text-sm">
            Ryder Farms Admin
          </span>
        </div>
        <button onClick={handleLogout} className="text-white/40 hover:text-white text-xs transition-colors">
          Sign out
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <nav className="hidden md:flex w-44 bg-brand-dark text-white shrink-0 flex-col pt-6 gap-1 px-2">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-accent text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Main content — add bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-brand-dark border-t border-white/10 flex z-50">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand-primary' : 'text-white/40'
              }`
            }>
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
