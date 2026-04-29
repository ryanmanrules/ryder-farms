import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL    = Deno.env.get('ADMIN_EMAIL')

const ALLOWED_ORIGINS = [
  'https://ryderfarmsmaine.com',
  'https://www.ryderfarmsmaine.com',
  'https://ryder-farms-app.vercel.app',
]

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')
    ? origin
    : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const cors = corsHeaders(req)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  // Require a valid Supabase session — reject unauthenticated callers
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { to, subject, html } = await req.json()

    // Only allow sending to the admin address or the caller's own email
    const allowedRecipients = [ADMIN_EMAIL, user.email].filter(Boolean)
    if (!allowedRecipients.includes(to)) {
      return new Response(JSON.stringify({ error: 'Forbidden recipient' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ryder Farms <mike@ryderfarmsmaine.com>',
        to: [to],
        subject,
        html,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...cors, 'Content-Type': 'application/json' },
      status: res.ok ? 200 : 400,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
