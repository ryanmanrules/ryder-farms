import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Reservation } from '../types'

const STATUS_LABEL: Record<string, string> = {
  pending:    'Confirmed',
  waitlisted: 'Waitlisted',
  fulfilled:  'Fulfilled',
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-green-50 text-green-700',
  waitlisted: 'bg-amber-50 text-amber-700',
  fulfilled:  'bg-brand-light text-brand-text/50',
}

export default function MyReservations() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth/login'); return }

    const { data } = await supabase
      .from('reservations')
      .select('*, product:products(*)')
      .eq('patient_id', user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    setReservations((data as Reservation[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function cancelReservation(r: Reservation) {
    if (!confirm(`Cancel your reservation for ${r.product?.name ?? 'this product'}?`)) return
    setCancelling(r.id)

    await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', r.id)

    if (r.status === 'pending') {
      const { data: next } = await supabase
        .from('reservations')
        .select('id')
        .eq('product_id', r.product_id)
        .eq('status', 'waitlisted')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (next) {
        await supabase.from('reservations').update({ status: 'pending' }).eq('id', next.id)
      }
    }

    setCancelling(null)
    load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold font-heading mb-1">My Reservations</h1>
      <p className="text-brand-text/50 text-sm mb-8">
        Confirmed reservations are held for pickup. Waitlisted reservations move up automatically if a spot opens.
      </p>

      {loading && <div className="text-brand-text/40 text-sm">Loading…</div>}

      {!loading && reservations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-brand-text/40 text-sm mb-4">No reservations yet.</p>
          <Link to="/menu" className="text-brand-accent hover:underline text-sm">
            Browse the menu →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {reservations.map((r) => {
          const subtotal = r.product ? (r.product.price * r.quantity).toFixed(2) : null

          return (
            <div key={r.id} className="border border-brand-light rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold font-heading text-sm">
                    {r.product?.name ?? 'Product'}
                  </p>
                  <p className="text-xs text-brand-text/50 mt-0.5">
                    Qty: {r.quantity} · {r.product?.unit} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {subtotal && (
                    <p className="text-xs text-brand-text/40 mt-0.5">
                      Cash total: <span className="font-semibold text-brand-text/60">${subtotal}</span> (tax-exempt)
                    </p>
                  )}
                  {r.status === 'waitlisted' && (
                    <p className="text-xs text-amber-600 mt-1">
                      You're on the waitlist — we'll confirm your spot if one opens up.
                    </p>
                  )}
                  {r.notes && (
                    <p className="text-xs text-brand-text/40 mt-1 italic">"{r.notes}"</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] ?? ''}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  {(r.status === 'pending' || r.status === 'waitlisted') && (
                    <button
                      onClick={() => cancelReservation(r)}
                      disabled={cancelling === r.id}
                      className="text-xs text-brand-text/30 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      {cancelling === r.id ? '…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
