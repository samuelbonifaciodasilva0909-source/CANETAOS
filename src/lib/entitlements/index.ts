import type { EntitlementSlug } from "@/types"
import type { Database } from "@/types/database"

type Purchase = Database["public"]["Tables"]["purchases"]["Row"]
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type UnlockEvent = Database["public"]["Tables"]["unlock_events"]["Row"]

const ALWAYS_ON: EntitlementSlug[] = ["onboarding"]

const SUBSCRIPTION_ACTIVE_STATUSES = ["active", "trialing"]

/**
 * Computes the set of entitlements a user currently has, from three
 * independent sources: paid one-time purchases, an active Plus
 * subscription, and usage-based unlocks (e.g. Desmame after 8 weeks).
 * No single "plan tier" gates access — see supabase/migrations/004.
 */
export function computeEntitlements(params: {
  purchases: Purchase[]
  subscription: Subscription | null
  unlockEvents: UnlockEvent[]
  products: Product[]
}): EntitlementSlug[] {
  const { purchases, subscription, unlockEvents, products } = params
  const productsById = new Map(products.map((p) => [p.id, p]))

  const granted = new Set<EntitlementSlug>(ALWAYS_ON)

  for (const purchase of purchases) {
    if (purchase.status !== "paid") continue
    const product = productsById.get(purchase.product_id)
    if (!product) continue
    for (const slug of (product.entitlements as string[]) || []) {
      granted.add(slug as EntitlementSlug)
    }
  }

  for (const unlock of unlockEvents) {
    const product = productsById.get(unlock.product_id)
    if (!product) continue
    for (const slug of (product.entitlements as string[]) || []) {
      granted.add(slug as EntitlementSlug)
    }
  }

  if (subscription && SUBSCRIPTION_ACTIVE_STATUSES.includes(subscription.status)) {
    const plusProduct = products.find((p) => p.slug === "plus_subscription")
    for (const slug of (plusProduct?.entitlements as string[]) || []) {
      granted.add(slug as EntitlementSlug)
    }
  }

  return Array.from(granted)
}

export function hasEntitlement(
  activeEntitlements: EntitlementSlug[],
  required: EntitlementSlug
): boolean {
  return activeEntitlements.includes(required)
}

export function hasAnyEntitlement(
  activeEntitlements: EntitlementSlug[],
  required: EntitlementSlug[]
): boolean {
  return required.some((r) => activeEntitlements.includes(r))
}

/**
 * Server-side helper: fetches everything computeEntitlements needs for a
 * given user and returns the resolved entitlement list. Demo mode's
 * `createClient()` shim has no products/purchases/unlock_events fixtures, so
 * every real user's fetch would come back empty and get gated out — callers
 * must skip this for demo sessions (see isDemoMode in supabase/middleware.ts).
 */
export async function getUserEntitlements(
  supabase: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  userId: string
): Promise<EntitlementSlug[]> {
  const [productsRes, purchasesRes, subRes, unlocksRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("purchases").select("*").eq("user_id", userId),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("unlock_events").select("*").eq("user_id", userId),
  ])

  return computeEntitlements({
    purchases: purchasesRes.data || [],
    subscription: subRes.data || null,
    unlockEvents: unlocksRes.data || [],
    products: productsRes.data || [],
  })
}

export { getDesmameUnlockStatus, DESMAME_UNLOCK_WEEKS } from "./unlock"
