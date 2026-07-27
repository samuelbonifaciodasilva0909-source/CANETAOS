"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { computeEntitlements, hasEntitlement } from "@/lib/entitlements"
import type { EntitlementSlug } from "@/types"

/**
 * Client-side mirror of getUserEntitlements, for nav visibility only — the
 * real access boundary is the server-side check in the destination page.
 * Demo mode has no purchases/products rows, so it's treated as fully entitled
 * here (same exemption the paywall middleware gives it).
 */
export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<EntitlementSlug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const isDemo = document.cookie.includes("demo_auth=true")
      if (isDemo) {
        setEntitlements(["onboarding", "basic_tracker", "meal_plans", "quick_recipes"])
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [productsRes, purchasesRes, subRes, unlocksRes] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("purchases").select("*").eq("user_id", user.id),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase.from("unlock_events").select("*").eq("user_id", user.id),
        ])

        setEntitlements(
          computeEntitlements({
            purchases: purchasesRes.data || [],
            subscription: subRes.data || null,
            unlockEvents: unlocksRes.data || [],
            products: productsRes.data || [],
          })
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return {
    entitlements,
    loading,
    hasEntitlement: (slug: EntitlementSlug) => hasEntitlement(entitlements, slug),
  }
}
