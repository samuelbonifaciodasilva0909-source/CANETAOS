"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Dev-mode Turbopack chunk URLs aren't content-hashed the way production
    // build output is, so a cache-first service worker serves stale JS/CSS
    // forever after every edit. Only register outside development.
    if (process.env.NODE_ENV !== "production") return

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-critical — the app still works without offline caching.
      })
    }
  }, [])

  return null
}
