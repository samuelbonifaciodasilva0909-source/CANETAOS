-- =====================================================
-- CanetaOS - Schema v9: Reminder preferences
-- Data model only — no push delivery yet. Sets up the
-- shape a future push-notification worker would read from.
-- =====================================================

CREATE TABLE IF NOT EXISTS reminder_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_log_enabled BOOLEAN NOT NULL DEFAULT true,
  hydration_enabled BOOLEAN NOT NULL DEFAULT true,
  new_content_enabled BOOLEAN NOT NULL DEFAULT false,
  recipe_updates_enabled BOOLEAN NOT NULL DEFAULT false,
  preferred_time TIME NOT NULL DEFAULT '19:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminder_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminder preferences"
  ON reminder_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminder preferences"
  ON reminder_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminder preferences"
  ON reminder_preferences FOR UPDATE USING (auth.uid() = user_id);
