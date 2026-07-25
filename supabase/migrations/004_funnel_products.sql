-- =====================================================
-- CanetaOS - Schema v4: Funnel products, one-time
-- purchases, and usage-based unlocks
-- =====================================================

-- =====================================================
-- PRODUCTS (catalog of funnel offers)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('one_time', 'recurring')),
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  entitlements JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- =====================================================
-- PURCHASES (one-time funnel products: front-end,
-- order bump, upsell)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  payment_method TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_user_status ON purchases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_purchases_provider_payment ON purchases(provider, provider_payment_id);

-- =====================================================
-- UNLOCK EVENTS (entitlements granted by usage criteria
-- instead of a purchase, e.g. Desmame after 8 active
-- tracker weeks)
-- =====================================================
CREATE TABLE IF NOT EXISTS unlock_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE unlock_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlock events"
  ON unlock_events FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- CUSTOMERS (maps a user to their payment-provider
-- customer id, needed by Asaas before charging)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_customer_id)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer record"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA: Funnel products
-- =====================================================
INSERT INTO products (slug, name, description, kind, price_cents, entitlements) VALUES
('frontend', 'CanetaOS - Acesso ao App', 'Tracker semanal, cardápios de alta densidade proteica e protocolo anti-náusea.', 'one_time', 3700, '["basic_tracker", "meal_plans"]'),
('recipes_bump', 'Receitas Rápidas', 'Biblioteca de 40 receitas proteicas prontas em até 5 minutos.', 'one_time', 2700, '["quick_recipes"]'),
('desmame', 'Fase 2: Desmame', 'Como reduzir a dose com acompanhamento, lidar com o apetite voltando e manter o resultado nos 12 meses seguintes.', 'one_time', 19700, '["desmame_content"]'),
('plus_subscription', 'CanetaOS Plus', 'Feed de novas canetas/genéricos, comunidade e conteúdo mensal.', 'recurring', 9000, '["plus_feed", "plus_community", "monthly_content"]')
ON CONFLICT (slug) DO NOTHING;
