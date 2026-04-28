import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { emailNewAccountAlert } from '../../lib/email'

function CardUpload({
  label, file, onChange, required,
}: {
  label: string
  file: File | null
  onChange: (f: File | null) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg px-3 py-5 cursor-pointer transition-colors ${
        file ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-light hover:border-brand-accent/50'
      }`}>
        <input type="file" accept="image/*" className="hidden" required={required}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        {file ? (
          <span className="text-sm text-brand-accent font-medium truncate max-w-full px-2">{file.name}</span>
        ) : (
          <>
            <svg className="w-6 h-6 text-brand-text/30 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs text-brand-text/40">Tap to upload photo</span>
          </>
        )}
      </label>
    </div>
  )
}

export default function Signup() {
  const [accountType, setAccountType] = useState<'patient' | 'wholesale'>('patient')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    dob: '',
    certNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [cardFront, setCardFront] = useState<File | null>(null)
  const [cardBack, setCardBack]   = useState<File | null>(null)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function isAtLeast21(dob: string): boolean {
    const born = new Date(dob)
    if (isNaN(born.getTime())) return false
    const today = new Date()
    const age = today.getFullYear() - born.getFullYear()
    const m = today.getMonth() - born.getMonth()
    return age > 21 || (age === 21 && (m > 0 || (m === 0 && today.getDate() >= born.getDate())))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!form.dob) {
      setError('Please enter your date of birth.')
      return
    }

    if (!isAtLeast21(form.dob)) {
      setError('You must be 21 or older to create an account.')
      return
    }

    if (accountType === 'patient' && !cardFront) {
      setError('Please upload your medical certification card.')
      return
    }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          dob: form.dob,
          certification_number: accountType === 'patient' ? form.certNumber : null,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      if (data.session) await supabase.auth.setSession(data.session)

      const uploadedPaths: string[] = []

      if (accountType === 'patient') {
        const filesToUpload: [string, File][] = [['front', cardFront!]]
        if (cardBack) filesToUpload.push(['back', cardBack])
        for (const [side, file] of filesToUpload) {
          const ext  = file.name.split('.').pop()
          const path = `cert-cards/${data.user.id}/${side}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('patient-documents').upload(path, file, { upsert: true })
          if (!uploadError) uploadedPaths.push(path)
        }
      }

      const { error: insertError } = await supabase.from('patients').insert({
        id: data.user.id,
        email: form.email,
        full_name: form.fullName,
        dob: form.dob,
        certification_number: accountType === 'patient' ? form.certNumber : '',
        account_type: accountType,
        approved: false,
        notification_prefs: [],
        cert_card_paths: uploadedPaths,
      })

      if (insertError) {
        setError(`Account created but profile save failed: ${insertError.message}`)
        setLoading(false)
        return
      }
    }

    emailNewAccountAlert(form.fullName, form.email, accountType)
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-heading mb-3">Account Created</h1>
          <p className="text-brand-text/60 text-sm leading-relaxed mb-2">
            Your account is pending review. You'll be able to sign in and access the menu once it's approved.
          </p>
          <p className="text-brand-text/40 text-xs mb-8">
            Questions? Call{' '}
            <a href="tel:2074508798" className="text-brand-accent hover:underline">207-450-8798</a>.
          </p>
          <Link to="/" className="text-sm text-brand-accent hover:underline">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold font-heading mb-1 text-center">Create Account</h1>
        <p className="text-brand-text/50 text-sm text-center mb-6">
          Your account will be reviewed before you can access the menu.
        </p>

        {/* Account type selector */}
        <div className="flex rounded-full border border-brand-light overflow-hidden mb-6">
          {(['patient', 'wholesale'] as const).map((type) => (
            <button key={type} type="button" onClick={() => setAccountType(type)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                accountType === type ? 'bg-brand-accent text-white' : 'text-brand-text/50 hover:text-brand-text'
              }`}>
              {type === 'patient' ? 'Patient' : 'Wholesale Buyer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange}
              placeholder="MM/DD/YYYY"
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent"
              style={{ colorScheme: 'light' }}
            />
            <p className="text-xs text-brand-text/40 mt-1">You must be 21 or older to register.</p>
          </div>

          {accountType === 'patient' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Maine Medical Certification Number</label>
                <input type="text" name="certNumber" value={form.certNumber} onChange={handleChange}
                  className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CardUpload label="Medical Card" file={cardFront} onChange={setCardFront} required />
                <CardUpload label="Additional Verification" file={cardBack} onChange={setCardBack} />
              </div>
              <p className="text-xs text-brand-text/40 -mt-1">
                Required for account verification. View our{' '}
                <Link to="/privacy" className="text-brand-accent hover:underline">privacy policy</Link>.
              </p>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent" required />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold py-3 rounded-full transition-colors text-sm disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-text/50 mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-brand-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
