"use client"

import { useEffect } from "react"
import { pixelTrack } from "@/lib/analytics/meta-pixel"

export function PurchasePixel({ value }: { value?: number }) {
  useEffect(() => {
    pixelTrack("Purchase", { currency: "BRL", ...(value ? { value } : {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
