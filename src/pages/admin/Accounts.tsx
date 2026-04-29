import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { emailAccountApproved } from '../../lib/email'
import { logAdminAction } from '../../lib/audit'
import type { Patient } from '../../types'

function CertCardLinks({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    async function sign() {
      const signed = await Promise.all(
        paths.map(async (path) => {
          const { data } = await supabase.storage
            .from('patient-documents')
            .createSignedUrl(path, 60 * 10)
          return data?.signedUrl ?? ''
        })
      )
      setUrls(signed.filter(Boolean))
    }
    sign()
  }, [paths])

  if (urls.length === 0) return null

  return (
    <div className="flex gap-3 mt-1.5 flex-wrap">
      {urls.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-brand-accent underline hover:text-brand-darker"
        >
          View Card {urls.length > 1 ? (i === 0 ? '(Front)' : '(Back)') : ''}
        </a>
      ))}
    </div>
  )
}

type Filter = 'pending' | 'approved' | 'all'

export default function AdminAccounts() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')
  const [working, setWorking] = useState<string | null>(null)

  async function load() {
    const q = supabase.from('patients').select('*').order('created_at', { ascending: false })
    const { data } = filter === 'pending'
      ? await q.eq('approved', false).eq('rejected', false)
      : filter === 'approved'
        ? await q.eq('approved', true)
        : await q
    setPatients((data as Patient[]) || [])
    setLoading(false)
  }

  useEffect(() => { setLoading(true); load() }, [filter])

  async function approve(id: string) {
    setWorking(id)
    const { error } = await supabase.from('patients').update({ approved: true }).eq('id', id)
    if (error) { alert(`Failed to approve account: ${error.message}`); setWorking(null); return }
    const patient = patients.find((p) => p.id === id)
    if (patient) {
      emailAccountApproved(patient.email, patient.full_name)
      await logAdminAction('approve_account', 'patient', id, {
        name: patient.full_name, email: patient.email, account_type: patient.account_type,
      })
    }
    setWorking(null)
    load()
  }

  async function reject(id: string) {
    setWorking(id)
    const { error } = await supabase.from('patients').update({ rejected: true }).eq('id', id)
    if (error) { alert(`Failed to reject account: ${error.message}`); setWorking(null); return }
    const patient = patients.find((p) => p.id === id)
    if (patient) {
      await logAdminAction('reject_account', 'patient', id, {
        name: patient.full_name, email: patient.email, account_type: patient.account_type,
      })
    }
    setWorking(null)
    load()
  }

  async function deletePatient(id: string, name: string) {
    if (!confirm(`Permanently delete ${name}'s account? This cannot be undone.`)) return
    setWorking(id)
    await logAdminAction('delete_account', 'patient', id, { name })
    const { error } = await supabase.rpc('delete_patient_and_auth', { user_id: id })
    if (error) { alert(`Failed to delete account: ${error.message}`); setWorking(null); return }
    setWorking(null)
    load()
  }

  async function revoke(id: string) {
    setWorking(id)
    const { error } = await supabase.from('patients').update({ approved: false }).eq('id', id)
    if (error) { alert(`Failed to revoke account: ${error.message}`); setWorking(null); return }
    const patient = patients.find((p) => p.id === id)
    if (patient) {
      await logAdminAction('revoke_account', 'patient', id, {
        name: patient.full_name, email: patient.email,
      })
    }
    setWorking(null)
    load()
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'all',      label: 'All' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold font-heading mb-4">Accounts</h1>

      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 w-fit">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key ? 'bg-brand-accent text-white' : 'text-brand-text/50 hover:text-brand-text'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="text-brand-text/40 text-sm">Loading…</div>}

      {!loading && patients.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-brand-text/40 text-sm">
          No accounts in this view.
        </div>
      )}

      <div className="space-y-2">
        {patients.map((p) => (
          <div key={p.id} className="bg-white rounded-xl px-4 py-3 flex items-start gap-4">
            {/* Account type badge */}
            <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              p.account_type === 'wholesale'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {p.account_type === 'wholesale' ? 'Wholesale' : 'Patient'}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{p.full_name}</p>
              <p className="text-xs text-brand-text/40">{p.email}</p>
              {p.certification_number && (
                <p className="text-xs text-brand-text/40 mt-0.5">Cert # {p.certification_number}</p>
              )}
              {p.cert_card_paths?.length > 0 && (
                <CertCardLinks paths={p.cert_card_paths} />
              )}
            </div>

            {/* Date */}
            <div className="text-xs text-brand-text/40 shrink-0 hidden md:block pt-0.5">
              {new Date(p.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 items-center">
              {p.rejected ? (
                <button
                  onClick={() => deletePatient(p.id, p.full_name)}
                  disabled={working === p.id}
                  title="Delete record"
                  className="text-brand-text/20 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {working === p.id ? <span className="text-xs">…</span> : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              ) : p.approved ? (
                <button
                  onClick={() => revoke(p.id)}
                  disabled={working === p.id}
                  className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {working === p.id ? '…' : 'Revoke'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => approve(p.id)}
                    disabled={working === p.id}
                    className="text-xs px-3 py-1.5 rounded-full bg-brand-accent text-white hover:bg-brand-darker transition-colors disabled:opacity-40 font-semibold"
                  >
                    {working === p.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => reject(p.id)}
                    disabled={working === p.id}
                    className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
