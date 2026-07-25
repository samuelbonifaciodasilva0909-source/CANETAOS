-- =====================================================
-- CanetaOS - Schema v2: Favorites, Daily Checklists,
-- Notifications, Chat History, Shopping Lists
-- =====================================================

-- =====================================================
-- FAVORITES
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DAILY CHECKLISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  water BOOLEAN NOT NULL DEFAULT false,
  protein BOOLEAN NOT NULL DEFAULT false,
  training BOOLEAN NOT NULL DEFAULT false,
  application BOOLEAN NOT NULL DEFAULT false,
  tracking BOOLEAN NOT NULL DEFAULT false,
  sleep BOOLEAN NOT NULL DEFAULT false,
  movement BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

ALTER TABLE daily_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists"
  ON daily_checklists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON daily_checklists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON daily_checklists FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CHAT HISTORY (Caneta IA)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat"
  ON chat_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat"
  ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat"
  ON chat_history FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SHOPPING LISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Minha lista',
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping lists"
  ON shopping_lists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists"
  ON shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
  ON shopping_lists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
  ON shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_date ON tracker_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_user_date ON symptom_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checklists_user_date ON daily_checklists(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type, is_published);
