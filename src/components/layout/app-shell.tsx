"use client"

import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { Header } from "./header"
import { ComplianceBar } from "@/components/compliance/compliance-footer"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[232px]">
        <Header />
        <main className="px-4 pb-28 pt-6 sm:px-8 lg:px-12 lg:pb-8 lg:pt-8 max-w-[1200px]">
          {children}
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <ComplianceBar />
        <BottomNav />
      </div>
    </div>
  )
}
