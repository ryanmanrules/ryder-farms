import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, ProductCategory } from '../../types'

const ALL_CATEGORIES: ProductCategory[] = [
  'Flower','Pre-Roll','Concentrate','Hash Rosin',
  'Edible (Solid)','Edible (Liquid/Tincture)','Topical',
  'Vape Product','Cartridge','Capsule','Infused Non-Edible',
]

type FormState = {
  name: string
  category: ProductCategory
  strain: string
  thc_pct: number | null
  cbd_pct: number | null
  price: number
  wholesale_price: number | null
  unit: string
  quantity: number
  max_per_order: number
  active: boolean
  availability: 'patient' | 'wholesale'
  image_url: string | null
}

const BLANK: FormState = {
  name: '', category: 'Flower', strain: '', thc_pct: null,
  cbd_pct: null, price: 0, wholesale_price: null, unit: '¼ oz',
  quantity: 0, max_per_order: 4, active: true, availability: 'patient',
  image_url: null,
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...BLANK })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editQty, setEditQty] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('category')
      .order('name')
    setProducts((data as Product[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditingId(null)
    setForm({ ...BLANK })
    setImageFile(null)
    setImagePreview(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      category: p.category,
      strain: p.strain ?? '',
      thc_pct: p.thc_pct,
      cbd_pct: p.cbd_pct,
      price: p.price,
      wholesale_price: p.wholesale_price,
      unit: p.unit,
      quantity: p.quantity,
      max_per_order: p.max_per_order,
      active: p.active,
      availability: (p.availability === 'wholesale' ? 'wholesale' : 'patient'),
      image_url: p.image_url ?? null,
    })
    setImageFile(null)
    setImagePreview(p.image_url ?? null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ ...BLANK })
    setImageFile(null)
    setImagePreview(null)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(productId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${productId}/image.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) return null
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    // Bust cache with timestamp param
    return `${data.publicUrl}?t=${Date.now()}`
  }

  async function saveProduct() {
    setSaving(true)

    const payload = {
      name: form.name,
      category: form.category,
      strain: form.strain || null,
      thc_pct: form.thc_pct,
      cbd_pct: form.cbd_pct,
      price: form.price,
      wholesale_price: form.wholesale_price,
      unit: form.unit,
      quantity: form.quantity,
      max_per_order: form.max_per_order,
      active: form.active,
      availability: form.availability,
      image_url: form.image_url,
    }

    if (editingId) {
      // Edit existing product
      let imageUrl = form.image_url
      if (imageFile) {
        imageUrl = await uploadImage(editingId, imageFile)
      }
      await supabase.from('products').update({ ...payload, image_url: imageUrl }).eq('id', editingId)
    } else {
      // Insert new product
      const { data: inserted } = await supabase
        .from('products')
        .insert({ ...payload, image_url: null })
        .select('id')
        .single()

      if (inserted && imageFile) {
        const imageUrl = await uploadImage(inserted.id, imageFile)
        if (imageUrl) {
          await supabase.from('products').update({ image_url: imageUrl }).eq('id', inserted.id)
        }
      }
    }

    setSaving(false)
    closeForm()
    load()
  }

  async function updateQty(product: Product, newQty: number) {
    const diff = newQty - product.quantity
    await Promise.all([
      supabase.from('products').update({ quantity: newQty }).eq('id', product.id),
      supabase.from('inventory_log').insert({
        product_id: product.id,
        change_type: 'adjustment',
        quantity_change: diff,
        notes: 'Manual adjustment via admin',
      }),
    ])
    load()
  }

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    load()
  }

  function handleQtyKey(e: React.KeyboardEvent<HTMLInputElement>, product: Product) {
    if (e.key === 'Enter') {
      const val = parseInt(editQty[product.id] ?? '')
      if (!isNaN(val) && val >= 0) updateQty(product, val)
      setEditQty((prev) => { const n = { ...prev }; delete n[product.id]; return n })
    }
    if (e.key === 'Escape') {
      setEditQty((prev) => { const n = { ...prev }; delete n[product.id]; return n })
    }
  }

  const inputCls = 'w-full border border-brand-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-heading">Inventory</h1>
        <button
          onClick={openAdd}
          className="bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-darker transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5 mb-6 border border-brand-accent/20">
          <h2 className="font-semibold font-heading text-sm mb-4">
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-xs text-brand-text/50 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs text-brand-text/50 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))}
                className={inputCls}
              >
                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Strain */}
            <div>
              <label className="block text-xs text-brand-text/50 mb-1">Strain</label>
              <input
                value={form.strain}
                onChange={(e) => setForm(f => ({ ...f, strain: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Availability */}
            <div className="col-span-2">
              <label className="block text-xs text-brand-text/50 mb-1">Type</label>
              <div className="flex gap-2">
                {([
                  { value: 'patient',   label: 'Patient' },
                  { value: 'wholesale', label: 'Wholesale' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, availability: value }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      form.availability === value
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'border-brand-light text-brand-text/50 hover:border-brand-accent/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient-only fields */}
            {form.availability === 'patient' && (
              <div>
                <label className="block text-xs text-brand-text/50 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: +e.target.value }))}
                  className={inputCls}
                />
              </div>
            )}

            {/* Unit */}
            <div>
              <label className="block text-xs text-brand-text/50 mb-1">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* THC */}
            <div>
              <label className="block text-xs text-brand-text/50 mb-1">THC %</label>
              <input
                type="number"
                value={form.thc_pct ?? ''}
                onChange={(e) => setForm(f => ({ ...f, thc_pct: e.target.value ? +e.target.value : null }))}
                className={inputCls}
              />
            </div>

            {/* CBD */}
            <div>
              <label className="block text-xs text-brand-text/50 mb-1">CBD %</label>
              <input
                type="number"
                value={form.cbd_pct ?? ''}
                onChange={(e) => setForm(f => ({ ...f, cbd_pct: e.target.value ? +e.target.value : null }))}
                className={inputCls}
              />
            </div>

            {/* Qty */}
            <div>
              <label className="block text-xs text-brand-text/50 mb-1">Qty on Hand</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm(f => ({ ...f, quantity: +e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Max per order — patient only */}
            {form.availability === 'patient' && (
              <div>
                <label className="block text-xs text-brand-text/50 mb-1">Max Per Order</label>
                <input
                  type="number"
                  value={form.max_per_order}
                  onChange={(e) => setForm(f => ({ ...f, max_per_order: +e.target.value }))}
                  className={inputCls}
                />
              </div>
            )}

            {/* Image upload — full width */}
            <div className="col-span-2">
              <label className="block text-xs text-brand-text/50 mb-1">Product Image</label>
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-brand-light shrink-0"
                  />
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-brand-accent/40 text-brand-accent text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-brand-accent/5 transition-colors w-full"
                  >
                    {imagePreview ? '↑ Replace image' : '↑ Upload image'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                        setForm(f => ({ ...f, image_url: null }))
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="mt-1.5 text-xs text-red-400 hover:text-red-600 w-full text-center"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={saveProduct}
              disabled={saving || !form.name}
              className="bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-50 hover:bg-brand-darker transition-colors"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
            </button>
            <button
              onClick={closeForm}
              className="border border-brand-light text-brand-text/50 text-sm px-4 py-2 rounded-full hover:border-brand-text/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div className="text-brand-text/40 text-sm">Loading…</div>}

      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-xl px-4 py-3 flex items-center gap-3 ${!p.active ? 'opacity-50' : ''}`}
          >
            {/* Thumbnail */}
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-brand-light"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-brand-light shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-text/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-brand-text/40">
                {p.category}
                {p.availability === 'wholesale'
                  ? ` · ${p.unit} · Price on inquiry`
                  : ` · $${p.price}/${p.unit}`}
                {p.thc_pct != null && ` · THC ${p.thc_pct}%`}
              </p>
              <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full ${
                p.availability === 'wholesale'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-green-50 text-green-700'
              }`}>
                {p.availability === 'wholesale' ? 'Wholesale' : 'Patient'}
              </span>
            </div>

            {/* Inline quantity editor */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateQty(p, Math.max(0, p.quantity - 1))}
                className="w-7 h-7 rounded-full border border-brand-light text-sm hover:border-brand-accent flex items-center justify-center transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={editQty[p.id] ?? p.quantity}
                onChange={(e) => setEditQty(prev => ({ ...prev, [p.id]: e.target.value }))}
                onKeyDown={(e) => handleQtyKey(e, p)}
                onBlur={() => {
                  const val = parseInt(editQty[p.id] ?? '')
                  if (!isNaN(val) && val >= 0 && val !== p.quantity) updateQty(p, val)
                  setEditQty((prev) => { const n = { ...prev }; delete n[p.id]; return n })
                }}
                className="w-12 text-center text-sm border border-brand-light rounded-lg py-1 focus:outline-none focus:border-brand-accent"
              />
              <button
                onClick={() => updateQty(p, p.quantity + 1)}
                className="w-7 h-7 rounded-full border border-brand-light text-sm hover:border-brand-accent flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>

            {/* Active toggle */}
            <button
              onClick={() => toggleActive(p)}
              className={`text-xs px-2.5 py-1 rounded-full border shrink-0 transition-colors ${
                p.active
                  ? 'border-green-200 text-green-700 hover:border-red-200 hover:text-red-500'
                  : 'border-brand-light text-brand-text/40 hover:border-green-200 hover:text-green-600'
              }`}
            >
              {p.active ? 'Active' : 'Hidden'}
            </button>

            {/* Edit button */}
            <button
              onClick={() => openEdit(p)}
              title="Edit product"
              className="shrink-0 text-brand-text/30 hover:text-brand-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
