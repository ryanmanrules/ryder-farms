import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(user?.email === import.meta.env.VITE_ADMIN_EMAIL)
      setLoading(false)
    })
  }, [])

  return { isAdmin, loading }
}
