import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client — bypasses RLS. Only use from trusted server contexts
 * that already validated the caller (e.g. a signed webhook), never from
 * anything reachable directly by a browser request.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada")
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
