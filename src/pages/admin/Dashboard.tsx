import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Stats {
  pendingCount: number
  waitlistCount: number
  pendingAccounts: number
  todayRevenue: number
  todaySales: number
  lowStock: { id: string; name: string; quantity: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    pendingCount: 0,
    waitlistCount: 0,
    pendingAccounts: 0,
    todayRevenue: 0,
    todaySales: 0,
    lowStock: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [pending, waitlist, pendingAccounts, todaySalesRes, lowStockRes] = await Promise.all([
        supabase.from('reservations').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('reservations').select('id', { count: 'exact' }).eq('status', 'waitlisted'),
        supabase.from('patients').select('id', { count: 'exact' }).eq('approved', false),
        supabase.from('sales').select('total').gte('created_at', today.toISOString()),
        supabase.from('products').select('id, name, quantity').eq('active', true).lt('quantity', 5).order('quantity'),
      ])

      const revenue = (todaySalesRes.data || []).reduce((sum, s) => sum + Number(s.total), 0)

      setStats({
        pendingCount: pending.count ?? 0,
        waitlistCount: waitlist.count ?? 0,
        pendingAccounts: pendingAccounts.count ?? 0,
        todayRevenue: revenue,
        todaySales: todaySalesRes.data?.length ?? 0,
        lowStock: (lowStockRes.data || []) as Stats['lowStock'],
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Confirmed Reservations', value: stats.pendingCount,    link: '/admin/reservations', accent: stats.pendingCount > 0 },
    { label: 'On Waitlist',            value: stats.waitlistCount,   link: '/admin/reservations', accent: false },
    { label: 'Pending Approvals',      value: stats.pendingAccounts, link: '/admin/accounts',     accent: stats.pendingAccounts > 0 },
    { label: "Today's Revenue",        value: `$${Math.round(stats.todayRevenue)}`, link: '/admin/sales', accent: false },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold font-heading mb-6">Dashboard</h1>

      {loading ? (
        <div className="text-brand-text/40 text-sm">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {cards.map((c) => (
              <Link
                key={c.label}
                to={c.link}
                className={`rounded-xl p-5 flex flex-col gap-1 hover:shadow-md transition-shadow ${
                  c.accent ? 'bg-brand-accent text-white' : 'bg-white'
                }`}
              >
                <span className={`text-3xl font-bold font-heading ${c.accent ? 'text-white' : 'text-brand-text'}`}>
                  {c.value}
                </span>
                <span className={`text-xs ${c.accent ? 'text-white/70' : 'text-brand-text/50'}`}>
                  {c.label}
                </span>
              </Link>
            ))}
          </div>

          {stats.lowStock.length > 0 && (
            <div className="bg-white rounded-xl p-5">
              <h2 className="font-semibold font-heading text-sm mb-3 text-amber-600">
                Low Stock Alerts
              </h2>
              <div className="space-y-2">
                {stats.lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-brand-text/80">{p.name}</span>
                    <span className={`font-semibold ${p.quantity === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                      {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/admin/inventory" className="text-brand-accent text-xs mt-3 block hover:underline">
                Manage inventory →
              </Link>
            </div>
          )}

          {stats.lowStock.length === 0 && !loading && (
            <div className="bg-white rounded-xl p-5 text-sm text-brand-text/40">
              All products are well stocked.
            </div>
          )}
        </>
      )}
    </div>
  )
}
