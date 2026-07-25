-- =====================================================
-- CanetaOS - Initial Database Migration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age_confirmed BOOLEAN NOT NULL DEFAULT false,
  age_confirmed_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- USER PREFERENCES
-- =====================================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT,
  treatment_duration_category TEXT,
  primary_goal TEXT,
  preferred_content_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRACKER ENTRIES
-- =====================================================
CREATE TABLE tracker_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  waist_measurement NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracker entries"
  ON tracker_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracker entries"
  ON tracker_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracker entries"
  ON tracker_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracker entries"
  ON tracker_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SYMPTOM ENTRIES
-- =====================================================
CREATE TABLE symptom_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  nausea BOOLEAN NOT NULL DEFAULT false,
  constipation BOOLEAN NOT NULL DEFAULT false,
  hair_loss BOOLEAN NOT NULL DEFAULT false,
  food_aversion BOOLEAN NOT NULL DEFAULT false,
  taste_change BOOLEAN NOT NULL DEFAULT false,
  fatigue BOOLEAN NOT NULL DEFAULT false,
  headache BOOLEAN NOT NULL DEFAULT false,
  other_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom entries"
  ON symptom_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom entries"
  ON symptom_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom entries"
  ON symptom_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom entries"
  ON symptom_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RESISTANCE TRAINING ENTRIES
-- =====================================================
CREATE TABLE resistance_training_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  completed BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resistance_training_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training entries"
  ON resistance_training_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training entries"
  ON resistance_training_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training entries"
  ON resistance_training_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training entries"
  ON resistance_training_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PROTEIN CALCULATIONS
-- =====================================================
CREATE TABLE protein_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body_weight_kg NUMERIC(5,2) NOT NULL,
  lower_target NUMERIC(5,2) NOT NULL,
  upper_target NUMERIC(5,2) NOT NULL,
  meals_per_day INTEGER NOT NULL,
  suggested_per_meal NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE protein_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own protein calculations"
  ON protein_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own protein calculations"
  ON protein_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PLANS
-- =====================================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'BRL',
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  plan_id UUID REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- WEBHOOK EVENTS
-- =====================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No user access - only service role

-- =====================================================
-- USER ROLES
-- =====================================================
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- CONTENT ITEMS
-- =====================================================
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published free content"
  ON content_items FOR SELECT
  USING (is_published = true AND is_premium = false);

-- =====================================================
-- CONTENT ACCESS
-- =====================================================
CREATE TABLE content_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'individual',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content access"
  ON content_access FOR SELECT
  USING (auth.uid() = user_id);

-- Depends on content_access above, so it's declared only now that the
-- referenced table exists.
CREATE POLICY "Authenticated users can view published content"
  ON content_items FOR SELECT
  USING (
    is_published = true
    AND (
      is_premium = false
      OR EXISTS (
        SELECT 1 FROM subscriptions
        WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status IN ('active', 'trialing')
      )
      OR EXISTS (
        SELECT 1 FROM content_access
        WHERE content_access.user_id = auth.uid()
        AND content_access.content_id = content_items.id
      )
    )
  );

-- =====================================================
-- PRODUCT EVENTS
-- =====================================================
CREATE TABLE product_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON product_events FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- FEEDBACK ENTRIES
-- =====================================================
CREATE TABLE feedback_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  difficulty TEXT,
  feature_request TEXT,
  willingness_to_pay TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
  ON feedback_entries FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- SEED DATA: Plans
-- =====================================================
INSERT INTO plans (name, slug, description, price_monthly, price_yearly, features) VALUES
('CanetaOS Starter', 'free', 'Acompanhamento básico e conteúdo gratuito', 0, 0, '["onboarding", "basic_tracker", "free_content"]'),
('CanetaOS Plus', 'plus', 'Biblioteca premium, receitas e recursos avançados', 29.90, 299.00, '["onboarding", "basic_tracker", "free_content", "premium_recipes", "premium_meal_plans", "premium_education", "full_history", "advanced_tools", "maintenance_planning"]'),
('CanetaOS Pro', 'pro', 'Para profissionais de saúde (em breve)', 0, 0, '["onboarding", "basic_tracker", "free_content", "premium_recipes", "premium_meal_plans", "premium_education", "full_history", "advanced_tools", "maintenance_planning"]');

-- =====================================================
-- SEED DATA: Content Items
-- =====================================================

-- Meal Plans
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('meal_plan', 'Cardápio Semanal Leve e Nutritivo', 'cardapio-semanal-leve', 'Um cardápio planejado para ajudar na organização da alimentação durante o acompanhamento.', 'Conteúdo completo do cardápio...', false, true, '["alimentação", "organização", "cardápio"]'),
('meal_plan', 'Cardápio Rico em Proteína', 'cardapio-rico-proteina', 'Opções de refeições com foco em proteína para discussão com seu profissional.', 'Conteúdo completo do cardápio...', false, true, '["proteína", "alimentação", "cardápio"]'),
('meal_plan', 'Refeições Práticas para o Dia a Dia', 'refeccoes-praticas', 'Sugestões de refeições práticas que facilitam a organização da rotina alimentar.', 'Conteúdo completo do cardápio...', true, true, '["prático", "alimentação", "cardápio"]'),
('meal_plan', 'Alimentação e Hidratação', 'alimentacao-hidratacao', 'Como organizar a hidratação junto com a alimentação no dia a dia.', 'Conteúdo completo do cardápio...', false, true, '["hidratação", "alimentação"]'),
('meal_plan', 'Opções para Lanches Saudáveis', 'lanches-saudaveis', 'Ideias de lanches que podem ser incluídos na rotina alimentar.', 'Conteúdo completo do cardápio...', true, true, '["lanche", "alimentação", "prático"]'),
('meal_plan', 'Planejamento de Refeições da Semana', 'planejamento-refeicoes', 'Como planejar suas refeições com antecedência para mais organização.', 'Conteúdo completo do cardápio...', false, true, '["planejamento", "organização"]'),
('meal_plan', 'Cardápio para Início de Jornada', 'cardapio-inicio-jornada', 'Sugestões para quem está começando seu acompanhamento.', 'Conteúdo completo do cardápio...', false, true, '["início", "alimentação", "cardápio"]'),
('meal_plan', 'Refeições Leves e Saborosas', 'refeccoes-leves', 'Opções de refeições mais leves para incluir na rotina.', 'Conteúdo completo do cardápio...', true, true, '["leve", "alimentação"]'),
('meal_plan', 'Organização de Compras e Refeições', 'organizacao-compras', 'Como organizar suas compras para facilitar a preparação das refeições.', 'Conteúdo completo do cardápio...', false, true, '["compras", "organização"]'),
('meal_plan', 'Cardápio Premium Variado', 'cardapio-premium-variado', 'Um cardápio variado com opções para diferentes momentos do dia.', 'Conteúdo completo do cardápio...', true, true, '["variado", "premium", "cardápio"]');

-- Recipes
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Omelete de Espinafre com Ricota', 'omelete-espinafre-ricota', 'Receita simples e rica em proteína para o café da manhã.', '{"tempo":"15 min","ingredientes":["3 ovos","1 xícara de espinafre","2 colheres de ricota","Sal e pimenta"],"instrucoes":"Bata os ovos, adicione o espinafre picado e a ricota. Cozinhe em fogo baixo até dourar.","protein_estimate":"22g","max_ingredients":5}', false, true, '["proteína", "café da manhã", "rápido"]'),
('recipe', 'Frango com Legumes Assados', 'frango-legumes-assados', 'Receita nutritiva e fácil de preparar para o almoço.', '{"tempo":"40 min","ingredientes":["200g de peito de frango","1 cenoura","1 abobrinha","1 batata-doce","Azeite e ervas"],"instrucoes":"Corte os legumes em cubos, tempere o frango, asse tudo a 200°C por 35 minutos.","protein_estimate":"35g","max_ingredients":6}', false, true, '["proteína", "almoço", "assado"]'),
('recipe', 'Smoothie Verde Proteico', 'smoothie-verde-proteico', 'Bebida nutritiva para complementar a alimentação.', '{"tempo":"5 min","ingredientes":["1 banana","1 xícara de espinafre","1 scoop de whey","200ml de leite vegetal"],"instrucoes":"Bata tudo no liquidificador até obter um creme homogêneo.","protein_estimate":"28g","max_ingredients":4}', false, true, '["proteína", "lanche", "rápido"]'),
('recipe', 'Salada de Grão-de-Bico', 'salada-grao-de-bico', 'Receita rica em fibras e proteína vegetal.', '{"tempo":"15 min","ingredientes":["1 xícara de grão-de-bico cozido","Tomate","Pepino","Azeite","Limão"],"instrucoes":"Misture todos os ingredientes tempere com azeite e limão.","protein_estimate":"12g","max_ingredients":5}', false, true, '["vegetariano", "lanche", "proteína"]'),
('recipe', 'Sopa Cremosa de Abóbora', 'sopa-cremosa-aborbora', 'Sopa nutritiva e confortável para os dias mais frios.', '{"tempo":"30 min","ingredientes":["500g de abóbora","1 cebola","Caldo de legumes","Azeite","Noz-moscada"],"instrucoes":"Cozinhe a abóbora com a cebola, bata no liquidificador e tempere.","protein_estimate":"4g","max_ingredients":5}', true, true, '["sopa", "conforto", "inverno"]'),
('recipe', 'Panquecas de Aveia e Banana', 'panquecas-aveia-banana', 'Opção saudável para o café da manhã ou lanche.', '{"tempo":"20 min","ingredientes":["1 banana","1 xícara de aveia","2 ovos","Canela","Mel"],"instrucoes":"Amasse a banana, misture com aveia e ovos. Cozinhe em fogo baixo.","protein_estimate":"18g","max_ingredients":5}', true, true, '["café da manhã", "lanche", "aveia"]'),
('recipe', 'Tilápia com Purê de Batata-Doce', 'tilapia-pure-batata-doce', 'Refeição balanceada com proteína magra e carboidrato complexo.', '{"tempo":"35 min","ingredientes":["200g de tilápia","2 batatas-doces","Azeite","Alho","Salsinha"],"instrucoes":"Asse a tilápia com alho. Cozinhe e amasse as batatas com azeite.","protein_estimate":"30g","max_ingredients":5}', false, true, '["almoço", "proteína", "peixe"]'),
('recipe', 'Iogurte Grego com Granola Caseira', 'iogurte-granola', 'Lanche nutritivo e saboroso para qualquer momento.', '{"tempo":"10 min","ingredientes":["200g de iogurte grego","Granola","Mel","Frutas vermelhas"],"instrucoes":"Coloque o iogurte em uma tigela, adicione granola, mel e frutas.","protein_estimate":"20g","max_ingredients":4}', false, true, '["lanche", "proteína", "rápido"]'),
('recipe', 'Strogonoff de Frango Light', 'strogonoff-frango-light', 'Versão mais leve do clássico strogonoff.', '{"tempo":"30 min","ingredientes":["200g de peito de frango","Cogumelos","Creme de leite light","Ketchup","Mostarda"],"instrucoes":"Cozinhe o frango em cubos, adicione cogumelos e molho.","protein_estimate":"28g","max_ingredients":6}', true, true, '["almoço", "frango", "clássico"]'),
('recipe', 'Bowl de Açaí Proteico', 'bowl-acai-proteico', 'Bowl energético e nutritivo para o lanche.', '{"tempo":"10 min","ingredientes":["100g de açaí","1 banana","1 scoop de whey","Granola","Mel"],"instrucoes":"Bata o açaí com banana e whey. Sirva com granola e mel.","protein_estimate":"25g","max_ingredients":5}', true, true, '["lanche", "energético", "proteína"]');

-- Educational
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('educational', 'Organizando Sua Alimentação no Dia a Dia', 'organizacao-alimentacao', 'Dicas práticas para organizar suas refeições durante o acompanhamento.', 'Conteúdo educativo sobre organização alimentar...', false, true, '["alimentação", "organização", "educação"]'),
('educational', 'Importância do Registro de Sintomas', 'importancia-registro-sintomas', 'Por que registrar sintomas é importante para seu acompanhamento.', 'Conteúdo educativo sobre registro de sintomas...', false, true, '["sintomas", "registro", "educação"]'),
('educational', 'Hidratação: Por Que Importa', 'hidratacao-importancia', 'Como a hidratação pode impactar seu bem-estar no dia a dia.', 'Conteúdo educativo sobre hidratação...', false, true, '["hidratação", "bem-estar", "educação"]'),
('educational', 'Conversando com Seu Profissional', 'conversando-profissional', 'Como preparar perguntas e informações para levar à consulta.', 'Conteúdo educativo sobre comunicação com profissionais...', false, true, '["profissional", "comunicação", "educação"]'),
('educational', 'Construindo Hábitos Sustentáveis', 'construindo-habitos', 'Estratégias para criar hábitos que duram no tempo.', 'Conteúdo educativo sobre construção de hábitos...', false, true, '["hábitos", "educação", "comportamento"]'),
('educational', 'Guia Completo de Proteína', 'guia-completo-proteina', 'Tudo sobre a importância da proteína na alimentação.', 'Conteúdo premium sobre proteína...', true, true, '["proteína", "nutrição", "premium"]'),
('educational', 'Planejamento de Manutenção', 'planejamento-manutencao', 'Como se preparar para a fase de manutenção da jornada.', 'Conteúdo premium sobre manutenção...', true, true, '["manutenção", "planejamento", "premium"]');

-- Guides
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('guide', 'Como Usar o Tracker', 'como-usar-tracker', 'Guia rápido para começar a usar o registro de acompanhamento.', 'Conteúdo do guia...', false, true, '["guia", "tracker", "início"]'),
('guide', 'Calculadora de Proteína: Como Usar', 'calculadora-proteina-guia', 'Entenda como interpretar os resultados da calculadora de proteína.', 'Conteúdo do guia...', false, true, '["guia", "proteína", "ferramenta"]'),
('guide', 'Lista de Compras: Como Montar', 'lista-compras-guia', 'Dicas para montar sua lista de compras de forma organizada.', 'Conteúdo do guia...', false, true, '["guia", "compras", "organização"]'),
('guide', 'Primeiros Passos no CanetaOS', 'primeiros-passos', 'Um guia para você começar a usar o CanetaOS com tranquilidade.', 'Conteúdo do guia...', false, true, '["guia", "início", "tutorial"]'),
('guide', 'Seus Direitos como Usuário', 'direitos-usuario', 'Entenda como seus dados são tratados e quais são seus direitos.', 'Conteúdo do guia...', false, true, '["guia", "privacidade", "direitos"]');
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
-- =====================================================
-- CanetaOS - Schema v3: Expand Tracker
-- Adds measurements, mood, energy, sleep, water,
-- protein, dose, photo to tracker_entries
-- =====================================================

-- Add columns to tracker_entries
ALTER TABLE tracker_entries
  ADD COLUMN IF NOT EXISTS hip_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS chest_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS arm_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS thigh_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS water_intake_ml INTEGER,
  ADD COLUMN IF NOT EXISTS protein_intake_g NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS dose_applied BOOLEAN,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add mood and energy to symptom_entries
ALTER TABLE symptom_entries
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5);
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
