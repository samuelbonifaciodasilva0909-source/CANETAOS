"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email?: string
}

interface Profile {
  id: string
  full_name: string | null
  onboarding_completed: boolean
  created_at: string
}

interface Preferences {
  medication_name: string | null
  treatment_duration_category: string | null
  primary_goal: string | null
  preferred_content_type: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setLoading(false)
        return
      }

      setUser(authUser)

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, onboarding_completed, created_at")
        .eq("id", authUser.id)
        .single()

      setProfile(prof)

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("medication_name, treatment_duration_category, primary_goal, preferred_content_type")
        .eq("user_id", authUser.id)
        .single()

      setPreferences(prefs)
      setLoading(false)
    }

    load()
  }, [])

  const firstName = profile?.full_name?.split(" ")[0] || "você"

  return { user, profile, preferences, firstName, loading }
}
