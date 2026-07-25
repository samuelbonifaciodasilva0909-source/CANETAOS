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
