declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function pixelTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return
  window.fbq("track", event, params)
}
