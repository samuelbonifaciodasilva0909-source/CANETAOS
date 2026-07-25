"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type TrackerRow = Database["public"]["Tables"]["tracker_entries"]["Row"]

export function useTracker(userId: string | undefined) {
  const [entries, setEntries] = useState<TrackerRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    const { data } = await supabase
      .from("tracker_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .limit(30)
    setEntries(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return { entries, loading, refetch: fetchEntries }
}

export function useSymptoms(userId: string | undefined) {
  const [entries, setEntries] = useState<Database["public"]["Tables"]["symptom_entries"]["Row"][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("symptom_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })
        .limit(30)
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [userId])

  return { entries, loading }
}
