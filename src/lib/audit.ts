import { supabase } from './supabase'

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>,
) {
  console.log('[audit] logAdminAction called:', action, entityType, entityId)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[audit] user:', user?.email ?? 'null')
    if (!user) return
    const { error } = await supabase.from('admin_audit_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      actor_email: user.email,
      details: details ?? null,
    })
    if (error) console.error('[audit] insert error:', error.message, error.code)
  } catch (err) {
    console.error('[audit] logAdminAction failed:', err)
  }
}
