import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function friendlyError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'No account found with that email, or the password is incorrect.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Your account is pending approval. You will be notified once access is granted.'
  }
  return 'Something went wrong. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(friendlyError(error.message))
      return
    }

    const isAdmin = data.user?.email === import.meta.env.VITE_ADMIN_EMAIL
    const next = searchParams.get('next')
    navigate(isAdmin ? '/admin' : (next || '/menu'))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold font-heading mb-1 text-center">Sign In</h1>
        <p className="text-brand-text/50 text-sm text-center mb-8">
          Patient account required to place reservations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-brand-light rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-accent"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-accent text-brand-darker font-semibold py-3 rounded-full transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-text/50 mt-6">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-brand-accent hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
