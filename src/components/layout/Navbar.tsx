import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Patient } from '../../types'

const BASE_NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL

  async function loadPatient(userId: string) {
    const { data } = await supabase.from('patients').select('approved, account_type').eq('id', userId).maybeSingle()
    setPatient(data as Patient | null)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
      if (user) loadPatient(user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) loadPatient(session.user.id)
      else setPatient(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const isAdmin             = userEmail === adminEmail
  const isApprovedPatient   = !isAdmin && patient?.approved === true && patient.account_type === 'patient'
  const isApprovedWholesale = !isAdmin && patient?.approved === true && patient.account_type === 'wholesale'

  const NAV_LINKS = [
    ...BASE_NAV,
    ...(isAdmin || isApprovedPatient   ? [{ to: '/menu',      label: 'Patient Menu' }] : []),
    ...(isAdmin || isApprovedWholesale ? [{ to: '/wholesale',  label: 'Wholesale'    }] : []),
  ]

  async function handleSignOut() {
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-brand-light shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo.png"
            alt="Ryder Farms Maine"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-accent' : 'text-brand-text/65 hover:text-brand-text'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://www.instagram.com/ryderfarmsmaine"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-brand-text/40 hover:text-brand-accent transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="tel:2074508798" className="text-xs text-brand-text/60 hover:text-brand-text transition-colors">
            207-450-8798
          </a>
          {isAdmin && (
            <Link to="/admin" className="text-xs font-semibold text-brand-accent hover:underline">
              Admin
            </Link>
          )}
          {userEmail && !isAdmin && (
            <Link to="/reservations" className="text-sm font-medium text-brand-text/65 hover:text-brand-text transition-colors">
              My Reservations
            </Link>
          )}
          {userEmail ? (
            <button onClick={handleSignOut} className="text-sm font-medium text-brand-text/65 hover:text-brand-text transition-colors">
              Sign Out
            </button>
          ) : (
            <Link to="/auth/login" className="text-sm font-medium text-brand-text/65 hover:text-brand-text transition-colors">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-brand-text/70"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-light bg-white px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-brand-accent' : 'text-brand-text/70'}`}>
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-brand-accent">
              Admin Panel
            </Link>
          )}
          {userEmail && !isAdmin && (
            <Link to="/reservations" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-brand-text/70">
              My Reservations
            </Link>
          )}
          {userEmail ? (
            <button onClick={handleSignOut} className="text-sm font-medium text-brand-text/70 text-left">
              Sign Out
            </button>
          ) : (
            <Link to="/auth/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-brand-text/70">
              Sign In
            </Link>
          )}
          <a
            href="https://www.instagram.com/ryderfarmsmaine"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-brand-text/70"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
        </div>
      )}
    </nav>
  )
}
