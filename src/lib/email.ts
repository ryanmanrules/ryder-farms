import { supabase } from './supabase'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    })
  } catch {
    // email failures are non-blocking
  }
}

function wrap(body: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#2C2C2C">
      <div style="background:#2C3B2D;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#A8C5A0;margin:0;font-size:20px;letter-spacing:0.5px">Ryder Farms</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #EEEBE8;border-top:none">
        ${body}
      </div>
      <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px">
        Ryder Farms · Maine Medical Caregiver · Cash only at pickup
      </p>
    </div>
  `
}

export function emailPriceInquiry(
  buyerName: string,
  buyerEmail: string,
  productName: string,
  productUnit: string,
) {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  return sendEmail(
    adminEmail,
    `Price inquiry — ${esc(productName)}`,
    wrap(`
      <h2 style="margin-top:0;color:#2C3B2D">Wholesale Price Inquiry</h2>
      <p>A wholesale buyer is interested in pricing for the following product:</p>
      <div style="background:#F5F3F0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px"><strong>${esc(productName)}</strong> / ${esc(productUnit)}</p>
      </div>
      <h3 style="color:#2C3B2D;margin-bottom:4px">Buyer</h3>
      <div style="background:#F5F3F0;border-radius:8px;padding:16px;margin:8px 0">
        <p style="margin:0 0 4px"><strong>${esc(buyerName)}</strong></p>
        <p style="margin:0;color:#666;font-size:14px">${esc(buyerEmail)}</p>
      </div>
      <p style="color:#888;font-size:13px;margin-top:16px">Reply directly to this email to follow up.</p>
    `)
  )
}

export function emailNewAccountAlert(name: string, email: string, accountType: 'patient' | 'wholesale') {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  return sendEmail(
    adminEmail,
    `New ${accountType} account — ${name}`,
    wrap(`
      <h2 style="margin-top:0;color:#2C3B2D">New account pending approval</h2>
      <p>A new <strong>${esc(accountType)}</strong> account has been created and needs your review.</p>
      <div style="background:#F5F3F0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px"><strong>${esc(name)}</strong></p>
        <p style="margin:0;color:#666;font-size:14px">${esc(email)}</p>
      </div>
      <a href="https://ryderfarmsmaine.com/admin/accounts"
        style="display:inline-block;background:#A8C5A0;color:#2C3B2D;font-weight:600;
               padding:12px 24px;border-radius:999px;text-decoration:none;margin-top:8px">
        Review in admin →
      </a>
    `)
  )
}

export function emailAccountApproved(to: string, name: string) {
  return sendEmail(
    to,
    'Your Ryder Farms account is approved',
    wrap(`
      <h2 style="margin-top:0;color:#2C3B2D">You're approved! 🌿</h2>
      <p>Hi ${esc(name)},</p>
      <p>Your Ryder Farms account has been approved. You can now browse the menu and place reservations.</p>
      <a href="https://ryderfarmsmaine.com/menu"
        style="display:inline-block;background:#A8C5A0;color:#2C3B2D;font-weight:600;
               padding:12px 24px;border-radius:999px;text-decoration:none;margin-top:8px">
        Browse the menu →
      </a>
      <p style="color:#888;font-size:13px;margin-top:24px">
        Bring your Maine Medical Program certification card to every pickup.
        Payment is cash only.
      </p>
    `)
  )
}

export function emailReservationConfirmed(
  to: string,
  name: string,
  productName: string,
  quantity: number,
  unit: string,
  total: number,
) {
  return sendEmail(
    to,
    `Reservation confirmed — ${productName}`,
    wrap(`
      <h2 style="margin-top:0;color:#2C3B2D">Reservation confirmed</h2>
      <p>Hi ${esc(name)}, your reservation is locked in.</p>
      <div style="background:#F5F3F0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 6px"><strong>${esc(productName)}</strong></p>
        <p style="margin:0 0 4px;color:#666;font-size:14px">Qty: ${quantity} ${esc(unit)}</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#2C3B2D">$${total} cash due at pickup</p>
      </div>
      <p style="color:#888;font-size:13px">
        Bring your Maine Medical Program certification card.
        We'll reach out if anything changes.
      </p>
    `)
  )
}

export function emailWaitlisted(
  to: string,
  name: string,
  productName: string,
  quantity: number,
) {
  return sendEmail(
    to,
    `Waitlist confirmed — ${productName}`,
    wrap(`
      <h2 style="margin-top:0;color:#2C3B2D">You're on the waitlist</h2>
      <p>Hi ${esc(name)},</p>
      <p>You've been added to the waitlist for <strong>${esc(productName)}</strong> (qty: ${quantity}).</p>
      <p>If a reservation above you is cancelled or new stock arrives, yours will be automatically confirmed
         and you'll get an email right away.</p>
      <p style="color:#888;font-size:13px">No action needed — we'll be in touch.</p>
    `)
  )
}

export function emailPromotedFromWaitlist(
  to: string,
  name: string,
  productName: string,
  quantity: number,
  unit: string,
  total: number,
) {
  return sendEmail(
    to,
    `Good news — you're confirmed for ${productName}`,
    wrap(`
      <h2 style="margin-top:0;color:#2C3B2D">You're off the waitlist! 🎉</h2>
      <p>Hi ${esc(name)},</p>
      <p>A spot opened up and your waitlist reservation for <strong>${esc(productName)}</strong> has been confirmed.</p>
      <div style="background:#F5F3F0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px;color:#666;font-size:14px">Qty: ${quantity} ${esc(unit)}</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#2C3B2D">$${total} cash due at pickup</p>
      </div>
      <p style="color:#888;font-size:13px">
        Bring your Maine Medical Program certification card.
      </p>
    `)
  )
}
