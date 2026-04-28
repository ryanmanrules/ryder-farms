import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { calcTax } from '../lib/tax'
import { emailReservationConfirmed, emailWaitlisted } from '../lib/email'
import type { Product } from '../types'

export default function ReserveProduct() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const productId = searchParams.get('product')

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isWholesale, setIsWholesale] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: patient } = await supabase
          .from('patients').select('account_type').eq('id', user.id).maybeSingle()
        setIsWholesale(patient?.account_type === 'wholesale')
      }

      if (productId) {
        const { data } = await supabase
          .from('product_availability')
          .select('*')
          .eq('id', productId)
          .maybeSingle()
        setProduct(data as Product)
      }
      setLoading(false)
    }
    init()
  }, [productId])

  if (loading) return <div className="text-center py-24 text-brand-text/40">Loading…</div>

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-brand-text/40 mb-4">Product not found.</p>
        <Link to="/menu" className="text-brand-accent hover:underline text-sm">← Back to menu</Link>
      </div>
    )
  }

  const availableQty  = product.available_qty ?? product.quantity
  const maxQty        = Math.min(availableQty, product.max_per_order)
  const isWaitlist    = availableQty === 0
  const waitlistCount = product.waitlist_count ?? 0
  const tax           = calcTax(product.price, quantity, isWholesale)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      navigate(`/auth/login?next=/reservations/new?product=${productId}`)
      return
    }

    setSubmitting(true)
    setError('')

    const status = isWaitlist ? 'waitlisted' : 'pending'
    const { error } = await supabase.from('reservations').insert({
      patient_id: user.id,
      product_id: productId,
      quantity,
      notes: notes || null,
      status,
    })

    setSubmitting(false)

    if (error) {
      setError('Failed to submit reservation. Please try again.')
      return
    }

    const p = product!
    if (status === 'pending') {
      emailReservationConfirmed(
        user.email!,
        user.user_metadata?.full_name ?? user.email!,
        p.name,
        quantity,
        p.unit,
        tax.total,
      )
    } else {
      emailWaitlisted(
        user.email!,
        user.user_metadata?.full_name ?? user.email!,
        p.name,
        quantity,
      )
    }

    navigate('/reservations/confirmed')
  }

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/menu" className="text-brand-accent text-sm hover:underline block mb-6">
          ← Back to menu
        </Link>

        <h1 className="text-2xl font-bold font-heading mb-1">
          {isWaitlist ? 'Join Waitlist' : 'Reserve Product'}
        </h1>
        <p className="text-brand-text/50 text-sm mb-8">
          Reservations are held for pickup. Payment is cash only at time of pickup.
        </p>

        {/* Product summary */}
        <div className="bg-brand-light rounded-xl p-4 mb-6">
          <span className="text-brand-accent text-xs font-medium">{product.category}</span>
          <h2 className="font-semibold font-heading mt-0.5">{product.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-brand-text/60">${product.price} / {product.unit}</p>
            {isWaitlist ? (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                All reserved · {waitlistCount > 0 ? `${waitlistCount} ahead in queue` : "You'd be first in queue"}
              </span>
            ) : (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {availableQty} available
              </span>
            )}
          </div>
        </div>

        {isWaitlist && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 leading-relaxed">
            All current inventory is reserved. Joining the waitlist holds your place — if a
            reservation above you is cancelled or new stock arrives, yours will be confirmed next.
          </div>
        )}

        {/* Order total */}
        <div className="bg-brand-light rounded-xl p-4 mb-6 text-sm space-y-1.5">
          <div className="flex justify-between text-brand-text/60">
            <span>{quantity} × ${product.price} / {product.unit}</span>
            <span>${tax.subtotal.toFixed(2)}</span>
          </div>
          {isWholesale && (
            <div className="flex justify-between text-brand-text/60">
              <span>Tax ({(tax.taxRate * 100).toFixed(0)}%)</span>
              <span>${tax.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-black/10 pt-1.5">
            <span>Cash total</span>
            <span className="text-brand-accent">${tax.total}</span>
          </div>
          <p className="text-xs text-brand-text/40 pt-0.5">
            {isWholesale ? 'Wholesale rate includes 14% tax.' : 'Tax-exempt. Payment is cash only at time of pickup.'}
          </p>
        </div>

        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            You need to{' '}
            <Link to={`/auth/login?next=/reservations/new?product=${productId}`} className="font-semibold underline">
              sign in
            </Link>{' '}
            or{' '}
            <Link to="/auth/signup" className="font-semibold underline">create an account</Link>{' '}
            to place a reservation.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity
              <span className="text-brand-text/40 font-normal ml-1">
                (max {isWaitlist ? product.max_per_order : maxQty} per order)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-full border border-brand-light flex items-center justify-center text-lg hover:border-brand-accent transition-colors">
                −
              </button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button type="button"
                onClick={() => setQuantity(Math.min(isWaitlist ? product.max_per_order : maxQty, quantity + 1))}
                className="w-9 h-9 rounded-full border border-brand-light flex items-center justify-center text-lg hover:border-brand-accent transition-colors">
                +
              </button>
              <span className="text-sm text-brand-text/50 ml-1">× ${product.price}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes <span className="text-brand-text/40 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Preferred pickup time, questions, etc."
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !user}
            className="w-full bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold py-3 rounded-full transition-colors text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : isWaitlist ? 'Join Waitlist' : 'Submit Reservation'}
          </button>
        </form>

        <p className="text-xs text-brand-text/40 text-center mt-6 leading-relaxed">
          By reserving you confirm you are a registered Maine Medical Program patient.
          Certification card required at pickup.
        </p>
      </div>
    </div>
  )
}
