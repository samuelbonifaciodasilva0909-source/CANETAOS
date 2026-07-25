export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          age_confirmed: boolean
          age_confirmed_at: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          age_confirmed: boolean
          age_confirmed_at?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          age_confirmed?: boolean
          age_confirmed_at?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          medication_name: string | null
          treatment_duration_category: string | null
          primary_goal: string | null
          preferred_content_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_name?: string | null
          treatment_duration_category?: string | null
          primary_goal?: string | null
          preferred_content_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_name?: string | null
          treatment_duration_category?: string | null
          primary_goal?: string | null
          preferred_content_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracker_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          weight_kg: number | null
          waist_measurement: number | null
          hip_measurement: number | null
          chest_measurement: number | null
          arm_measurement: number | null
          thigh_measurement: number | null
          mood: string | null
          energy_level: number | null
          sleep_hours: number | null
          water_intake_ml: number | null
          protein_intake_g: number | null
          dose_applied: boolean | null
          photo_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          weight_kg?: number | null
          waist_measurement?: number | null
          hip_measurement?: number | null
          chest_measurement?: number | null
          arm_measurement?: number | null
          thigh_measurement?: number | null
          mood?: string | null
          energy_level?: number | null
          sleep_hours?: number | null
          water_intake_ml?: number | null
          protein_intake_g?: number | null
          dose_applied?: boolean | null
          photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          weight_kg?: number | null
          waist_measurement?: number | null
          hip_measurement?: number | null
          chest_measurement?: number | null
          arm_measurement?: number | null
          thigh_measurement?: number | null
          mood?: string | null
          energy_level?: number | null
          sleep_hours?: number | null
          water_intake_ml?: number | null
          protein_intake_g?: number | null
          dose_applied?: boolean | null
          photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      symptom_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          nausea: boolean
          constipation: boolean
          hair_loss: boolean
          food_aversion: boolean
          taste_change: boolean
          fatigue: boolean
          headache: boolean
          mood: string | null
          energy_level: number | null
          other_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          nausea?: boolean
          constipation?: boolean
          hair_loss?: boolean
          food_aversion?: boolean
          taste_change?: boolean
          fatigue?: boolean
          headache?: boolean
          mood?: string | null
          energy_level?: number | null
          other_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          nausea?: boolean
          constipation?: boolean
          hair_loss?: boolean
          food_aversion?: boolean
          taste_change?: boolean
          fatigue?: boolean
          headache?: boolean
          mood?: string | null
          energy_level?: number | null
          other_notes?: string | null
          created_at?: string
        }
      }
      resistance_training_entries: {
        Row: {
          id: string
          user_id: string
          week_start: string
          completed: boolean | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          completed?: boolean | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          completed?: boolean | null
          notes?: string | null
          created_at?: string
        }
      }
      protein_calculations: {
        Row: {
          id: string
          user_id: string
          body_weight_kg: number
          lower_target: number
          upper_target: number
          meals_per_day: number
          suggested_per_meal: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          body_weight_kg: number
          lower_target: number
          upper_target: number
          meals_per_day: number
          suggested_per_meal: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          body_weight_kg?: number
          lower_target?: number
          upper_target?: number
          meals_per_day?: number
          suggested_per_meal?: number
          created_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          type: string
          title: string
          slug: string
          description: string | null
          content: string | null
          thumbnail_url: string | null
          is_premium: boolean
          is_published: boolean
          tags: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          slug: string
          description?: string | null
          content?: string | null
          thumbnail_url?: string | null
          is_premium?: boolean
          is_published?: boolean
          tags?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          slug?: string
          description?: string | null
          content?: string | null
          thumbnail_url?: string | null
          is_premium?: boolean
          is_published?: boolean
          tags?: Json
          created_at?: string
          updated_at?: string
        }
      }
      content_access: {
        Row: {
          id: string
          user_id: string
          content_id: string
          access_type: string
          granted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          access_type: string
          granted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          access_type?: string
          granted_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price_monthly: number
          price_yearly: number | null
          currency: string
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price_monthly: number
          price_yearly?: number | null
          currency?: string
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number | null
          currency?: string
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          plan_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          plan_id?: string | null
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          plan_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_payment_id: string | null
          amount: number
          currency: string
          status: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_payment_id?: string | null
          amount: number
          currency?: string
          status: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_payment_id?: string | null
          amount?: number
          currency?: string
          status?: string
          type?: string
          created_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          provider: string
          event_id: string
          event_type: string
          payload: Json
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          event_id: string
          event_type: string
          payload: Json
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          event_id?: string
          event_type?: string
          payload?: Json
          processed?: boolean
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      product_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          metadata?: Json
          created_at?: string
        }
      }
      feedback_entries: {
        Row: {
          id: string
          user_id: string | null
          difficulty: string | null
          feature_request: string | null
          willingness_to_pay: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          difficulty?: string | null
          feature_request?: string | null
          willingness_to_pay?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          difficulty?: string | null
          feature_request?: string | null
          willingness_to_pay?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          content_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          created_at?: string
        }
      }
      daily_checklists: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          water: boolean
          protein: boolean
          training: boolean
          application: boolean
          tracking: boolean
          sleep: boolean
          movement: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          water?: boolean
          protein?: boolean
          training?: boolean
          application?: boolean
          tracking?: boolean
          sleep?: boolean
          movement?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          water?: boolean
          protein?: boolean
          training?: boolean
          application?: boolean
          tracking?: boolean
          sleep?: boolean
          movement?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          read?: boolean
          metadata?: Json
          created_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          kind: string
          price_cents: number
          currency: string
          entitlements: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          kind: string
          price_cents: number
          currency?: string
          entitlements?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          kind?: string
          price_cents?: number
          currency?: string
          entitlements?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          product_id: string
          provider: string
          provider_payment_id: string | null
          payment_method: string | null
          amount_cents: number
          currency: string
          status: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          provider: string
          provider_payment_id?: string | null
          payment_method?: string | null
          amount_cents: number
          currency?: string
          status?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          provider?: string
          provider_payment_id?: string | null
          payment_method?: string | null
          amount_cents?: number
          currency?: string
          status?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      unlock_events: {
        Row: {
          id: string
          user_id: string
          product_id: string
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          reason?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          user_id: string
          provider: string
          provider_customer_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          provider: string
          provider_customer_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          provider?: string
          provider_customer_id?: string
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          title: string
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
