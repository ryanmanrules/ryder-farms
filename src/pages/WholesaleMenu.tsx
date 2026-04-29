import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { emailPriceInquiry } from '../lib/email'
import type { Product, ProductCategory } from '../types'

const CATEGORIES: ProductCategory[] = ['Flower', 'Hash Rosin', 'Edible (Solid)', 'Cartridge']
type CategoryFilter = ProductCategory | 'All'

export default function WholesaleMenu() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth/login?next=/wholesale'); return }

      const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL
      if (!isAdmin) {
        const { data: patient } = await supabase
          .from('patients').select('approved, account_type, full_name, email').eq('id', user.id).maybeSingle()
        if (!patient?.approved) { navigate('/pending-approval'); return }
        if (patient.account_type !== 'wholesale') { navigate('/menu'); return }
        setBuyerName(patient.full_name)
        setBuyerEmail(patient.email)
      } else {
        setBuyerName('Admin')
        setBuyerEmail(user.email ?? '')
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, strain, thc_pct, cbd_pct, unit, quantity, active, image_url')
        .eq('active', true).eq('availability', 'wholesale')
        .order('category').order('name')

      if (error) setError('Unable to load products right now. Please try again.')
      else setProducts(data as Product[])
      setLoading(false)
    }
    init()
  }, [navigate])

  async function sendInquiry(product: Product) {
    setSendingId(product.id)
    await emailPriceInquiry(buyerName, buyerEmail, product.name, product.unit)
    setSentIds((prev) => new Set(prev).add(product.id))
    setSendingId(null)
  }

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory)

  if (loading && !error) return <div className="min-h-[80vh]" />

  return (
    <div>
      <section
        className="relative py-20 px-4 flex items-center justify-center text-center overflow-hidden"
        style={{ backgroundImage: `url('/hero-bg.webp')`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold font-heading mb-4 leading-tight drop-shadow-lg">
            Wholesale
          </h1>
          <p className="text-white/55 text-base md:text-lg max-w-lg mx-auto">
            Request current pricing on any product below and Mike will follow up directly.
          </p>
        </div>
      </section>
      <svg viewBox="0 0 1440 110" preserveAspectRatio="none" style={{ display: 'block', background: '#100908', marginBottom: '-2px' }} className="w-full" aria-hidden="true">
        <path d="M0,55 C360,0 1080,110 1440,55 L1440,110 L0,110 Z" fill="#EEEBE8" />
      </svg>

      <section className="py-10 px-4" style={{ background: '#EEEBE8' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {(['All', ...CATEGORIES] as CategoryFilter[]).map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand-accent text-white'
                    : 'bg-brand-light text-brand-text/70 hover:text-brand-text'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

          {!error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <WholesaleCard
                  key={product.id}
                  product={product}
                  sent={sentIds.has(product.id)}
                  sending={sendingId === product.id}
                  onInquire={() => sendInquiry(product)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-brand-text/40 col-span-full text-center py-16 text-sm">
                  No products available in this category right now.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function WholesaleCard({
  product, sent, sending, onInquire,
}: {
  product: Product
  sent: boolean
  sending: boolean
  onInquire: () => void
}) {
  const soldOut = product.quantity === 0

  return (
    <div className="rounded-xl border border-brand-light bg-white hover:border-brand-accent/40 hover:shadow-md flex flex-col transition-all overflow-hidden">
      {product.image_url && (
        <img src={product.image_url} alt={product.name} className="w-full h-44 object-cover" />
      )}
      <div className="flex items-start justify-between gap-2 px-5 pt-4">
        <div>
          <span className="text-brand-accent text-xs font-medium">{product.category}</span>
          <h3 className="font-semibold font-heading text-sm mt-0.5 leading-snug">{product.name}</h3>
        </div>
        {soldOut ? (
          <span className="shrink-0 text-xs bg-brand-light text-brand-text/40 px-2 py-0.5 rounded-full">Sold Out</span>
        ) : (
          <span className="shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">In Stock</span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-brand-text/50 px-5 mt-2">
        {product.thc_pct != null && <span>THC {product.thc_pct}%</span>}
        {product.cbd_pct != null && <span>CBD {product.cbd_pct}%</span>}
        <span>{product.unit}</span>
      </div>

      <div className="px-5 pb-5 mt-auto pt-4">
        {sent ? (
          <div className="text-center text-sm text-green-700 font-medium py-2 bg-green-50 rounded-full">
            Inquiry sent ✓
          </div>
        ) : (
          <button
            onClick={onInquire}
            disabled={sending}
            className="w-full text-center bg-brand-primary hover:bg-brand-accent text-brand-darker text-sm font-semibold py-2 rounded-full transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Price Inquiry'}
          </button>
        )}
      </div>
    </div>
  )
}
