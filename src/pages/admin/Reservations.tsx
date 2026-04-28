import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { calcTax } from '../../lib/tax'
import { emailPromotedFromWaitlist } from '../../lib/email'
import type { Reservation } from '../../types'

type Tab = 'pending' | 'waitlisted' | 'fulfilled' | 'cancelled'

export default function AdminReservations() {
  const [tab, setTab] = useState<Tab>('pending')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  async function load(status: Tab) {
    setLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select('*, product:products(*), patient:patients(*)')
      .eq('status', status)
      .order('created_at', { ascending: true })

    setReservations((data as Reservation[]) || [])
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function fulfill(r: Reservation) {
    if (!r.product) return
    setActing(r.id)

    const isWholesale = r.patient?.account_type === 'wholesale'
    const { taxRate, taxAmount: taxCollected, total } =
      calcTax(r.product.price, r.quantity, isWholesale)

    await Promise.all([
      supabase.from('reservations').update({
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
      }).eq('id', r.id),

      supabase.from('sales').insert({
        reservation_id: r.id,
        patient_id: r.patient_id,
        product_id: r.product_id,
        quantity: r.quantity,
        unit_price: r.product.price,
        tax_rate: taxRate,
        tax_collected: taxCollected,
        total,
      }),

      supabase.from('products').update({
        quantity: Math.max(0, r.product.quantity - r.quantity),
      }).eq('id', r.product_id),

      supabase.from('inventory_log').insert({
        product_id: r.product_id,
        change_type: 'sale',
        quantity_change: -r.quantity,
        notes: `Fulfilled reservation ${r.id}`,
      }),
    ])

    setActing(null)
    load(tab)
  }

  async function cancel(r: Reservation) {
    setActing(r.id)
    await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', r.id)

    // If a confirmed reservation is cancelled, promote the next waitlisted one
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
        // Fetch full reservation to send email
        const { data: promoted } = await supabase
          .from('reservations')
          .select('*, product:products(*), patient:patients(*)')
          .eq('id', next.id)
          .single()
        if (promoted?.patient && promoted?.product) {
          const t = calcTax(promoted.product.price, promoted.quantity, promoted.patient.account_type === 'wholesale')
          emailPromotedFromWaitlist(
            promoted.patient.email,
            promoted.patient.full_name,
            promoted.product.name,
            promoted.quantity,
            promoted.product.unit,
            t.total,
          )
        }
      }
    }

    setActing(null)
    load(tab)
  }

  async function deleteReservation(r: Reservation) {
    const label = r.product?.name ?? 'this reservation'
    if (!confirm(`Delete ${label} for ${r.patient?.full_name ?? 'this patient'}? This permanently removes the record.`)) return
    setActing(r.id)
    await supabase.from('reservations').delete().eq('id', r.id)
    setActing(null)
    load(tab)
  }

  async function promoteWaitlisted(r: Reservation) {
    setActing(r.id)
    await supabase.from('reservations').update({ status: 'pending' }).eq('id', r.id)
    if (r.patient && r.product) {
      const t = calcTax(r.product.price, r.quantity, r.patient?.account_type === 'wholesale')
      emailPromotedFromWaitlist(
        r.patient.email,
        r.patient.full_name,
        r.product.name,
        r.quantity,
        r.product.unit,
        t.total,
      )
    }
    setActing(null)
    load(tab)
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending',    label: 'Confirmed' },
    { key: 'waitlisted', label: 'Waitlisted' },
    { key: 'fulfilled',  label: 'Fulfilled' },
    { key: 'cancelled',  label: 'Cancelled' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold font-heading mb-4">Reservations</h1>

      <div className="flex gap-1.5 mb-6 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === key ? 'bg-brand-accent text-white' : 'bg-white text-brand-text/60 hover:text-brand-text'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="text-brand-text/40 text-sm">Loading…</div>}

      {!loading && reservations.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-brand-text/40 text-sm">
          No {tab} reservations.
        </div>
      )}

      <div className="space-y-3">
        {reservations.map((r, i) => {
          const isWholesale = r.patient?.account_type === 'wholesale'
          const tax = r.product ? calcTax(r.product.price, r.quantity, isWholesale) : null
          const taxSummary = tax
            ? isWholesale
              ? `Qty ${r.quantity} · $${tax.total} cash (incl. ${(tax.taxRate * 100).toFixed(1)}% tax)`
              : `Qty ${r.quantity} · $${tax.subtotal.toFixed(2)} cash (tax-exempt)`
            : `Qty ${r.quantity}`

          return (
          <div key={r.id} className="bg-white rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                {tab === 'waitlisted' && (
                  <span className="text-xs text-amber-600 font-semibold mr-2">
                    #{i + 1} in queue
                  </span>
                )}
                <p className="font-semibold font-heading text-sm inline">
                  {r.product?.name ?? '—'}
                </p>
                <span className={`ml-2 inline text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  isWholesale
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {isWholesale ? 'Wholesale' : 'Patient'}
                </span>
                <p className="text-xs text-brand-text/50 mt-0.5">
                  {r.patient?.full_name ?? r.patient_id} · Cert #{r.patient?.certification_number ?? '—'}
                </p>
                <p className="text-xs text-brand-text/40 mt-0.5">
                  {taxSummary}
                  {' · '}
                  {new Date(r.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </p>
                {r.notes && (
                  <p className="text-xs text-brand-text/40 italic mt-1">"{r.notes}"</p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                {tab === 'pending' && (
                  <>
                    <button onClick={() => fulfill(r)} disabled={acting === r.id}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      {acting === r.id ? '…' : 'Fulfill'}
                    </button>
                    <button onClick={() => cancel(r)} disabled={acting === r.id}
                      className="border border-brand-light text-brand-text/50 hover:text-red-500 hover:border-red-300 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      Cancel
                    </button>
                  </>
                )}

                {tab === 'waitlisted' && (
                  <>
                    <button onClick={() => promoteWaitlisted(r)} disabled={acting === r.id}
                      className="bg-brand-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-darker transition-colors disabled:opacity-50">
                      {acting === r.id ? '…' : 'Confirm'}
                    </button>
                    <button onClick={() => cancel(r)} disabled={acting === r.id}
                      className="border border-brand-light text-brand-text/50 hover:text-red-500 hover:border-red-300 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      Remove
                    </button>
                  </>
                )}

                {tab === 'fulfilled' && (
                  <div className="flex items-center gap-2">
                    {r.fulfilled_at && (
                      <span className="text-xs text-green-600">
                        Fulfilled {new Date(r.fulfilled_at).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => deleteReservation(r)}
                      disabled={acting === r.id}
                      title="Delete record"
                      className="text-brand-text/20 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      {acting === r.id ? <span className="text-xs">…</span> : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {tab === 'cancelled' && (
                  <button
                    onClick={() => deleteReservation(r)}
                    disabled={acting === r.id}
                    title="Delete record"
                    className="text-brand-text/20 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {acting === r.id ? <span className="text-xs">…</span> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
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
