import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Patient } from '../types'

export default function PendingApproval() {
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { navigate('/auth/login'); return }
      if (user.email === import.meta.env.VITE_ADMIN_EMAIL) { navigate('/admin'); return }
      const { data } = await supabase.from('patients').select('*').eq('id', user.id).maybeSingle()
      if (data) {
        if ((data as Patient).approved) {
          navigate((data as Patient).account_type === 'wholesale' ? '/wholesale' : '/menu')
        } else {
          setPatient(data as Patient)
        }
      }
    })
  }, [navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!patient) return <div className="min-h-[80vh]" />

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold font-heading mb-3">Account Pending Approval</h1>

        {patient.account_type === 'patient' ? (
          <p className="text-brand-text/60 text-sm leading-relaxed mb-2">
            Thanks for signing up, <strong>{patient.full_name}</strong>. Mike is reviewing your
            Maine Medical certification number before granting access to the patient menu.
          </p>
        ) : (
          <p className="text-brand-text/60 text-sm leading-relaxed mb-2">
            Thanks for signing up, <strong>{patient.full_name}</strong>. Your wholesale account
            is pending review. Mike will reach out once your account is approved.
          </p>
        )}

        <p className="text-brand-text/40 text-xs mb-8">
          You'll be able to access the menu after approval. Questions? Call{' '}
          <a href="tel:2074508798" className="text-brand-accent hover:underline">207-450-8798</a>.
        </p>

        <button
          onClick={handleSignOut}
          className="text-sm text-brand-text/50 hover:text-brand-text transition-colors underline underline-offset-2"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
