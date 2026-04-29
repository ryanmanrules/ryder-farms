import { supabase } from './supabase'

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('admin_audit_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      actor_email: user.email,
      details: details ?? null,
    })
  } catch {
    // audit logging is non-blocking
  }
}
