import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Sale } from '../../types'

function exportCSV(sales: Sale[]) {
  const headers = [
    'Date', 'Time', 'Patient', 'Cert #',
    'Product', 'Category', 'Qty', 'Unit',
    'Unit Price', 'Subtotal', 'Tax Rate', 'Tax', 'Total (Cash)',
  ]

  const rows = sales.map((s) => [
    new Date(s.created_at).toLocaleDateString('en-US'),
    new Date(s.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    s.patient?.full_name ?? '',
    s.patient?.certification_number ?? '',
    s.product?.name ?? '',
    s.product?.category ?? '',
    s.quantity,
    s.product?.unit ?? '',
    Number(s.unit_price).toFixed(2),
    (Number(s.unit_price) * s.quantity).toFixed(2),
    `${(Number(s.tax_rate) * 100).toFixed(1)}%`,
    Number(s.tax_collected).toFixed(2),
    Math.round(Number(s.total)),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ryder-farms-sales-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase
      .from('sales')
      .select('*, product:products(name, category, unit), patient:patients(full_name, certification_number)')
      .order('created_at', { ascending: false })
      .limit(200)
    setSales((data as Sale[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteSale(id: string) {
    if (!confirm('Delete this sales record? This only removes the log entry — the reservation and inventory are not affected.')) return
    setDeleting(id)
    await supabase.from('sales').delete().eq('id', id)
    setDeleting(null)
    load()
  }

  const todayStr     = new Date().toDateString()
  const todaySales   = sales.filter((s) => new Date(s.created_at).toDateString() === todayStr)
  const todayRevenue = todaySales.reduce((sum, s) => sum + Math.round(Number(s.total)), 0)
  const todayTax     = todaySales.reduce((sum, s) => sum + Number(s.tax_collected), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-xl font-bold font-heading">Sales Log</h1>
        {sales.length > 0 && (
          <button
            onClick={() => exportCSV(sales)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-darker text-white hover:bg-brand-accent transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: "Today's Sales",   value: todaySales.length },
          { label: "Today's Revenue", value: `$${todayRevenue}` },
          { label: 'Tax Collected',   value: `$${todayTax.toFixed(2)}` },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-3">
            <p className="text-xl font-bold font-heading">{c.value}</p>
            <p className="text-xs text-brand-text/50 mt-0.5 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      {loading && <div className="text-brand-text/40 text-sm">Loading…</div>}

      {!loading && sales.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-brand-text/40 text-sm">
          No sales recorded yet.
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden">
        {sales.map((s, i) => (
          <div
            key={s.id}
            className={`px-4 py-3 flex items-center gap-3 text-sm ${i > 0 ? 'border-t border-brand-light' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{s.product?.name ?? '—'}</p>
              <p className="text-xs text-brand-text/40">
                {s.patient?.full_name ?? '—'} · Cert #{s.patient?.certification_number ?? '—'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold">${Math.round(Number(s.total))}</p>
              <p className="text-xs text-brand-text/40">
                tax ${Number(s.tax_collected).toFixed(2)} · qty {s.quantity}
              </p>
            </div>
            <div className="hidden sm:block text-right shrink-0 text-xs text-brand-text/40 w-20">
              {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              <br />
              {new Date(s.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <button
              onClick={() => deleteSale(s.id)}
              disabled={deleting === s.id}
              title="Delete record"
              className="shrink-0 text-brand-text/20 hover:text-red-400 transition-colors disabled:opacity-40 ml-1"
            >
              {deleting === s.id ? (
                <span className="text-xs">…</span>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
