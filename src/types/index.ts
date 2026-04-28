export type ProductCategory =
  | 'Flower'
  | 'Pre-Roll'
  | 'Concentrate'
  | 'Edible (Solid)'
  | 'Edible (Liquid/Tincture)'
  | 'Topical'
  | 'Vape Product'
  | 'Capsule'
  | 'Hash Rosin'
  | 'Cartridge'
  | 'Infused Non-Edible'

export const EDIBLE_CATEGORIES: ProductCategory[] = [
  'Edible (Solid)',
  'Edible (Liquid/Tincture)',
]

export const TAX_RATE_WHOLESALE = 0.14  // flat rate for all wholesale sales
// Patient sales are tax-exempt — no tax applied

export interface Product {
  id: string
  name: string
  category: ProductCategory
  strain: string | null
  thc_pct: number | null
  cbd_pct: number | null
  price: number
  wholesale_price: number | null
  unit: string
  quantity: number
  max_per_order: number
  active: boolean
  availability: 'both' | 'patient' | 'wholesale'
  image_url: string | null
  created_at: string
  // Computed by product_availability view
  available_qty?: number
  confirmed_qty?: number
  waitlist_count?: number
}

export interface Patient {
  id: string
  email: string
  full_name: string
  dob: string
  certification_number: string
  account_type: 'patient' | 'wholesale'
  approved: boolean
  rejected: boolean
  notification_prefs: string[]
  cert_card_paths: string[]
  created_at: string
}

export interface Reservation {
  id: string
  patient_id: string
  product_id: string
  quantity: number
  status: 'pending' | 'waitlisted' | 'fulfilled' | 'cancelled'
  notes: string | null
  created_at: string
  fulfilled_at: string | null
  product?: Product
  patient?: Patient
}

export interface Sale {
  id: string
  reservation_id: string
  patient_id: string
  product_id: string
  quantity: number
  unit_price: number
  tax_rate: number
  tax_collected: number
  total: number
  created_at: string
  product?: Product
  patient?: Patient
}

export interface InventoryLog {
  id: string
  product_id: string
  change_type: 'restock' | 'sale' | 'adjustment'
  quantity_change: number
  notes: string | null
  created_at: string
}
