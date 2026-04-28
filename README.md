# Ryder Farms — Patient Reservation App

A PWA for Maine medical cannabis caregivers. Patients browse inventory, place reservations, and join waitlists. Admins manage inventory, approve accounts, fulfill orders, and export sales records.

---

## Stack

- **Frontend** — React + TypeScript + Vite, Tailwind CSS v4
- **Backend** — Supabase (Postgres, Auth, Storage, Edge Functions)
- **Email** — Resend via Supabase Edge Function
- **Hosting** — Vercel

---

## Environment Variables

Create a `.env` file in the project root (never commit this):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=admin@yourdomain.com
```

On Vercel, add these under **Project → Settings → Environment Variables**.

---

## Supabase Setup

### Tables

Run these in the Supabase SQL editor if starting fresh:

```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  strain text,
  thc_pct numeric,
  cbd_pct numeric,
  price numeric not null,
  wholesale_price numeric,
  unit text not null,
  quantity integer not null default 0,
  max_per_order integer not null default 4,
  active boolean not null default true,
  availability text not null default 'both',
  image_url text,
  created_at timestamptz default now()
);

create table public.patients (
  id uuid primary key references auth.users(id),
  email text not null,
  full_name text not null,
  dob text not null,
  certification_number text,
  account_type text not null default 'patient',
  approved boolean not null default false,
  notification_prefs text[] default '{}',
  cert_card_paths text[] default '{}',
  created_at timestamptz default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id),
  product_id uuid references public.products(id),
  quantity integer not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now(),
  fulfilled_at timestamptz
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.reservations(id),
  patient_id uuid references auth.users(id),
  product_id uuid references public.products(id),
  quantity integer not null,
  unit_price numeric not null,
  tax_rate numeric not null,
  tax_collected numeric not null,
  total numeric not null,
  created_at timestamptz default now()
);

create table public.inventory_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  change_type text not null,
  quantity_change integer not null,
  notes text,
  created_at timestamptz default now()
);
```

### Product Availability View

```sql
create view product_availability as
select
  p.*,
  p.quantity
    - coalesce(sum(r.quantity) filter (where r.status = 'pending'), 0)
    as available_qty,
  coalesce(sum(r.quantity) filter (where r.status = 'pending'), 0)
    as confirmed_qty,
  count(r.id) filter (where r.status = 'waitlisted')
    as waitlist_count
from products p
left join reservations r on r.product_id = p.id
group by p.id;
```

If columns are added to `products` later, refresh the view with:

```sql
drop view if exists product_availability;
-- then re-run the create view above
```

### RLS Policies

Enable RLS on all tables, then add:

```sql
create policy "Patients read own" on patients
  for select using (auth.uid() = id);

create policy "Patients update own" on patients
  for update using (auth.uid() = id);

create policy "Patients insert reservations" on reservations
  for insert with check (auth.uid() = patient_id);

create policy "Patients read own reservations" on reservations
  for select using (auth.uid() = patient_id);

create policy "Patients cancel own reservations" on reservations
  for update using (auth.uid() = patient_id)
  with check (auth.uid() = patient_id);

create policy "Authenticated read products" on products
  for select using (auth.role() = 'authenticated');
```

Admin access is handled via `VITE_ADMIN_EMAIL` on the frontend — that user bypasses patient approval checks.

### Storage Buckets

**`patient-documents`** — private, stores certification card uploads

**`product-images`** — public, stores product photos. Add two policies under Storage → product-images → Policies:
- INSERT: role `authenticated`, definition `true`
- UPDATE: role `authenticated`, definition `true`

---

## Email (Supabase Edge Function)

Create the function in **Supabase → Edge Functions → New function**, name it `send-email`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { to, subject, html } = await req.json()
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
      headers: { ...CORS, 'Content-Type': 'application/json' },
      status: res.ok ? 200 : 400,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

Add secret under **Edge Functions → send-email → Secrets**:
- Key: `RESEND_API_KEY` · Value: Resend API key

Emails trigger on: account approved, reservation confirmed, added to waitlist, promoted off waitlist.

---

## Deployment

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

The Vercel preview URL works independently for testing before DNS cutover.

### Going Live (DNS cutover)

1. Vercel → Project → Domains → add the production domain
2. Vercel shows DNS records to add
3. In Namecheap → Advanced DNS → update A/CNAME to Vercel's values
4. Propagation: 15–60 minutes

All Supabase data persists across cutover — nothing needs to be migrated.

---

## New Client Onboarding (~3–5 hours)

1. Create Supabase project, run SQL above
2. Create storage buckets + policies
3. Set up Resend domain, create Edge Function, add secret
4. Copy repo, update `.env` and branding (`src/index.css` for colors, `src/pages/` for copy/logo)
5. Create Vercel project, add env vars, deploy
6. Configure client domain DNS

---

## Tax Rates (Maine)

- Standard products: **5.5%**
- Edibles (solid + liquid/tincture): **8.0%**
- Totals rounded to nearest dollar — no coins needed at pickup
- Constants in `src/types/index.ts`, logic in `src/lib/tax.ts`

---

## Key Files

```
src/
  lib/
    supabase.ts          Supabase client
    tax.ts               Maine cannabis tax calculation
    email.ts             Email templates + send helper
  pages/
    admin/
      Dashboard.tsx      Stats overview (reservations, approvals, revenue)
      Accounts.tsx       Patient approval + cert card review
      Inventory.tsx      Product management + image upload
      Reservations.tsx   Fulfill / cancel / waitlist management
      Sales.tsx          Sales log + CSV export
    Menu.tsx             Patient product menu
    WholesaleMenu.tsx    Wholesale product menu
    ReserveProduct.tsx   Reservation + waitlist form
    MyReservations.tsx   Patient reservation history + self-cancel
  types/
    index.ts             Shared types, product categories, tax constants
```
