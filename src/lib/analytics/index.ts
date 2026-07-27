import type { AnalyticsEventType } from "@/types"

export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata?: Record<string, unknown>
) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, metadata }),
    })
  } catch {
    // Silently fail - analytics should never block user experience
  }
}

/** Server Component variant — inserts directly instead of round-tripping
 * through /api/analytics, since server components already have a client. */
export async function trackContentViewServer(
  supabase: { from: (table: string) => { insert: (row: Record<string, unknown>) => Promise<unknown> } },
  contentId: string,
  contentType: string
) {
  try {
    await supabase.from("product_events").insert({
      event_type: "content_viewed",
      metadata: { content_id: contentId, content_type: contentType },
    })
  } catch {
    // Silently fail - analytics should never block the page render
  }
}
