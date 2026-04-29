import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { emailRestockNotification } from '../../lib/email'
import { logAdminAction } from '../../lib/audit'

export default function AdminSettings() {
  const [harvestMessage, setHarvestMessage] = useState('')
  const [savedMessage, setSavedMessage]     = useState('')
  const [saving, setSaving]                 = useState(false)
  const [saveStatus, setSaveStatus]         = useState<'idle' | 'saved' | 'error'>('idle')

  const [subscribers, setSubscribers] = useState<{ id: string; email: string; full_name: string }[]>([])
  const [sending, setSending]         = useState(false)
  const [sentCount, setSentCount]     = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: setting }, { data: subs }] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', 'wholesale_harvest_message').maybeSingle(),
        supabase.from('restock_subscribers').select('id, email, patient:patients(full_name)'),
      ])
      if (setting) { setHarvestMessage(setting.value); setSavedMessage(setting.value) }
      if (subs) {
        setSubscribers(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (subs as any[]).map((s) => ({ id: s.id, email: s.email, full_name: s.patient?.full_name ?? s.email }))
        )
      }
    }
    load()
  }, [])

  async function saveMessage() {
    setSaving(true)
    setSaveStatus('idle')
    const { error } = await supabase
      .from('site_settings')
      .update({ value: harvestMessage, updated_at: new Date().toISOString() })
      .eq('key', 'wholesale_harvest_message')
    if (error) {
      setSaveStatus('error')
    } else {
      setSavedMessage(harvestMessage)
      setSaveStatus('saved')
      await logAdminAction('update_setting', 'site_settings', 'wholesale_harvest_message', {
        value: harvestMessage,
      })
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
    setSaving(false)
  }

  async function sendRestockEmails() {
    if (subscribers.length === 0) return
    if (!confirm(`Send restock notification to ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}?`)) return
    setSending(true)
    setSentCount(null)
    let count = 0
    for (const sub of subscribers) {
      await emailRestockNotification(sub.email, sub.full_name)
      count++
    }
    await logAdminAction('send_restock_notification', 'restock_subscribers', 'all', {
      recipient_count: count,
    })
    setSentCount(count)
    setSending(false)
  }

  const isDirty = harvestMessage !== savedMessage

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-xl font-bold font-heading">Settings</h1>

      {/* Harvest message */}
      <div className="bg-white rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold font-heading text-sm">Wholesale Harvest Notice</h2>
          <p className="text-xs text-brand-text/50 mt-1">
            Shown on the wholesale page in place of the product grid. Clear it to show products instead.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
            "The next harvest session will be…"
          </label>
          <input
            type="text"
            value={harvestMessage}
            onChange={(e) => { setHarvestMessage(e.target.value); setSaveStatus('idle') }}
            placeholder="e.g. Early November 2026"
            className="w-full border border-brand-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
          />
          <p className="text-xs text-brand-text/40 mt-1">Leave blank to show the product grid instead.</p>
        </div>

        {harvestMessage && (
          <div className="bg-brand-light rounded-lg px-4 py-3 text-sm text-brand-text/70">
            <span className="font-medium text-brand-text">Preview: </span>
            The next harvest session will be <span className="font-semibold text-brand-text">{harvestMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={saveMessage}
            disabled={saving || !isDirty}
            className="bg-brand-accent text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-brand-darker transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saveStatus === 'saved' && <span className="text-xs text-green-600">Saved ✓</span>}
          {saveStatus === 'error' && <span className="text-xs text-red-500">Save failed</span>}
        </div>
      </div>

      {/* Restock notifications */}
      <div className="bg-white rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold font-heading text-sm">Restock Notifications</h2>
          <p className="text-xs text-brand-text/50 mt-1">
            Wholesale customers who asked to be notified when new inventory is available.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-brand-light rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="text-2xl font-bold font-heading text-brand-accent">{subscribers.length}</span>
            <span className="text-xs text-brand-text/60">
              {subscribers.length === 1 ? 'person waiting' : 'people waiting'}
            </span>
          </div>
        </div>

        {subscribers.length > 0 && (
          <>
            <div className="border border-brand-light rounded-lg divide-y divide-brand-light max-h-48 overflow-y-auto">
              {subscribers.map((s) => (
                <div key={s.id} className="px-3 py-2 text-xs text-brand-text/60">
                  {s.full_name !== s.email ? (
                    <><span className="font-medium text-brand-text">{s.full_name}</span> · {s.email}</>
                  ) : (
                    s.email
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={sendRestockEmails}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending…' : `Notify ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}
              </button>
              {sentCount !== null && (
                <span className="text-xs text-green-600">Sent to {sentCount} ✓</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
