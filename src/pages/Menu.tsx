import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product, ProductCategory } from '../types'

const CATEGORIES: ProductCategory[] = ['Flower', 'Hash Rosin', 'Edible (Solid)', 'Cartridge']

type CategoryFilter = ProductCategory | 'All'

export default function Menu() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth/login?next=/menu'); return }

      const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL
      if (!isAdmin) {
        const { data: patient } = await supabase
          .from('patients').select('approved, account_type').eq('id', user.id).maybeSingle()
        if (!patient?.approved) { navigate('/pending-approval'); return }
        if (patient.account_type === 'wholesale') { navigate('/wholesale'); return }
      }

      const { data, error } = await supabase
        .from('product_availability')
        .select('id, name, category, strain, thc_pct, cbd_pct, price, unit, quantity, max_per_order, active, availability, image_url, available_qty, confirmed_qty, waitlist_count')
        .eq('active', true).order('quantity', { ascending: false })

      if (error) setError('Unable to load menu right now. Please try again.')
      else setProducts(data as Product[])
      setLoading(false)
    }
    init()
  }, [navigate])

  const visible  = products.filter((p) => p.availability !== 'wholesale')
  const filtered = activeCategory === 'All' ? visible : visible.filter((p) => p.category === activeCategory)

  if (loading && !error) return <div className="min-h-[80vh]" />

  return (
    <div>
      <section
        className="relative py-20 px-4 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('/hero-bg.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold font-heading mb-4 leading-tight drop-shadow-lg">
            Patient Menu
          </h1>
          <p className="text-white/55 text-base md:text-lg max-w-lg mx-auto">
            Valid Maine Medical Program certification required. All sales are cash only.
            Prices shown are per unit as listed.
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
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-accent text-white'
                  : 'bg-brand-light text-brand-text/70 hover:text-brand-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

        {!error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} price={product.price} />
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

function ProductCard({ product, price }: { product: Product; price: number }) {
  const soldOut    = product.quantity === 0
  const available  = product.available_qty ?? product.quantity
  const isWaitlist = !soldOut && available === 0
  const btnLabel   = (soldOut || isWaitlist) ? 'Join Waitlist' : 'Reserve'

  let badge: React.ReactNode
  if (soldOut) {
    badge = (
      <span className="shrink-0 text-xs bg-brand-light text-brand-text/40 px-2 py-0.5 rounded-full">
        Sold Out
      </span>
    )
  } else if (isWaitlist) {
    badge = (
      <span className="shrink-0 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
        Waitlist
      </span>
    )
  } else {
    badge = (
      <span className="shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
        {available} available
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-brand-light bg-white hover:border-brand-accent/40 hover:shadow-md flex flex-col gap-3 transition-all overflow-hidden">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-44 object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2 px-5 pt-3">
        <div>
          <span className="text-brand-accent text-xs font-medium">{product.category}</span>
          <h3 className="font-semibold font-heading text-sm mt-0.5 leading-snug">{product.name}</h3>
        </div>
        {badge}
      </div>

      <div className="flex items-center gap-3 text-xs text-brand-text/50 px-5">
        {product.thc_pct != null && <span>THC {product.thc_pct}%</span>}
        {product.cbd_pct != null && <span>CBD {product.cbd_pct}%</span>}
        <span className="font-medium text-brand-text/70">${price} / {product.unit}</span>
      </div>

      <div className="px-5 pb-5 mt-auto">
        <Link
          to={`/reservations/new?product=${product.id}`}
          className="block text-center bg-brand-primary hover:bg-brand-accent text-brand-darker text-sm font-semibold py-2 rounded-full transition-colors"
        >
          {btnLabel}
        </Link>
      </div>
    </div>
  )
}
