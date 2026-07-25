"use client"

import { PageTransition } from "@/components/page-transition"

export function LayoutTransition({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
