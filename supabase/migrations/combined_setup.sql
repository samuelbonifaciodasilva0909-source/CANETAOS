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
-- =====================================================
-- CanetaOS - Schema v5: 200 original recipes seed
-- Generated programmatically for variety + protein accuracy.
-- Focus: reduced appetite, nausea-friendly, high protein density.
-- =====================================================

-- Batch 1 (recipes 1-20)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Omelete de peito de frango', 'omelete-de-peito-de-frango', 'Omelete de peito de frango, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de peito de frango","azeite","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione peito de frango picado e batata-doce cozida, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"30g","max_ingredients":3}', true, true, '["café-da-manhã","5-min","alta-proteina"]'::jsonb),
('recipe', 'Omelete de ovo', 'omelete-de-ovo', 'Omelete de ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["2 un de ovo","limão","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione ovo picado e aveia em flocos, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de ricota', 'omelete-de-ricota', 'Omelete de ricota, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["80g de ricota","sal e pimenta a gosto","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione ricota picado e arroz integral cozido, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de iogurte grego', 'omelete-de-iogurte-grego', 'Omelete de iogurte grego, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["150g de iogurte grego","ervas finas","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione iogurte grego picado e quinoa cozida, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"15g","max_ingredients":3}', true, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de atum em lata (água)', 'omelete-de-atum-em-lata-agua', 'Omelete de atum em lata (água), pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["80g de atum em lata (água)","canela","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione atum em lata (água) picado e pão integral, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"21g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de tilápia', 'omelete-de-tilapia', 'Omelete de tilápia, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["120g de tilápia","mel","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione tilápia picado e tapioca (goma hidratada), cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"31g","max_ingredients":3}', false, true, '["café-da-manhã","5-min","alta-proteina"]'::jsonb),
('recipe', 'Omelete de grão-de-bico cozido', 'omelete-de-grao-de-bico-cozido', 'Omelete de grão-de-bico cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de grão-de-bico cozido","alho picado","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione grão-de-bico cozido picado e mandioquinha cozida, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"9g","max_ingredients":3}', true, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de lentilha cozida', 'omelete-de-lentilha-cozida', 'Omelete de lentilha cozida, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de lentilha cozida","cebola picada","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione lentilha cozida picado e purê de abóbora, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de whey protein (sabor neutro ou baunilha)', 'omelete-de-whey-protein-sabor-neutro-ou-baunilha', 'Omelete de whey protein (sabor neutro ou baunilha), pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","páprica doce","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione whey protein (sabor neutro ou baunilha) picado e cuscuz de milho, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de queijo cottage', 'omelete-de-queijo-cottage', 'Omelete de queijo cottage, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de queijo cottage","gengibre ralado","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione queijo cottage picado e torrada integral, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"11g","max_ingredients":3}', true, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de carne moída magra (patinho)', 'omelete-de-carne-moida-magra-patinho', 'Omelete de carne moída magra (patinho), pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de carne moída magra (patinho)","cominho","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione carne moída magra (patinho) picado e banana amassada, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"26g","max_ingredients":3}', false, true, '["café-da-manhã","5-min","alta-proteina"]'::jsonb),
('recipe', 'Omelete de camarão limpo', 'omelete-de-camarao-limpo', 'Omelete de camarão limpo, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de camarão limpo","azeite","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione camarão limpo picado e creme de milho, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de tofu firme', 'omelete-de-tofu-firme', 'Omelete de tofu firme, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["120g de tofu firme","limão","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione tofu firme picado e batata-doce cozida, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"10g","max_ingredients":3}', true, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de feijão preto cozido', 'omelete-de-feijao-preto-cozido', 'Omelete de feijão preto cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de feijão preto cozido","sal e pimenta a gosto","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione feijão preto cozido picado e aveia em flocos, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de claras de ovo', 'omelete-de-claras-de-ovo', 'Omelete de claras de ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["3 un de claras de ovo","ervas finas","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione claras de ovo picado e arroz integral cozido, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de sardinha em lata', 'omelete-de-sardinha-em-lata', 'Omelete de sardinha em lata, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["80g de sardinha em lata","canela","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione sardinha em lata picado e quinoa cozida, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"20g","max_ingredients":3}', true, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de salmão', 'omelete-de-salmao', 'Omelete de salmão, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de salmão","mel","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione salmão picado e pão integral, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"20g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de peru moído', 'omelete-de-peru-moido', 'Omelete de peru moído, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de peru moído","alho picado","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione peru moído picado e tapioca (goma hidratada), cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"27g","max_ingredients":3}', false, true, '["café-da-manhã","5-min","alta-proteina"]'::jsonb),
('recipe', 'Omelete de queijo minas frescal', 'omelete-de-queijo-minas-frescal', 'Omelete de queijo minas frescal, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["60g de queijo minas frescal","cebola picada","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione queijo minas frescal picado e mandioquinha cozida, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"10g","max_ingredients":3}', true, true, '["café-da-manhã","5-min"]'::jsonb),
('recipe', 'Omelete de leite em pó desnatado', 'omelete-de-leite-em-po-desnatado', 'Omelete de leite em pó desnatado, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["2 colher de sopa de leite em pó desnatado","páprica doce","1-2 ovos"],"instrucoes":["Bata os ovos/claras com uma pitada de sal.","Aqueça uma frigideira antiaderente em fogo baixo.","Adicione leite em pó desnatado picado e purê de abóbora, cozinhe por 1-2 min.","Despeje a mistura de ovos, tampe e cozinhe até firmar.","Dobre ao meio e sirva ainda quente."],"protein_estimate":"8g","max_ingredients":3}', false, true, '["café-da-manhã","5-min"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 2 (recipes 21-40)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Bowl de peito de frango com cuscuz de milho', 'bowl-de-peito-de-frango-com-cuscuz-de-milho', 'Bowl de peito de frango com cuscuz de milho, pensado para quem está comendo pouco: porção pequena, 33g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de peito de frango","1 xícara de cuscuz de milho","1 unidade ou punhado de morango","gengibre ralado"],"instrucoes":["Cozinhe ou aqueça cuscuz de milho.","Tempere peito de frango com sal, limão e ervas.","Grelhe ou salteie peito de frango por 5-6 min.","Monte o bowl: base de cuscuz de milho, peito de frango por cima e morango fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"33g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de ovo com torrada integral', 'bowl-de-ovo-com-torrada-integral', 'Bowl de ovo com torrada integral, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["2 un de ovo","1 xícara de torrada integral","1 unidade ou punhado de manga","cominho"],"instrucoes":["Cozinhe ou aqueça torrada integral.","Tempere ovo com sal, limão e ervas.","Grelhe ou salteie ovo por 5-6 min.","Monte o bowl: base de torrada integral, ovo por cima e manga fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"15g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de ricota com banana amassada', 'bowl-de-ricota-com-banana-amassada', 'Bowl de ricota com banana amassada, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["80g de ricota","1 xícara de banana amassada","1 unidade ou punhado de cogumelos fatiados","azeite"],"instrucoes":["Cozinhe ou aqueça banana amassada.","Tempere ricota com sal, limão e ervas.","Grelhe ou salteie ricota por 5-6 min.","Monte o bowl: base de banana amassada, ricota por cima e cogumelos fatiados fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"12g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de iogurte grego com creme de milho', 'bowl-de-iogurte-grego-com-creme-de-milho', 'Bowl de iogurte grego com creme de milho, pensado para quem está comendo pouco: porção pequena, 18g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["150g de iogurte grego","1 xícara de creme de milho","1 unidade ou punhado de vagem","limão"],"instrucoes":["Cozinhe ou aqueça creme de milho.","Tempere iogurte grego com sal, limão e ervas.","Grelhe ou salteie iogurte grego por 5-6 min.","Monte o bowl: base de creme de milho, iogurte grego por cima e vagem fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"18g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de atum em lata (água) com batata-doce cozida', 'bowl-de-atum-em-lata-agua-com-batata-doce-cozida', 'Bowl de atum em lata (água) com batata-doce cozida, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["80g de atum em lata (água)","1 xícara de batata-doce cozida","1 unidade ou punhado de espinafre","sal e pimenta a gosto"],"instrucoes":["Cozinhe ou aqueça batata-doce cozida.","Tempere atum em lata (água) com sal, limão e ervas.","Grelhe ou salteie atum em lata (água) por 5-6 min.","Monte o bowl: base de batata-doce cozida, atum em lata (água) por cima e espinafre fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"24g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de tilápia com aveia em flocos', 'bowl-de-tilapia-com-aveia-em-flocos', 'Bowl de tilápia com aveia em flocos, pensado para quem está comendo pouco: porção pequena, 34g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["120g de tilápia","1 xícara de aveia em flocos","1 unidade ou punhado de abobrinha ralada","ervas finas"],"instrucoes":["Cozinhe ou aqueça aveia em flocos.","Tempere tilápia com sal, limão e ervas.","Grelhe ou salteie tilápia por 5-6 min.","Monte o bowl: base de aveia em flocos, tilápia por cima e abobrinha ralada fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"34g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de grão-de-bico cozido com arroz integral cozido', 'bowl-de-grao-de-bico-cozido-com-arroz-integral-cozido', 'Bowl de grão-de-bico cozido com arroz integral cozido, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de grão-de-bico cozido","1 xícara de arroz integral cozido","1 unidade ou punhado de cenoura ralada","canela"],"instrucoes":["Cozinhe ou aqueça arroz integral cozido.","Tempere grão-de-bico cozido com sal, limão e ervas.","Grelhe ou salteie grão-de-bico cozido por 5-6 min.","Monte o bowl: base de arroz integral cozido, grão-de-bico cozido por cima e cenoura ralada fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"12g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de lentilha cozida com quinoa cozida', 'bowl-de-lentilha-cozida-com-quinoa-cozida', 'Bowl de lentilha cozida com quinoa cozida, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de lentilha cozida","1 xícara de quinoa cozida","1 unidade ou punhado de brócolis cozido","mel"],"instrucoes":["Cozinhe ou aqueça quinoa cozida.","Tempere lentilha cozida com sal, limão e ervas.","Grelhe ou salteie lentilha cozida por 5-6 min.","Monte o bowl: base de quinoa cozida, lentilha cozida por cima e brócolis cozido fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"12g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de whey protein (sabor neutro ou baunilha) com pão integral', 'bowl-de-whey-protein-sabor-neutro-ou-baunilha-com-pao-integral', 'Bowl de whey protein (sabor neutro ou baunilha) com pão integral, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","1 xícara de pão integral","1 unidade ou punhado de tomate cereja","alho picado"],"instrucoes":["Cozinhe ou aqueça pão integral.","Tempere whey protein (sabor neutro ou baunilha) com sal, limão e ervas.","Grelhe ou salteie whey protein (sabor neutro ou baunilha) por 5-6 min.","Monte o bowl: base de pão integral, whey protein (sabor neutro ou baunilha) por cima e tomate cereja fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"27g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de queijo cottage com tapioca (goma hidratada)', 'bowl-de-queijo-cottage-com-tapioca-goma-hidratada', 'Bowl de queijo cottage com tapioca (goma hidratada), pensado para quem está comendo pouco: porção pequena, 14g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de queijo cottage","1 xícara de tapioca (goma hidratada)","1 unidade ou punhado de pepino","cebola picada"],"instrucoes":["Cozinhe ou aqueça tapioca (goma hidratada).","Tempere queijo cottage com sal, limão e ervas.","Grelhe ou salteie queijo cottage por 5-6 min.","Monte o bowl: base de tapioca (goma hidratada), queijo cottage por cima e pepino fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"14g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de carne moída magra (patinho) com mandioquinha cozida', 'bowl-de-carne-moida-magra-patinho-com-mandioquinha-cozida', 'Bowl de carne moída magra (patinho) com mandioquinha cozida, pensado para quem está comendo pouco: porção pequena, 29g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de carne moída magra (patinho)","1 xícara de mandioquinha cozida","1 unidade ou punhado de couve picada","páprica doce"],"instrucoes":["Cozinhe ou aqueça mandioquinha cozida.","Tempere carne moída magra (patinho) com sal, limão e ervas.","Grelhe ou salteie carne moída magra (patinho) por 5-6 min.","Monte o bowl: base de mandioquinha cozida, carne moída magra (patinho) por cima e couve picada fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"29g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de camarão limpo com purê de abóbora', 'bowl-de-camarao-limpo-com-pure-de-abobora', 'Bowl de camarão limpo com purê de abóbora, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de camarão limpo","1 xícara de purê de abóbora","1 unidade ou punhado de abacate","gengibre ralado"],"instrucoes":["Cozinhe ou aqueça purê de abóbora.","Tempere camarão limpo com sal, limão e ervas.","Grelhe ou salteie camarão limpo por 5-6 min.","Monte o bowl: base de purê de abóbora, camarão limpo por cima e abacate fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"27g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de tofu firme com cuscuz de milho', 'bowl-de-tofu-firme-com-cuscuz-de-milho', 'Bowl de tofu firme com cuscuz de milho, pensado para quem está comendo pouco: porção pequena, 13g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["120g de tofu firme","1 xícara de cuscuz de milho","1 unidade ou punhado de morango","cominho"],"instrucoes":["Cozinhe ou aqueça cuscuz de milho.","Tempere tofu firme com sal, limão e ervas.","Grelhe ou salteie tofu firme por 5-6 min.","Monte o bowl: base de cuscuz de milho, tofu firme por cima e morango fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"13g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de feijão preto cozido com torrada integral', 'bowl-de-feijao-preto-cozido-com-torrada-integral', 'Bowl de feijão preto cozido com torrada integral, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de feijão preto cozido","1 xícara de torrada integral","1 unidade ou punhado de manga","azeite"],"instrucoes":["Cozinhe ou aqueça torrada integral.","Tempere feijão preto cozido com sal, limão e ervas.","Grelhe ou salteie feijão preto cozido por 5-6 min.","Monte o bowl: base de torrada integral, feijão preto cozido por cima e manga fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"12g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de claras de ovo com banana amassada', 'bowl-de-claras-de-ovo-com-banana-amassada', 'Bowl de claras de ovo com banana amassada, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["3 un de claras de ovo","1 xícara de banana amassada","1 unidade ou punhado de cogumelos fatiados","limão"],"instrucoes":["Cozinhe ou aqueça banana amassada.","Tempere claras de ovo com sal, limão e ervas.","Grelhe ou salteie claras de ovo por 5-6 min.","Monte o bowl: base de banana amassada, claras de ovo por cima e cogumelos fatiados fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"15g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de sardinha em lata com creme de milho', 'bowl-de-sardinha-em-lata-com-creme-de-milho', 'Bowl de sardinha em lata com creme de milho, pensado para quem está comendo pouco: porção pequena, 23g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["80g de sardinha em lata","1 xícara de creme de milho","1 unidade ou punhado de vagem","sal e pimenta a gosto"],"instrucoes":["Cozinhe ou aqueça creme de milho.","Tempere sardinha em lata com sal, limão e ervas.","Grelhe ou salteie sardinha em lata por 5-6 min.","Monte o bowl: base de creme de milho, sardinha em lata por cima e vagem fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"23g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de salmão com batata-doce cozida', 'bowl-de-salmao-com-batata-doce-cozida', 'Bowl de salmão com batata-doce cozida, pensado para quem está comendo pouco: porção pequena, 23g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de salmão","1 xícara de batata-doce cozida","1 unidade ou punhado de espinafre","ervas finas"],"instrucoes":["Cozinhe ou aqueça batata-doce cozida.","Tempere salmão com sal, limão e ervas.","Grelhe ou salteie salmão por 5-6 min.","Monte o bowl: base de batata-doce cozida, salmão por cima e espinafre fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"23g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de peru moído com aveia em flocos', 'bowl-de-peru-moido-com-aveia-em-flocos', 'Bowl de peru moído com aveia em flocos, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["100g de peru moído","1 xícara de aveia em flocos","1 unidade ou punhado de abobrinha ralada","canela"],"instrucoes":["Cozinhe ou aqueça aveia em flocos.","Tempere peru moído com sal, limão e ervas.","Grelhe ou salteie peru moído por 5-6 min.","Monte o bowl: base de aveia em flocos, peru moído por cima e abobrinha ralada fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"30g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de queijo minas frescal com arroz integral cozido', 'bowl-de-queijo-minas-frescal-com-arroz-integral-cozido', 'Bowl de queijo minas frescal com arroz integral cozido, pensado para quem está comendo pouco: porção pequena, 13g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["60g de queijo minas frescal","1 xícara de arroz integral cozido","1 unidade ou punhado de cenoura ralada","mel"],"instrucoes":["Cozinhe ou aqueça arroz integral cozido.","Tempere queijo minas frescal com sal, limão e ervas.","Grelhe ou salteie queijo minas frescal por 5-6 min.","Monte o bowl: base de arroz integral cozido, queijo minas frescal por cima e cenoura ralada fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"13g","max_ingredients":4}', false, true, '["almoço","alta-proteina"]'::jsonb),
('recipe', 'Bowl de leite em pó desnatado com quinoa cozida', 'bowl-de-leite-em-po-desnatado-com-quinoa-cozida', 'Bowl de leite em pó desnatado com quinoa cozida, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 15 min.', '{"tempo":"15 min","ingredientes":["2 colher de sopa de leite em pó desnatado","1 xícara de quinoa cozida","1 unidade ou punhado de brócolis cozido","alho picado"],"instrucoes":["Cozinhe ou aqueça quinoa cozida.","Tempere leite em pó desnatado com sal, limão e ervas.","Grelhe ou salteie leite em pó desnatado por 5-6 min.","Monte o bowl: base de quinoa cozida, leite em pó desnatado por cima e brócolis cozido fresco ao lado.","Finalize com um fio de azeite."],"protein_estimate":"11g","max_ingredients":4}', true, true, '["almoço","alta-proteina"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 3 (recipes 41-60)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Vitamina de tomate cereja com peito de frango', 'vitamina-de-tomate-cereja-com-peito-de-frango', 'Vitamina de tomate cereja com peito de frango, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de peito de frango","cebola picada"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"30g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Vitamina de pepino com ovo', 'vitamina-de-pepino-com-ovo', 'Vitamina de pepino com ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["2 un de ovo","páprica doce"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"12g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de couve picada com ricota', 'vitamina-de-couve-picada-com-ricota', 'Vitamina de couve picada com ricota, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["80g de ricota","gengibre ralado"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"9g","max_ingredients":2}', true, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de abacate com iogurte grego', 'vitamina-de-abacate-com-iogurte-grego', 'Vitamina de abacate com iogurte grego, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["150g de iogurte grego","cominho"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"15g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de morango com atum em lata (água)', 'vitamina-de-morango-com-atum-em-lata-agua', 'Vitamina de morango com atum em lata (água), pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["80g de atum em lata (água)","azeite"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"21g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de manga com tilápia', 'vitamina-de-manga-com-tilapia', 'Vitamina de manga com tilápia, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["120g de tilápia","limão"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"31g","max_ingredients":2}', true, true, '["lanche","5-min","anti-náusea","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Vitamina de cogumelos fatiados com grão-de-bico cozido', 'vitamina-de-cogumelos-fatiados-com-grao-de-bico-cozido', 'Vitamina de cogumelos fatiados com grão-de-bico cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de grão-de-bico cozido","sal e pimenta a gosto"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"9g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de vagem com lentilha cozida', 'vitamina-de-vagem-com-lentilha-cozida', 'Vitamina de vagem com lentilha cozida, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de lentilha cozida","ervas finas"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"9g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de espinafre com whey protein (sabor neutro ou baunilha)', 'vitamina-de-espinafre-com-whey-protein-sabor-neutro-ou-baunilha', 'Vitamina de espinafre com whey protein (sabor neutro ou baunilha), pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","canela"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"24g","max_ingredients":2}', true, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de abobrinha ralada com queijo cottage', 'vitamina-de-abobrinha-ralada-com-queijo-cottage', 'Vitamina de abobrinha ralada com queijo cottage, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de queijo cottage","mel"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"11g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de cenoura ralada com carne moída magra (patinho)', 'vitamina-de-cenoura-ralada-com-carne-moida-magra-patinho', 'Vitamina de cenoura ralada com carne moída magra (patinho), pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de carne moída magra (patinho)","alho picado"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"26g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Vitamina de brócolis cozido com camarão limpo', 'vitamina-de-brocolis-cozido-com-camarao-limpo', 'Vitamina de brócolis cozido com camarão limpo, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de camarão limpo","cebola picada"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"24g","max_ingredients":2}', true, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de tomate cereja com tofu firme', 'vitamina-de-tomate-cereja-com-tofu-firme', 'Vitamina de tomate cereja com tofu firme, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["120g de tofu firme","páprica doce"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"10g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de pepino com feijão preto cozido', 'vitamina-de-pepino-com-feijao-preto-cozido', 'Vitamina de pepino com feijão preto cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de feijão preto cozido","gengibre ralado"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"9g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de couve picada com claras de ovo', 'vitamina-de-couve-picada-com-claras-de-ovo', 'Vitamina de couve picada com claras de ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["3 un de claras de ovo","cominho"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"12g","max_ingredients":2}', true, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de abacate com sardinha em lata', 'vitamina-de-abacate-com-sardinha-em-lata', 'Vitamina de abacate com sardinha em lata, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["80g de sardinha em lata","azeite"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"20g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de morango com salmão', 'vitamina-de-morango-com-salmao', 'Vitamina de morango com salmão, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de salmão","limão"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"20g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de manga com peru moído', 'vitamina-de-manga-com-peru-moido', 'Vitamina de manga com peru moído, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["100g de peru moído","sal e pimenta a gosto"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"27g","max_ingredients":2}', true, true, '["lanche","5-min","anti-náusea","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Vitamina de cogumelos fatiados com queijo minas frescal', 'vitamina-de-cogumelos-fatiados-com-queijo-minas-frescal', 'Vitamina de cogumelos fatiados com queijo minas frescal, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["60g de queijo minas frescal","ervas finas"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"10g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb),
('recipe', 'Vitamina de vagem com leite em pó desnatado', 'vitamina-de-vagem-com-leite-em-po-desnatado', 'Vitamina de vagem com leite em pó desnatado, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 5 min.', '{"tempo":"5 min","ingredientes":["2 colher de sopa de leite em pó desnatado","canela"],"instrucoes":["Coloque todos os ingredientes no liquidificador.","Bata por 1-2 min até ficar homogêneo.","Ajuste a consistência com água ou leite se necessário.","Sirva imediatamente, bem gelado."],"protein_estimate":"8g","max_ingredients":2}', false, true, '["lanche","5-min","anti-náusea","fácil-digestão"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 4 (recipes 61-80)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Creme de espinafre com peito de frango', 'creme-de-espinafre-com-peito-de-frango', 'Creme de espinafre com peito de frango, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de peito de frango","1 unidade ou punhado de espinafre","mel"],"instrucoes":["Refogue espinafre picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione peito de frango já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"30g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar","alta-proteina"]'::jsonb),
('recipe', 'Creme de abobrinha ralada com ovo', 'creme-de-abobrinha-ralada-com-ovo', 'Creme de abobrinha ralada com ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["2 un de ovo","1 unidade ou punhado de abobrinha ralada","alho picado"],"instrucoes":["Refogue abobrinha ralada picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione ovo já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de cenoura ralada com ricota', 'creme-de-cenoura-ralada-com-ricota', 'Creme de cenoura ralada com ricota, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["80g de ricota","1 unidade ou punhado de cenoura ralada","cebola picada"],"instrucoes":["Refogue cenoura ralada picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione ricota já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de brócolis cozido com iogurte grego', 'creme-de-brocolis-cozido-com-iogurte-grego', 'Creme de brócolis cozido com iogurte grego, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["150g de iogurte grego","1 unidade ou punhado de brócolis cozido","páprica doce"],"instrucoes":["Refogue brócolis cozido picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione iogurte grego já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"15g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de tomate cereja com atum em lata (água)', 'creme-de-tomate-cereja-com-atum-em-lata-agua', 'Creme de tomate cereja com atum em lata (água), pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["80g de atum em lata (água)","1 unidade ou punhado de tomate cereja","gengibre ralado"],"instrucoes":["Refogue tomate cereja picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione atum em lata (água) já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"21g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de pepino com tilápia', 'creme-de-pepino-com-tilapia', 'Creme de pepino com tilápia, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["120g de tilápia","1 unidade ou punhado de pepino","cominho"],"instrucoes":["Refogue pepino picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione tilápia já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"31g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar","alta-proteina"]'::jsonb),
('recipe', 'Creme de couve picada com grão-de-bico cozido', 'creme-de-couve-picada-com-grao-de-bico-cozido', 'Creme de couve picada com grão-de-bico cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de grão-de-bico cozido","1 unidade ou punhado de couve picada","azeite"],"instrucoes":["Refogue couve picada picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione grão-de-bico cozido já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"9g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de abacate com lentilha cozida', 'creme-de-abacate-com-lentilha-cozida', 'Creme de abacate com lentilha cozida, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de lentilha cozida","1 unidade ou punhado de abacate","limão"],"instrucoes":["Refogue abacate picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione lentilha cozida já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de morango com whey protein (sabor neutro ou baunilha)', 'creme-de-morango-com-whey-protein-sabor-neutro-ou-baunilha', 'Creme de morango com whey protein (sabor neutro ou baunilha), pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","1 unidade ou punhado de morango","sal e pimenta a gosto"],"instrucoes":["Refogue morango picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione whey protein (sabor neutro ou baunilha) já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de manga com queijo cottage', 'creme-de-manga-com-queijo-cottage', 'Creme de manga com queijo cottage, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de queijo cottage","1 unidade ou punhado de manga","ervas finas"],"instrucoes":["Refogue manga picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione queijo cottage já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"11g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de cogumelos fatiados com carne moída magra (patinho)', 'creme-de-cogumelos-fatiados-com-carne-moida-magra-patinho', 'Creme de cogumelos fatiados com carne moída magra (patinho), pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de carne moída magra (patinho)","1 unidade ou punhado de cogumelos fatiados","canela"],"instrucoes":["Refogue cogumelos fatiados picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione carne moída magra (patinho) já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"26g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar","alta-proteina"]'::jsonb),
('recipe', 'Creme de vagem com camarão limpo', 'creme-de-vagem-com-camarao-limpo', 'Creme de vagem com camarão limpo, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de camarão limpo","1 unidade ou punhado de vagem","mel"],"instrucoes":["Refogue vagem picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione camarão limpo já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de espinafre com tofu firme', 'creme-de-espinafre-com-tofu-firme', 'Creme de espinafre com tofu firme, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["120g de tofu firme","1 unidade ou punhado de espinafre","alho picado"],"instrucoes":["Refogue espinafre picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione tofu firme já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"10g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de abobrinha ralada com feijão preto cozido', 'creme-de-abobrinha-ralada-com-feijao-preto-cozido', 'Creme de abobrinha ralada com feijão preto cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de feijão preto cozido","1 unidade ou punhado de abobrinha ralada","cebola picada"],"instrucoes":["Refogue abobrinha ralada picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione feijão preto cozido já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de cenoura ralada com claras de ovo', 'creme-de-cenoura-ralada-com-claras-de-ovo', 'Creme de cenoura ralada com claras de ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["3 un de claras de ovo","1 unidade ou punhado de cenoura ralada","páprica doce"],"instrucoes":["Refogue cenoura ralada picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione claras de ovo já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de brócolis cozido com sardinha em lata', 'creme-de-brocolis-cozido-com-sardinha-em-lata', 'Creme de brócolis cozido com sardinha em lata, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["80g de sardinha em lata","1 unidade ou punhado de brócolis cozido","gengibre ralado"],"instrucoes":["Refogue brócolis cozido picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione sardinha em lata já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"20g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de tomate cereja com salmão', 'creme-de-tomate-cereja-com-salmao', 'Creme de tomate cereja com salmão, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de salmão","1 unidade ou punhado de tomate cereja","cominho"],"instrucoes":["Refogue tomate cereja picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione salmão já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"20g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de pepino com peru moído', 'creme-de-pepino-com-peru-moido', 'Creme de pepino com peru moído, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["100g de peru moído","1 unidade ou punhado de pepino","azeite"],"instrucoes":["Refogue pepino picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione peru moído já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"27g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar","alta-proteina"]'::jsonb),
('recipe', 'Creme de couve picada com queijo minas frescal', 'creme-de-couve-picada-com-queijo-minas-frescal', 'Creme de couve picada com queijo minas frescal, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["60g de queijo minas frescal","1 unidade ou punhado de couve picada","limão"],"instrucoes":["Refogue couve picada picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione queijo minas frescal já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"10g","max_ingredients":3}', true, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb),
('recipe', 'Creme de abacate com leite em pó desnatado', 'creme-de-abacate-com-leite-em-po-desnatado', 'Creme de abacate com leite em pó desnatado, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 25 min.', '{"tempo":"25 min","ingredientes":["2 colher de sopa de leite em pó desnatado","1 unidade ou punhado de abacate","sal e pimenta a gosto"],"instrucoes":["Refogue abacate picado em um fio de azeite.","Adicione água ou caldo até cobrir e cozinhe até amaciar.","Bata no liquidificador até virar um creme liso.","Volte à panela, adicione leite em pó desnatado já cozido e desfiado.","Aqueça por mais 3 min e tempere a gosto."],"protein_estimate":"8g","max_ingredients":3}', false, true, '["anti-náusea","fácil-digestão","jantar"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 5 (recipes 81-100)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Salada de peito de frango com morango', 'salada-de-peito-de-frango-com-morango', 'Salada de peito de frango com morango, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de peito de frango","1 unidade ou punhado de morango","ervas finas"],"instrucoes":["Cozinhe ou escorra peito de frango.","Corte morango e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"30g","max_ingredients":3}', false, true, '["almoço","5-min","alta-proteina"]'::jsonb),
('recipe', 'Salada de ovo com manga', 'salada-de-ovo-com-manga', 'Salada de ovo com manga, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["2 un de ovo","1 unidade ou punhado de manga","canela"],"instrucoes":["Cozinhe ou escorra ovo.","Corte manga e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"12g","max_ingredients":3}', true, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de ricota com cogumelos fatiados', 'salada-de-ricota-com-cogumelos-fatiados', 'Salada de ricota com cogumelos fatiados, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["80g de ricota","1 unidade ou punhado de cogumelos fatiados","mel"],"instrucoes":["Cozinhe ou escorra ricota.","Corte cogumelos fatiados e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de iogurte grego com vagem', 'salada-de-iogurte-grego-com-vagem', 'Salada de iogurte grego com vagem, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["150g de iogurte grego","1 unidade ou punhado de vagem","alho picado"],"instrucoes":["Cozinhe ou escorra iogurte grego.","Corte vagem e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"15g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de atum em lata (água) com espinafre', 'salada-de-atum-em-lata-agua-com-espinafre', 'Salada de atum em lata (água) com espinafre, pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["80g de atum em lata (água)","1 unidade ou punhado de espinafre","cebola picada"],"instrucoes":["Cozinhe ou escorra atum em lata (água).","Corte espinafre e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"21g","max_ingredients":3}', true, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de tilápia com abobrinha ralada', 'salada-de-tilapia-com-abobrinha-ralada', 'Salada de tilápia com abobrinha ralada, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["120g de tilápia","1 unidade ou punhado de abobrinha ralada","páprica doce"],"instrucoes":["Cozinhe ou escorra tilápia.","Corte abobrinha ralada e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"31g","max_ingredients":3}', false, true, '["almoço","5-min","alta-proteina"]'::jsonb),
('recipe', 'Salada de grão-de-bico cozido com cenoura ralada', 'salada-de-grao-de-bico-cozido-com-cenoura-ralada', 'Salada de grão-de-bico cozido com cenoura ralada, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de grão-de-bico cozido","1 unidade ou punhado de cenoura ralada","gengibre ralado"],"instrucoes":["Cozinhe ou escorra grão-de-bico cozido.","Corte cenoura ralada e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de lentilha cozida com brócolis cozido', 'salada-de-lentilha-cozida-com-brocolis-cozido', 'Salada de lentilha cozida com brócolis cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de lentilha cozida","1 unidade ou punhado de brócolis cozido","cominho"],"instrucoes":["Cozinhe ou escorra lentilha cozida.","Corte brócolis cozido e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"9g","max_ingredients":3}', true, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de whey protein (sabor neutro ou baunilha) com tomate cereja', 'salada-de-whey-protein-sabor-neutro-ou-baunilha-com-tomate-cereja', 'Salada de whey protein (sabor neutro ou baunilha) com tomate cereja, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","1 unidade ou punhado de tomate cereja","azeite"],"instrucoes":["Cozinhe ou escorra whey protein (sabor neutro ou baunilha).","Corte tomate cereja e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de queijo cottage com pepino', 'salada-de-queijo-cottage-com-pepino', 'Salada de queijo cottage com pepino, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de queijo cottage","1 unidade ou punhado de pepino","limão"],"instrucoes":["Cozinhe ou escorra queijo cottage.","Corte pepino e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"11g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de carne moída magra (patinho) com couve picada', 'salada-de-carne-moida-magra-patinho-com-couve-picada', 'Salada de carne moída magra (patinho) com couve picada, pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de carne moída magra (patinho)","1 unidade ou punhado de couve picada","sal e pimenta a gosto"],"instrucoes":["Cozinhe ou escorra carne moída magra (patinho).","Corte couve picada e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"26g","max_ingredients":3}', true, true, '["almoço","5-min","alta-proteina"]'::jsonb),
('recipe', 'Salada de camarão limpo com abacate', 'salada-de-camarao-limpo-com-abacate', 'Salada de camarão limpo com abacate, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de camarão limpo","1 unidade ou punhado de abacate","ervas finas"],"instrucoes":["Cozinhe ou escorra camarão limpo.","Corte abacate e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de tofu firme com morango', 'salada-de-tofu-firme-com-morango', 'Salada de tofu firme com morango, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["120g de tofu firme","1 unidade ou punhado de morango","canela"],"instrucoes":["Cozinhe ou escorra tofu firme.","Corte morango e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"10g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de feijão preto cozido com manga', 'salada-de-feijao-preto-cozido-com-manga', 'Salada de feijão preto cozido com manga, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de feijão preto cozido","1 unidade ou punhado de manga","mel"],"instrucoes":["Cozinhe ou escorra feijão preto cozido.","Corte manga e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"9g","max_ingredients":3}', true, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de claras de ovo com cogumelos fatiados', 'salada-de-claras-de-ovo-com-cogumelos-fatiados', 'Salada de claras de ovo com cogumelos fatiados, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["3 un de claras de ovo","1 unidade ou punhado de cogumelos fatiados","alho picado"],"instrucoes":["Cozinhe ou escorra claras de ovo.","Corte cogumelos fatiados e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de sardinha em lata com vagem', 'salada-de-sardinha-em-lata-com-vagem', 'Salada de sardinha em lata com vagem, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["80g de sardinha em lata","1 unidade ou punhado de vagem","cebola picada"],"instrucoes":["Cozinhe ou escorra sardinha em lata.","Corte vagem e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"20g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de salmão com espinafre', 'salada-de-salmao-com-espinafre', 'Salada de salmão com espinafre, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de salmão","1 unidade ou punhado de espinafre","páprica doce"],"instrucoes":["Cozinhe ou escorra salmão.","Corte espinafre e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"20g","max_ingredients":3}', true, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de peru moído com abobrinha ralada', 'salada-de-peru-moido-com-abobrinha-ralada', 'Salada de peru moído com abobrinha ralada, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de peru moído","1 unidade ou punhado de abobrinha ralada","gengibre ralado"],"instrucoes":["Cozinhe ou escorra peru moído.","Corte abobrinha ralada e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"27g","max_ingredients":3}', false, true, '["almoço","5-min","alta-proteina"]'::jsonb),
('recipe', 'Salada de queijo minas frescal com cenoura ralada', 'salada-de-queijo-minas-frescal-com-cenoura-ralada', 'Salada de queijo minas frescal com cenoura ralada, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["60g de queijo minas frescal","1 unidade ou punhado de cenoura ralada","cominho"],"instrucoes":["Cozinhe ou escorra queijo minas frescal.","Corte cenoura ralada e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"10g","max_ingredients":3}', false, true, '["almoço","5-min"]'::jsonb),
('recipe', 'Salada de leite em pó desnatado com brócolis cozido', 'salada-de-leite-em-po-desnatado-com-brocolis-cozido', 'Salada de leite em pó desnatado com brócolis cozido, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["2 colher de sopa de leite em pó desnatado","1 unidade ou punhado de brócolis cozido","azeite"],"instrucoes":["Cozinhe ou escorra leite em pó desnatado.","Corte brócolis cozido e demais vegetais em pedaços pequenos.","Misture tudo em uma tigela.","Tempere com azeite, limão, sal e pimenta.","Sirva em temperatura ambiente."],"protein_estimate":"8g","max_ingredients":3}', true, true, '["almoço","5-min"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 6 (recipes 101-120)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Wrap de peito de frango com tomate cereja', 'wrap-de-peito-de-frango-com-tomate-cereja', 'Wrap de peito de frango com tomate cereja, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de peito de frango","1 unidade ou punhado de tomate cereja","limão"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com peito de frango já temperado e tomate cereja.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"30g","max_ingredients":3}', false, true, '["lanche","5-min","alta-proteina"]'::jsonb),
('recipe', 'Wrap de ovo com pepino', 'wrap-de-ovo-com-pepino', 'Wrap de ovo com pepino, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["2 un de ovo","1 unidade ou punhado de pepino","sal e pimenta a gosto"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com ovo já temperado e pepino.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de ricota com couve picada', 'wrap-de-ricota-com-couve-picada', 'Wrap de ricota com couve picada, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["80g de ricota","1 unidade ou punhado de couve picada","ervas finas"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com ricota já temperado e couve picada.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"9g","max_ingredients":3}', true, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de iogurte grego com abacate', 'wrap-de-iogurte-grego-com-abacate', 'Wrap de iogurte grego com abacate, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["150g de iogurte grego","1 unidade ou punhado de abacate","canela"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com iogurte grego já temperado e abacate.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"15g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de atum em lata (água) com morango', 'wrap-de-atum-em-lata-agua-com-morango', 'Wrap de atum em lata (água) com morango, pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["80g de atum em lata (água)","1 unidade ou punhado de morango","mel"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com atum em lata (água) já temperado e morango.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"21g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de tilápia com manga', 'wrap-de-tilapia-com-manga', 'Wrap de tilápia com manga, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["120g de tilápia","1 unidade ou punhado de manga","alho picado"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com tilápia já temperado e manga.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"31g","max_ingredients":3}', true, true, '["lanche","5-min","alta-proteina"]'::jsonb),
('recipe', 'Wrap de grão-de-bico cozido com cogumelos fatiados', 'wrap-de-grao-de-bico-cozido-com-cogumelos-fatiados', 'Wrap de grão-de-bico cozido com cogumelos fatiados, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de grão-de-bico cozido","1 unidade ou punhado de cogumelos fatiados","cebola picada"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com grão-de-bico cozido já temperado e cogumelos fatiados.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de lentilha cozida com vagem', 'wrap-de-lentilha-cozida-com-vagem', 'Wrap de lentilha cozida com vagem, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de lentilha cozida","1 unidade ou punhado de vagem","páprica doce"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com lentilha cozida já temperado e vagem.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de whey protein (sabor neutro ou baunilha) com espinafre', 'wrap-de-whey-protein-sabor-neutro-ou-baunilha-com-espinafre', 'Wrap de whey protein (sabor neutro ou baunilha) com espinafre, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","1 unidade ou punhado de espinafre","gengibre ralado"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com whey protein (sabor neutro ou baunilha) já temperado e espinafre.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"24g","max_ingredients":3}', true, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de queijo cottage com abobrinha ralada', 'wrap-de-queijo-cottage-com-abobrinha-ralada', 'Wrap de queijo cottage com abobrinha ralada, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de queijo cottage","1 unidade ou punhado de abobrinha ralada","cominho"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com queijo cottage já temperado e abobrinha ralada.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"11g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de carne moída magra (patinho) com cenoura ralada', 'wrap-de-carne-moida-magra-patinho-com-cenoura-ralada', 'Wrap de carne moída magra (patinho) com cenoura ralada, pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de carne moída magra (patinho)","1 unidade ou punhado de cenoura ralada","azeite"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com carne moída magra (patinho) já temperado e cenoura ralada.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"26g","max_ingredients":3}', false, true, '["lanche","5-min","alta-proteina"]'::jsonb),
('recipe', 'Wrap de camarão limpo com brócolis cozido', 'wrap-de-camarao-limpo-com-brocolis-cozido', 'Wrap de camarão limpo com brócolis cozido, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de camarão limpo","1 unidade ou punhado de brócolis cozido","limão"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com camarão limpo já temperado e brócolis cozido.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"24g","max_ingredients":3}', true, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de tofu firme com tomate cereja', 'wrap-de-tofu-firme-com-tomate-cereja', 'Wrap de tofu firme com tomate cereja, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["120g de tofu firme","1 unidade ou punhado de tomate cereja","sal e pimenta a gosto"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com tofu firme já temperado e tomate cereja.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"10g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de feijão preto cozido com pepino', 'wrap-de-feijao-preto-cozido-com-pepino', 'Wrap de feijão preto cozido com pepino, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de feijão preto cozido","1 unidade ou punhado de pepino","ervas finas"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com feijão preto cozido já temperado e pepino.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de claras de ovo com couve picada', 'wrap-de-claras-de-ovo-com-couve-picada', 'Wrap de claras de ovo com couve picada, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["3 un de claras de ovo","1 unidade ou punhado de couve picada","canela"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com claras de ovo já temperado e couve picada.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"12g","max_ingredients":3}', true, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de sardinha em lata com abacate', 'wrap-de-sardinha-em-lata-com-abacate', 'Wrap de sardinha em lata com abacate, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["80g de sardinha em lata","1 unidade ou punhado de abacate","mel"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com sardinha em lata já temperado e abacate.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"20g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de salmão com morango', 'wrap-de-salmao-com-morango', 'Wrap de salmão com morango, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de salmão","1 unidade ou punhado de morango","alho picado"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com salmão já temperado e morango.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"20g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de peru moído com manga', 'wrap-de-peru-moido-com-manga', 'Wrap de peru moído com manga, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["100g de peru moído","1 unidade ou punhado de manga","cebola picada"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com peru moído já temperado e manga.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"27g","max_ingredients":3}', true, true, '["lanche","5-min","alta-proteina"]'::jsonb),
('recipe', 'Wrap de queijo minas frescal com cogumelos fatiados', 'wrap-de-queijo-minas-frescal-com-cogumelos-fatiados', 'Wrap de queijo minas frescal com cogumelos fatiados, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["60g de queijo minas frescal","1 unidade ou punhado de cogumelos fatiados","páprica doce"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com queijo minas frescal já temperado e cogumelos fatiados.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"10g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb),
('recipe', 'Wrap de leite em pó desnatado com vagem', 'wrap-de-leite-em-po-desnatado-com-vagem', 'Wrap de leite em pó desnatado com vagem, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 10 min.', '{"tempo":"10 min","ingredientes":["2 colher de sopa de leite em pó desnatado","1 unidade ou punhado de vagem","gengibre ralado"],"instrucoes":["Aqueça levemente o pão ou a tapioca.","Recheie com leite em pó desnatado já temperado e vagem.","Adicione um fio de azeite ou molho leve.","Enrole firme e corte ao meio."],"protein_estimate":"8g","max_ingredients":3}', false, true, '["lanche","5-min"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 7 (recipes 121-140)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Panqueca proteica de peito de frango e batata-doce cozida', 'panqueca-proteica-de-peito-de-frango-e-batata-doce-cozida', 'Panqueca proteica de peito de frango e batata-doce cozida, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de peito de frango","3 colheres de sopa de batata-doce cozida","cominho","1-2 ovos"],"instrucoes":["Amasse ou misture batata-doce cozida com peito de frango.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"30g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de ovo e aveia em flocos', 'panqueca-proteica-de-ovo-e-aveia-em-flocos', 'Panqueca proteica de ovo e aveia em flocos, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["2 un de ovo","3 colheres de sopa de aveia em flocos","azeite","1-2 ovos"],"instrucoes":["Amasse ou misture aveia em flocos com ovo.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"12g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de ricota e arroz integral cozido', 'panqueca-proteica-de-ricota-e-arroz-integral-cozido', 'Panqueca proteica de ricota e arroz integral cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["80g de ricota","3 colheres de sopa de arroz integral cozido","limão","1-2 ovos"],"instrucoes":["Amasse ou misture arroz integral cozido com ricota.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"9g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de iogurte grego e quinoa cozida', 'panqueca-proteica-de-iogurte-grego-e-quinoa-cozida', 'Panqueca proteica de iogurte grego e quinoa cozida, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["150g de iogurte grego","3 colheres de sopa de quinoa cozida","sal e pimenta a gosto","1-2 ovos"],"instrucoes":["Amasse ou misture quinoa cozida com iogurte grego.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"15g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de atum em lata (água) e pão integral', 'panqueca-proteica-de-atum-em-lata-agua-e-pao-integral', 'Panqueca proteica de atum em lata (água) e pão integral, pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["80g de atum em lata (água)","3 colheres de sopa de pão integral","ervas finas","1-2 ovos"],"instrucoes":["Amasse ou misture pão integral com atum em lata (água).","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"21g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de tilápia e tapioca (goma hidratada)', 'panqueca-proteica-de-tilapia-e-tapioca-goma-hidratada', 'Panqueca proteica de tilápia e tapioca (goma hidratada), pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["120g de tilápia","3 colheres de sopa de tapioca (goma hidratada)","canela","1-2 ovos"],"instrucoes":["Amasse ou misture tapioca (goma hidratada) com tilápia.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"31g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de grão-de-bico cozido e mandioquinha cozida', 'panqueca-proteica-de-grao-de-bico-cozido-e-mandioquinha-cozida', 'Panqueca proteica de grão-de-bico cozido e mandioquinha cozida, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de grão-de-bico cozido","3 colheres de sopa de mandioquinha cozida","mel","1-2 ovos"],"instrucoes":["Amasse ou misture mandioquinha cozida com grão-de-bico cozido.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"9g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de lentilha cozida e purê de abóbora', 'panqueca-proteica-de-lentilha-cozida-e-pure-de-abobora', 'Panqueca proteica de lentilha cozida e purê de abóbora, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de lentilha cozida","3 colheres de sopa de purê de abóbora","alho picado","1-2 ovos"],"instrucoes":["Amasse ou misture purê de abóbora com lentilha cozida.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"9g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de whey protein (sabor neutro ou baunilha) e cuscuz de milho', 'panqueca-proteica-de-whey-protein-sabor-neutro-ou-baunilha-e-cuscuz-de-milho', 'Panqueca proteica de whey protein (sabor neutro ou baunilha) e cuscuz de milho, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","3 colheres de sopa de cuscuz de milho","cebola picada","1-2 ovos"],"instrucoes":["Amasse ou misture cuscuz de milho com whey protein (sabor neutro ou baunilha).","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"24g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de queijo cottage e torrada integral', 'panqueca-proteica-de-queijo-cottage-e-torrada-integral', 'Panqueca proteica de queijo cottage e torrada integral, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de queijo cottage","3 colheres de sopa de torrada integral","páprica doce","1-2 ovos"],"instrucoes":["Amasse ou misture torrada integral com queijo cottage.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"11g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de carne moída magra (patinho) e banana amassada', 'panqueca-proteica-de-carne-moida-magra-patinho-e-banana-amassada', 'Panqueca proteica de carne moída magra (patinho) e banana amassada, pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de carne moída magra (patinho)","3 colheres de sopa de banana amassada","gengibre ralado","1-2 ovos"],"instrucoes":["Amasse ou misture banana amassada com carne moída magra (patinho).","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"26g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de camarão limpo e creme de milho', 'panqueca-proteica-de-camarao-limpo-e-creme-de-milho', 'Panqueca proteica de camarão limpo e creme de milho, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de camarão limpo","3 colheres de sopa de creme de milho","cominho","1-2 ovos"],"instrucoes":["Amasse ou misture creme de milho com camarão limpo.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"24g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de tofu firme e batata-doce cozida', 'panqueca-proteica-de-tofu-firme-e-batata-doce-cozida', 'Panqueca proteica de tofu firme e batata-doce cozida, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["120g de tofu firme","3 colheres de sopa de batata-doce cozida","azeite","1-2 ovos"],"instrucoes":["Amasse ou misture batata-doce cozida com tofu firme.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"10g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de feijão preto cozido e aveia em flocos', 'panqueca-proteica-de-feijao-preto-cozido-e-aveia-em-flocos', 'Panqueca proteica de feijão preto cozido e aveia em flocos, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de feijão preto cozido","3 colheres de sopa de aveia em flocos","limão","1-2 ovos"],"instrucoes":["Amasse ou misture aveia em flocos com feijão preto cozido.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"9g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de claras de ovo e arroz integral cozido', 'panqueca-proteica-de-claras-de-ovo-e-arroz-integral-cozido', 'Panqueca proteica de claras de ovo e arroz integral cozido, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["3 un de claras de ovo","3 colheres de sopa de arroz integral cozido","sal e pimenta a gosto","1-2 ovos"],"instrucoes":["Amasse ou misture arroz integral cozido com claras de ovo.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"12g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de sardinha em lata e quinoa cozida', 'panqueca-proteica-de-sardinha-em-lata-e-quinoa-cozida', 'Panqueca proteica de sardinha em lata e quinoa cozida, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["80g de sardinha em lata","3 colheres de sopa de quinoa cozida","ervas finas","1-2 ovos"],"instrucoes":["Amasse ou misture quinoa cozida com sardinha em lata.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"20g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de salmão e pão integral', 'panqueca-proteica-de-salmao-e-pao-integral', 'Panqueca proteica de salmão e pão integral, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de salmão","3 colheres de sopa de pão integral","canela","1-2 ovos"],"instrucoes":["Amasse ou misture pão integral com salmão.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"20g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de peru moído e tapioca (goma hidratada)', 'panqueca-proteica-de-peru-moido-e-tapioca-goma-hidratada', 'Panqueca proteica de peru moído e tapioca (goma hidratada), pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["100g de peru moído","3 colheres de sopa de tapioca (goma hidratada)","mel","1-2 ovos"],"instrucoes":["Amasse ou misture tapioca (goma hidratada) com peru moído.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"27g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de queijo minas frescal e mandioquinha cozida', 'panqueca-proteica-de-queijo-minas-frescal-e-mandioquinha-cozida', 'Panqueca proteica de queijo minas frescal e mandioquinha cozida, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["60g de queijo minas frescal","3 colheres de sopa de mandioquinha cozida","alho picado","1-2 ovos"],"instrucoes":["Amasse ou misture mandioquinha cozida com queijo minas frescal.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"10g","max_ingredients":4}', true, true, '["café-da-manhã","alta-proteina"]'::jsonb),
('recipe', 'Panqueca proteica de leite em pó desnatado e purê de abóbora', 'panqueca-proteica-de-leite-em-po-desnatado-e-pure-de-abobora', 'Panqueca proteica de leite em pó desnatado e purê de abóbora, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 12 min.', '{"tempo":"12 min","ingredientes":["2 colher de sopa de leite em pó desnatado","3 colheres de sopa de purê de abóbora","cebola picada","1-2 ovos"],"instrucoes":["Amasse ou misture purê de abóbora com leite em pó desnatado.","Adicione o ovo e misture até formar uma massa homogênea.","Despeje porções pequenas em frigideira antiaderente aquecida.","Doure dos dois lados em fogo baixo.","Sirva morno."],"protein_estimate":"8g","max_ingredients":4}', false, true, '["café-da-manhã","alta-proteina"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 8 (recipes 141-160)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Escondidinho de peito de frango com cuscuz de milho', 'escondidinho-de-peito-de-frango-com-cuscuz-de-milho', 'Escondidinho de peito de frango com cuscuz de milho, pensado para quem está comendo pouco: porção pequena, 33g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de peito de frango","1 xícara de cuscuz de milho","páprica doce"],"instrucoes":["Cozinhe cuscuz de milho até ficar macio e amasse até virar purê.","Refogue peito de frango temperado até dourar.","Em um refratário, monte camadas: purê, peito de frango, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"33g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de ovo com torrada integral', 'escondidinho-de-ovo-com-torrada-integral', 'Escondidinho de ovo com torrada integral, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["2 un de ovo","1 xícara de torrada integral","gengibre ralado"],"instrucoes":["Cozinhe torrada integral até ficar macio e amasse até virar purê.","Refogue ovo temperado até dourar.","Em um refratário, monte camadas: purê, ovo, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"15g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de ricota com banana amassada', 'escondidinho-de-ricota-com-banana-amassada', 'Escondidinho de ricota com banana amassada, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["80g de ricota","1 xícara de banana amassada","cominho"],"instrucoes":["Cozinhe banana amassada até ficar macio e amasse até virar purê.","Refogue ricota temperado até dourar.","Em um refratário, monte camadas: purê, ricota, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de iogurte grego com creme de milho', 'escondidinho-de-iogurte-grego-com-creme-de-milho', 'Escondidinho de iogurte grego com creme de milho, pensado para quem está comendo pouco: porção pequena, 18g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["150g de iogurte grego","1 xícara de creme de milho","azeite"],"instrucoes":["Cozinhe creme de milho até ficar macio e amasse até virar purê.","Refogue iogurte grego temperado até dourar.","Em um refratário, monte camadas: purê, iogurte grego, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"18g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de atum em lata (água) com batata-doce cozida', 'escondidinho-de-atum-em-lata-agua-com-batata-doce-cozida', 'Escondidinho de atum em lata (água) com batata-doce cozida, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["80g de atum em lata (água)","1 xícara de batata-doce cozida","limão"],"instrucoes":["Cozinhe batata-doce cozida até ficar macio e amasse até virar purê.","Refogue atum em lata (água) temperado até dourar.","Em um refratário, monte camadas: purê, atum em lata (água), purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"24g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de tilápia com aveia em flocos', 'escondidinho-de-tilapia-com-aveia-em-flocos', 'Escondidinho de tilápia com aveia em flocos, pensado para quem está comendo pouco: porção pequena, 34g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["120g de tilápia","1 xícara de aveia em flocos","sal e pimenta a gosto"],"instrucoes":["Cozinhe aveia em flocos até ficar macio e amasse até virar purê.","Refogue tilápia temperado até dourar.","Em um refratário, monte camadas: purê, tilápia, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"34g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de grão-de-bico cozido com arroz integral cozido', 'escondidinho-de-grao-de-bico-cozido-com-arroz-integral-cozido', 'Escondidinho de grão-de-bico cozido com arroz integral cozido, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de grão-de-bico cozido","1 xícara de arroz integral cozido","ervas finas"],"instrucoes":["Cozinhe arroz integral cozido até ficar macio e amasse até virar purê.","Refogue grão-de-bico cozido temperado até dourar.","Em um refratário, monte camadas: purê, grão-de-bico cozido, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de lentilha cozida com quinoa cozida', 'escondidinho-de-lentilha-cozida-com-quinoa-cozida', 'Escondidinho de lentilha cozida com quinoa cozida, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de lentilha cozida","1 xícara de quinoa cozida","canela"],"instrucoes":["Cozinhe quinoa cozida até ficar macio e amasse até virar purê.","Refogue lentilha cozida temperado até dourar.","Em um refratário, monte camadas: purê, lentilha cozida, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"12g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de whey protein (sabor neutro ou baunilha) com pão integral', 'escondidinho-de-whey-protein-sabor-neutro-ou-baunilha-com-pao-integral', 'Escondidinho de whey protein (sabor neutro ou baunilha) com pão integral, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","1 xícara de pão integral","mel"],"instrucoes":["Cozinhe pão integral até ficar macio e amasse até virar purê.","Refogue whey protein (sabor neutro ou baunilha) temperado até dourar.","Em um refratário, monte camadas: purê, whey protein (sabor neutro ou baunilha), purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"27g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de queijo cottage com tapioca (goma hidratada)', 'escondidinho-de-queijo-cottage-com-tapioca-goma-hidratada', 'Escondidinho de queijo cottage com tapioca (goma hidratada), pensado para quem está comendo pouco: porção pequena, 14g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de queijo cottage","1 xícara de tapioca (goma hidratada)","alho picado"],"instrucoes":["Cozinhe tapioca (goma hidratada) até ficar macio e amasse até virar purê.","Refogue queijo cottage temperado até dourar.","Em um refratário, monte camadas: purê, queijo cottage, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"14g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de carne moída magra (patinho) com mandioquinha cozida', 'escondidinho-de-carne-moida-magra-patinho-com-mandioquinha-cozida', 'Escondidinho de carne moída magra (patinho) com mandioquinha cozida, pensado para quem está comendo pouco: porção pequena, 29g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de carne moída magra (patinho)","1 xícara de mandioquinha cozida","cebola picada"],"instrucoes":["Cozinhe mandioquinha cozida até ficar macio e amasse até virar purê.","Refogue carne moída magra (patinho) temperado até dourar.","Em um refratário, monte camadas: purê, carne moída magra (patinho), purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"29g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de camarão limpo com purê de abóbora', 'escondidinho-de-camarao-limpo-com-pure-de-abobora', 'Escondidinho de camarão limpo com purê de abóbora, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de camarão limpo","1 xícara de purê de abóbora","páprica doce"],"instrucoes":["Cozinhe purê de abóbora até ficar macio e amasse até virar purê.","Refogue camarão limpo temperado até dourar.","Em um refratário, monte camadas: purê, camarão limpo, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"27g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de tofu firme com cuscuz de milho', 'escondidinho-de-tofu-firme-com-cuscuz-de-milho', 'Escondidinho de tofu firme com cuscuz de milho, pensado para quem está comendo pouco: porção pequena, 13g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["120g de tofu firme","1 xícara de cuscuz de milho","gengibre ralado"],"instrucoes":["Cozinhe cuscuz de milho até ficar macio e amasse até virar purê.","Refogue tofu firme temperado até dourar.","Em um refratário, monte camadas: purê, tofu firme, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"13g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de feijão preto cozido com torrada integral', 'escondidinho-de-feijao-preto-cozido-com-torrada-integral', 'Escondidinho de feijão preto cozido com torrada integral, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de feijão preto cozido","1 xícara de torrada integral","cominho"],"instrucoes":["Cozinhe torrada integral até ficar macio e amasse até virar purê.","Refogue feijão preto cozido temperado até dourar.","Em um refratário, monte camadas: purê, feijão preto cozido, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"12g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de claras de ovo com banana amassada', 'escondidinho-de-claras-de-ovo-com-banana-amassada', 'Escondidinho de claras de ovo com banana amassada, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["3 un de claras de ovo","1 xícara de banana amassada","azeite"],"instrucoes":["Cozinhe banana amassada até ficar macio e amasse até virar purê.","Refogue claras de ovo temperado até dourar.","Em um refratário, monte camadas: purê, claras de ovo, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"15g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de sardinha em lata com creme de milho', 'escondidinho-de-sardinha-em-lata-com-creme-de-milho', 'Escondidinho de sardinha em lata com creme de milho, pensado para quem está comendo pouco: porção pequena, 23g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["80g de sardinha em lata","1 xícara de creme de milho","limão"],"instrucoes":["Cozinhe creme de milho até ficar macio e amasse até virar purê.","Refogue sardinha em lata temperado até dourar.","Em um refratário, monte camadas: purê, sardinha em lata, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"23g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de salmão com batata-doce cozida', 'escondidinho-de-salmao-com-batata-doce-cozida', 'Escondidinho de salmão com batata-doce cozida, pensado para quem está comendo pouco: porção pequena, 23g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de salmão","1 xícara de batata-doce cozida","sal e pimenta a gosto"],"instrucoes":["Cozinhe batata-doce cozida até ficar macio e amasse até virar purê.","Refogue salmão temperado até dourar.","Em um refratário, monte camadas: purê, salmão, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"23g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de peru moído com aveia em flocos', 'escondidinho-de-peru-moido-com-aveia-em-flocos', 'Escondidinho de peru moído com aveia em flocos, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["100g de peru moído","1 xícara de aveia em flocos","ervas finas"],"instrucoes":["Cozinhe aveia em flocos até ficar macio e amasse até virar purê.","Refogue peru moído temperado até dourar.","Em um refratário, monte camadas: purê, peru moído, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"30g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de queijo minas frescal com arroz integral cozido', 'escondidinho-de-queijo-minas-frescal-com-arroz-integral-cozido', 'Escondidinho de queijo minas frescal com arroz integral cozido, pensado para quem está comendo pouco: porção pequena, 13g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["60g de queijo minas frescal","1 xícara de arroz integral cozido","canela"],"instrucoes":["Cozinhe arroz integral cozido até ficar macio e amasse até virar purê.","Refogue queijo minas frescal temperado até dourar.","Em um refratário, monte camadas: purê, queijo minas frescal, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"13g","max_ingredients":3}', false, true, '["jantar","alta-proteina"]'::jsonb),
('recipe', 'Escondidinho de leite em pó desnatado com quinoa cozida', 'escondidinho-de-leite-em-po-desnatado-com-quinoa-cozida', 'Escondidinho de leite em pó desnatado com quinoa cozida, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 30 min.', '{"tempo":"30 min","ingredientes":["2 colher de sopa de leite em pó desnatado","1 xícara de quinoa cozida","mel"],"instrucoes":["Cozinhe quinoa cozida até ficar macio e amasse até virar purê.","Refogue leite em pó desnatado temperado até dourar.","Em um refratário, monte camadas: purê, leite em pó desnatado, purê.","Leve ao forno preaquecido por 10 min para gratinar.","Sirva quente."],"protein_estimate":"11g","max_ingredients":3}', true, true, '["jantar","alta-proteina"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 9 (recipes 161-180)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Patê de peito de frango', 'pate-de-peito-de-frango', 'Patê de peito de frango, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de peito de frango","alho picado"],"instrucoes":["Amasse ou processe peito de frango até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"30g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Patê de ovo', 'pate-de-ovo', 'Patê de ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["2 un de ovo","cebola picada"],"instrucoes":["Amasse ou processe ovo até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"12g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de ricota', 'pate-de-ricota', 'Patê de ricota, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["80g de ricota","páprica doce"],"instrucoes":["Amasse ou processe ricota até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"9g","max_ingredients":2}', true, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de iogurte grego', 'pate-de-iogurte-grego', 'Patê de iogurte grego, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["150g de iogurte grego","gengibre ralado"],"instrucoes":["Amasse ou processe iogurte grego até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"15g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de atum em lata (água)', 'pate-de-atum-em-lata-agua', 'Patê de atum em lata (água), pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["80g de atum em lata (água)","cominho"],"instrucoes":["Amasse ou processe atum em lata (água) até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"21g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de tilápia', 'pate-de-tilapia', 'Patê de tilápia, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["120g de tilápia","azeite"],"instrucoes":["Amasse ou processe tilápia até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"31g","max_ingredients":2}', true, true, '["lanche","5-min","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Patê de grão-de-bico cozido', 'pate-de-grao-de-bico-cozido', 'Patê de grão-de-bico cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de grão-de-bico cozido","limão"],"instrucoes":["Amasse ou processe grão-de-bico cozido até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"9g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de lentilha cozida', 'pate-de-lentilha-cozida', 'Patê de lentilha cozida, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de lentilha cozida","sal e pimenta a gosto"],"instrucoes":["Amasse ou processe lentilha cozida até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"9g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de whey protein (sabor neutro ou baunilha)', 'pate-de-whey-protein-sabor-neutro-ou-baunilha', 'Patê de whey protein (sabor neutro ou baunilha), pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","ervas finas"],"instrucoes":["Amasse ou processe whey protein (sabor neutro ou baunilha) até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"24g","max_ingredients":2}', true, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de queijo cottage', 'pate-de-queijo-cottage', 'Patê de queijo cottage, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de queijo cottage","canela"],"instrucoes":["Amasse ou processe queijo cottage até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"11g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de carne moída magra (patinho)', 'pate-de-carne-moida-magra-patinho', 'Patê de carne moída magra (patinho), pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de carne moída magra (patinho)","mel"],"instrucoes":["Amasse ou processe carne moída magra (patinho) até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"26g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Patê de camarão limpo', 'pate-de-camarao-limpo', 'Patê de camarão limpo, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de camarão limpo","alho picado"],"instrucoes":["Amasse ou processe camarão limpo até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"24g","max_ingredients":2}', true, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de tofu firme', 'pate-de-tofu-firme', 'Patê de tofu firme, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["120g de tofu firme","cebola picada"],"instrucoes":["Amasse ou processe tofu firme até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"10g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de feijão preto cozido', 'pate-de-feijao-preto-cozido', 'Patê de feijão preto cozido, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de feijão preto cozido","páprica doce"],"instrucoes":["Amasse ou processe feijão preto cozido até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"9g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de claras de ovo', 'pate-de-claras-de-ovo', 'Patê de claras de ovo, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["3 un de claras de ovo","gengibre ralado"],"instrucoes":["Amasse ou processe claras de ovo até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"12g","max_ingredients":2}', true, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de sardinha em lata', 'pate-de-sardinha-em-lata', 'Patê de sardinha em lata, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["80g de sardinha em lata","cominho"],"instrucoes":["Amasse ou processe sardinha em lata até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"20g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de salmão', 'pate-de-salmao', 'Patê de salmão, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de salmão","azeite"],"instrucoes":["Amasse ou processe salmão até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"20g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de peru moído', 'pate-de-peru-moido', 'Patê de peru moído, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["100g de peru moído","limão"],"instrucoes":["Amasse ou processe peru moído até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"27g","max_ingredients":2}', true, true, '["lanche","5-min","fácil-digestão","alta-proteina"]'::jsonb),
('recipe', 'Patê de queijo minas frescal', 'pate-de-queijo-minas-frescal', 'Patê de queijo minas frescal, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["60g de queijo minas frescal","sal e pimenta a gosto"],"instrucoes":["Amasse ou processe queijo minas frescal até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"10g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb),
('recipe', 'Patê de leite em pó desnatado', 'pate-de-leite-em-po-desnatado', 'Patê de leite em pó desnatado, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 8 min.', '{"tempo":"8 min","ingredientes":["2 colher de sopa de leite em pó desnatado","ervas finas"],"instrucoes":["Amasse ou processe leite em pó desnatado até ficar cremoso.","Misture com um fio de azeite e limão.","Tempere com sal, pimenta e ervas a gosto.","Leve à geladeira por 10 min antes de servir."],"protein_estimate":"8g","max_ingredients":2}', false, true, '["lanche","5-min","fácil-digestão"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Batch 10 (recipes 181-200)
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('recipe', 'Espetinho de peito de frango com espinafre', 'espetinho-de-peito-de-frango-com-espinafre', 'Espetinho de peito de frango com espinafre, pensado para quem está comendo pouco: porção pequena, 30g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de peito de frango","1 unidade ou punhado de espinafre","canela"],"instrucoes":["Corte peito de frango e espinafre em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"30g","max_ingredients":3}', true, true, '["jantar","almoço","alta-proteina"]'::jsonb),
('recipe', 'Espetinho de ovo com abobrinha ralada', 'espetinho-de-ovo-com-abobrinha-ralada', 'Espetinho de ovo com abobrinha ralada, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["2 un de ovo","1 unidade ou punhado de abobrinha ralada","mel"],"instrucoes":["Corte ovo e abobrinha ralada em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de ricota com cenoura ralada', 'espetinho-de-ricota-com-cenoura-ralada', 'Espetinho de ricota com cenoura ralada, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["80g de ricota","1 unidade ou punhado de cenoura ralada","alho picado"],"instrucoes":["Corte ricota e cenoura ralada em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de iogurte grego com brócolis cozido', 'espetinho-de-iogurte-grego-com-brocolis-cozido', 'Espetinho de iogurte grego com brócolis cozido, pensado para quem está comendo pouco: porção pequena, 15g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["150g de iogurte grego","1 unidade ou punhado de brócolis cozido","cebola picada"],"instrucoes":["Corte iogurte grego e brócolis cozido em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"15g","max_ingredients":3}', true, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de atum em lata (água) com tomate cereja', 'espetinho-de-atum-em-lata-agua-com-tomate-cereja', 'Espetinho de atum em lata (água) com tomate cereja, pensado para quem está comendo pouco: porção pequena, 21g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["80g de atum em lata (água)","1 unidade ou punhado de tomate cereja","páprica doce"],"instrucoes":["Corte atum em lata (água) e tomate cereja em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"21g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de tilápia com pepino', 'espetinho-de-tilapia-com-pepino', 'Espetinho de tilápia com pepino, pensado para quem está comendo pouco: porção pequena, 31g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["120g de tilápia","1 unidade ou punhado de pepino","gengibre ralado"],"instrucoes":["Corte tilápia e pepino em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"31g","max_ingredients":3}', false, true, '["jantar","almoço","alta-proteina"]'::jsonb),
('recipe', 'Espetinho de grão-de-bico cozido com couve picada', 'espetinho-de-grao-de-bico-cozido-com-couve-picada', 'Espetinho de grão-de-bico cozido com couve picada, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de grão-de-bico cozido","1 unidade ou punhado de couve picada","cominho"],"instrucoes":["Corte grão-de-bico cozido e couve picada em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"9g","max_ingredients":3}', true, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de lentilha cozida com abacate', 'espetinho-de-lentilha-cozida-com-abacate', 'Espetinho de lentilha cozida com abacate, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de lentilha cozida","1 unidade ou punhado de abacate","azeite"],"instrucoes":["Corte lentilha cozida e abacate em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de whey protein (sabor neutro ou baunilha) com morango', 'espetinho-de-whey-protein-sabor-neutro-ou-baunilha-com-morango', 'Espetinho de whey protein (sabor neutro ou baunilha) com morango, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["1 scoop de whey protein (sabor neutro ou baunilha)","1 unidade ou punhado de morango","limão"],"instrucoes":["Corte whey protein (sabor neutro ou baunilha) e morango em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de queijo cottage com manga', 'espetinho-de-queijo-cottage-com-manga', 'Espetinho de queijo cottage com manga, pensado para quem está comendo pouco: porção pequena, 11g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de queijo cottage","1 unidade ou punhado de manga","sal e pimenta a gosto"],"instrucoes":["Corte queijo cottage e manga em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"11g","max_ingredients":3}', true, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de carne moída magra (patinho) com cogumelos fatiados', 'espetinho-de-carne-moida-magra-patinho-com-cogumelos-fatiados', 'Espetinho de carne moída magra (patinho) com cogumelos fatiados, pensado para quem está comendo pouco: porção pequena, 26g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de carne moída magra (patinho)","1 unidade ou punhado de cogumelos fatiados","ervas finas"],"instrucoes":["Corte carne moída magra (patinho) e cogumelos fatiados em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"26g","max_ingredients":3}', false, true, '["jantar","almoço","alta-proteina"]'::jsonb),
('recipe', 'Espetinho de camarão limpo com vagem', 'espetinho-de-camarao-limpo-com-vagem', 'Espetinho de camarão limpo com vagem, pensado para quem está comendo pouco: porção pequena, 24g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de camarão limpo","1 unidade ou punhado de vagem","canela"],"instrucoes":["Corte camarão limpo e vagem em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"24g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de tofu firme com espinafre', 'espetinho-de-tofu-firme-com-espinafre', 'Espetinho de tofu firme com espinafre, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["120g de tofu firme","1 unidade ou punhado de espinafre","mel"],"instrucoes":["Corte tofu firme e espinafre em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"10g","max_ingredients":3}', true, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de feijão preto cozido com abobrinha ralada', 'espetinho-de-feijao-preto-cozido-com-abobrinha-ralada', 'Espetinho de feijão preto cozido com abobrinha ralada, pensado para quem está comendo pouco: porção pequena, 9g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de feijão preto cozido","1 unidade ou punhado de abobrinha ralada","alho picado"],"instrucoes":["Corte feijão preto cozido e abobrinha ralada em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"9g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de claras de ovo com cenoura ralada', 'espetinho-de-claras-de-ovo-com-cenoura-ralada', 'Espetinho de claras de ovo com cenoura ralada, pensado para quem está comendo pouco: porção pequena, 12g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["3 un de claras de ovo","1 unidade ou punhado de cenoura ralada","cebola picada"],"instrucoes":["Corte claras de ovo e cenoura ralada em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"12g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de sardinha em lata com brócolis cozido', 'espetinho-de-sardinha-em-lata-com-brocolis-cozido', 'Espetinho de sardinha em lata com brócolis cozido, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["80g de sardinha em lata","1 unidade ou punhado de brócolis cozido","páprica doce"],"instrucoes":["Corte sardinha em lata e brócolis cozido em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"20g","max_ingredients":3}', true, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de salmão com tomate cereja', 'espetinho-de-salmao-com-tomate-cereja', 'Espetinho de salmão com tomate cereja, pensado para quem está comendo pouco: porção pequena, 20g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de salmão","1 unidade ou punhado de tomate cereja","gengibre ralado"],"instrucoes":["Corte salmão e tomate cereja em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"20g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de peru moído com pepino', 'espetinho-de-peru-moido-com-pepino', 'Espetinho de peru moído com pepino, pensado para quem está comendo pouco: porção pequena, 27g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["100g de peru moído","1 unidade ou punhado de pepino","cominho"],"instrucoes":["Corte peru moído e pepino em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"27g","max_ingredients":3}', false, true, '["jantar","almoço","alta-proteina"]'::jsonb),
('recipe', 'Espetinho de queijo minas frescal com couve picada', 'espetinho-de-queijo-minas-frescal-com-couve-picada', 'Espetinho de queijo minas frescal com couve picada, pensado para quem está comendo pouco: porção pequena, 10g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["60g de queijo minas frescal","1 unidade ou punhado de couve picada","azeite"],"instrucoes":["Corte queijo minas frescal e couve picada em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"10g","max_ingredients":3}', true, true, '["jantar","almoço"]'::jsonb),
('recipe', 'Espetinho de leite em pó desnatado com abacate', 'espetinho-de-leite-em-po-desnatado-com-abacate', 'Espetinho de leite em pó desnatado com abacate, pensado para quem está comendo pouco: porção pequena, 8g de proteína e preparo em 18 min.', '{"tempo":"18 min","ingredientes":["2 colher de sopa de leite em pó desnatado","1 unidade ou punhado de abacate","limão"],"instrucoes":["Corte leite em pó desnatado e abacate em cubos.","Tempere e monte os espetos alternando os ingredientes.","Grelhe ou asse até dourar por igual.","Sirva quente, com limão por cima."],"protein_estimate":"8g","max_ingredients":3}', false, true, '["jantar","almoço"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- CanetaOS - Schema v6: Water goal, one-entry-per-day
-- constraint, and phase-based "tip of the day" content
-- =====================================================

ALTER TABLE tracker_entries
  ADD CONSTRAINT tracker_entries_user_date_unique UNIQUE (user_id, entry_date);

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS daily_water_goal_ml INTEGER NOT NULL DEFAULT 2000;

-- content_items.type = 'tip': short rotating tips shown on the Home screen,
-- tagged by treatment_duration_category so the tip matches the user's phase.
INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
('tip', 'Vá com calma nas primeiras doses', 'tip-inicio-1', null, 'Nas primeiras semanas o apetite muda rápido. Coma devagar e pare assim que sentir saciedade — não precisa terminar o prato.', false, true, '["starting","less_than_4_weeks"]'),
('tip', 'Hidratação antes da fome', 'tip-inicio-2', null, 'Beber água ao longo do dia ajuda a diferenciar sede de fome e reduz o desconforto digestivo comum no início.', false, true, '["starting","less_than_4_weeks"]'),
('tip', 'Náusea matinal? Coma antes de levantar', 'tip-inicio-3', null, 'Uma torrada ou bolacha de água e sal antes de sair da cama pode reduzir a náusea das primeiras horas.', false, true, '["starting","less_than_4_weeks"]'),
('tip', 'Priorize proteína, não quantidade', 'tip-inicio-4', null, 'Com o apetite reduzido, escolher alimentos proteicos primeiro garante que o pouco que você come tenha mais impacto.', false, true, '["starting","less_than_4_weeks","4_to_8_weeks"]'),
('tip', 'Refeições menores, mais frequentes', 'tip-inicio-5', null, 'Se um prato cheio parece demais, experimente dividir em 4-5 porções pequenas ao longo do dia.', false, true, '["starting","less_than_4_weeks","4_to_8_weeks"]'),
('tip', 'Anote o que funciona pra você', 'tip-4-8-1', null, 'Cada corpo reage diferente. Use o registro de sintomas para identificar quais alimentos te caem melhor nesta fase.', false, true, '["4_to_8_weeks"]'),
('tip', 'Treino de força começa devagar', 'tip-4-8-2', null, 'Não precisa de academia: 2x por semana de exercícios com o peso do corpo já ajuda a preservar massa magra.', false, true, '["4_to_8_weeks","2_to_6_months"]'),
('tip', 'Constipação? Fibra com calma', 'tip-4-8-3', null, 'Aumente fibras (frutas, vegetais cozidos) aos poucos e mantenha a hidratação — mudanças bruscas pioram o desconforto.', false, true, '["4_to_8_weeks"]'),
('tip', 'O paladar muda, e tudo bem', 'tip-4-8-4', null, 'É comum alimentos favoritos perderem a graça por um tempo. Experimente temperos diferentes em vez de forçar o de sempre.', false, true, '["4_to_8_weeks","2_to_6_months"]'),
('tip', 'Meça mais do que o peso', 'tip-2-6-1', null, 'Cintura, quadril e a sensação de energia contam uma história que a balança sozinha não mostra.', false, true, '["2_to_6_months"]'),
('tip', 'Consistência do treino > intensidade', 'tip-2-6-2', null, 'Dois treinos de força curtos e regulares preservam mais músculo do que um treino puxado esporádico.', false, true, '["2_to_6_months","more_than_6_months"]'),
('tip', 'Comece a pensar na manutenção', 'tip-2-6-3', null, 'Ainda é cedo pra parar, mas é um bom momento pra entender como vai ser sua alimentação quando reduzir a dose.', false, true, '["2_to_6_months"]'),
('tip', 'Proteína em cada refeição, não só no almoço', 'tip-2-6-4', null, 'Distribuir a proteína ao longo do dia (café, almoço, jantar) ajuda mais na preservação muscular do que concentrar tudo numa refeição.', false, true, '["2_to_6_months","more_than_6_months"]'),
('tip', 'Planeje a redução de dose com antecedência', 'tip-6plus-1', null, 'Se você está pensando em reduzir ou parar, converse com seu profissional sobre um plano gradual — isso faz diferença nos resultados a longo prazo.', false, true, '["more_than_6_months"]'),
('tip', 'Hábito construído vale mais que restrição', 'tip-6plus-2', null, 'Depois de meses de acompanhamento, o que sustenta o resultado são os hábitos que você manteria mesmo sem a caneta.', false, true, '["more_than_6_months"]'),
('tip', 'Revise seus objetivos periodicamente', 'tip-6plus-3', null, 'A cada poucos meses, vale reavaliar: o que mudou no seu corpo, na sua rotina, no que você precisa agora?', false, true, '["more_than_6_months"]'),
('tip', 'Durma bem, treine melhor', 'tip-geral-1', null, 'Sono ruim afeta apetite e recuperação muscular tanto quanto a alimentação. Priorize 7h ou mais quando possível.', false, true, '["starting","less_than_4_weeks","4_to_8_weeks","2_to_6_months","more_than_6_months"]'),
('tip', 'Registrar é metade do trabalho', 'tip-geral-2', null, 'Só de anotar peso, sintomas e treino toda semana você já tem mais clareza sobre o que está funcionando.', false, true, '["starting","less_than_4_weeks","4_to_8_weeks","2_to_6_months","more_than_6_months"]'),
('tip', 'Água antes das refeições', 'tip-geral-3', null, 'Um copo de água 15-20 min antes de comer pode ajudar com a saciedade e reduzir o desconforto digestivo.', false, true, '["starting","less_than_4_weeks","4_to_8_weeks","2_to_6_months","more_than_6_months"]'),
('tip', 'Você não precisa comer tudo de uma vez', 'tip-geral-4', null, 'Guardar metade do prato para depois é uma estratégia válida, não uma falha.', false, true, '["starting","less_than_4_weeks","4_to_8_weeks","2_to_6_months","more_than_6_months"]')
ON CONFLICT (slug) DO NOTHING;
-- =====================================================
-- CanetaOS - Schema v7: product_events was missing an
-- INSERT policy, so every analytics/content-view event
-- was silently failing under RLS.
-- =====================================================

CREATE POLICY "Anyone can insert events"
  ON product_events FOR INSERT
  WITH CHECK (true);
-- =====================================================
-- CanetaOS - Schema v8: Real Desmame (Fase 2) content
-- This is the R$197 upsell / 8-week-usage-unlock product
-- (products.slug = 'desmame'). Until now it was sold with
-- nothing behind it.
-- =====================================================

INSERT INTO content_items (type, title, slug, description, content, is_premium, is_published, tags) VALUES
(
  'desmame',
  'Como conversar com seu médico sobre reduzir a dose',
  'desmame-conversa-medico',
  'Um roteiro de perguntas pra levar à consulta quando você e seu médico decidirem começar a reduzir a dose.',
  'A decisão de reduzir ou pausar a dose é sempre do seu médico — o que você pode controlar é chegar na consulta preparado.\n\nAntes da consulta, vale anotar: há quanto tempo você está no tratamento, como tem sido sua resposta (peso, sintomas, rotina), e o que te preocupa em relação à redução.\n\nPerguntas que ajudam a conversa:\n— "Baseado no meu histórico, como você enxerga uma redução gradual?"\n— "Existe um intervalo mínimo recomendado entre ajustes?"\n— "O que devo observar e registrar durante essa fase?"\n— "Se algum sintoma voltar, em quanto tempo devo te procurar?"\n\nO CanetaOS não indica nem ajusta doses — seu papel aqui é registrar o que acontece (peso, apetite, sintomas) pra essa conversa ser mais objetiva, e o do seu médico é decidir o ritmo com base no seu caso.',
  true,
  true,
  '["desmame", "conversa-profissional"]'
),
(
  'desmame',
  'Lidando com o apetite que volta',
  'desmame-apetite-volta',
  'Estratégias práticas de organização alimentar para quando a saciedade que a caneta ajudava a dar começa a mudar.',
  'É comum o apetite voltar de forma gradual nesta fase — isso não é uma falha sua, é uma mudança fisiológica esperada, e dá pra se organizar pra ela.\n\nAlgumas estratégias que ajudam:\n\nMantenha a proteína em primeiro lugar. O hábito de priorizar proteína em cada refeição (que você já vinha construindo) continua sendo a base mais importante pra manter saciedade sem depender só do medicamento.\n\nReintroduza porções gradualmente. Em vez de voltar ao "tamanho de prato de antes" de uma vez, aumente aos poucos e observe como o corpo responde.\n\nUse o registro de fome/saciedade. Antes de repetir o prato, espere 10-15 minutos — a sensação de saciedade demora um pouco pra chegar ao cérebro.\n\nMantenha os hábitos que funcionaram. Água antes das refeições, comer devagar, priorizar vegetais e fibra — nada disso deixa de funcionar só porque a dose mudou.\n\nSe o apetite voltar de um jeito que te preocupa, isso é assunto pra próxima consulta, não pra resolver sozinho.',
  true,
  true,
  '["desmame", "apetite", "alimentação"]'
),
(
  'desmame',
  'Metas de manutenção para os próximos 12 meses',
  'desmame-metas-manutencao',
  'Um jeito simples de planejar o que vem depois, com metas realistas em vez de números soltos.',
  'Manutenção não é "não fazer nada" — é decidir com antecedência o que você vai manter da sua rotina atual, e no que vai prestar atenção.\n\nUm jeito prático de planejar: escolha 3 hábitos, não 10. Os que mais te ajudaram até aqui (ex: proteína em cada refeição, hidratação, treino de força 2x por semana) são os que valem a pena proteger — tentar manter tudo de uma vez costuma não durar.\n\nDefina um "sinal de atenção" pessoal, não um número de peso. Em vez de mirar num peso exato, muita gente prefere definir uma faixa de roupa, uma medida de cintura ou uma sensação de energia como referência — e usar isso, junto com seu médico, pra saber quando vale reavaliar.\n\nMantenha o registro, mesmo que menos frequente. Continuar anotando peso e medidas uma vez por semana (em vez de todo dia) já é suficiente pra perceber uma tendência com antecedência.\n\nAgende revisões, não só quando sentir necessidade. Uma conversa com seu médico ou nutricionista a cada poucos meses ajuda a ajustar o plano antes que algo vire problema.',
  true,
  true,
  '["desmame", "manutenção", "metas"]'
),
(
  'desmame',
  'Construindo hábitos que não dependem da caneta',
  'desmame-habitos-sem-caneta',
  'O que realmente sustenta o resultado a longo prazo é o que você faria mesmo sem o medicamento.',
  'A pergunta mais útil nesta fase não é "o que vou perder", é "o que eu já construí que não depende da caneta".\n\nHábitos de comportamento alimentar — como comer devagar, priorizar proteína, planejar refeições com antecedência — continuam funcionando com ou sem o medicamento, porque são sobre como você se relaciona com a comida, não sobre apetite reduzido.\n\nHábitos de movimento — o treino de resistência que você foi construindo (mesmo que só 2x por semana) segue sendo o que mais ajuda a preservar massa magra daqui pra frente, e essa é uma das razões pelas quais recomendamos treino desde o início, não só agora.\n\nHábitos de registro — o simples fato de você ter usado o tracker por semanas te deu uma noção real de causa e efeito no seu corpo, que é algo que continua valendo depois que a dose muda.\n\nO objetivo desta fase não é recriar a mesma restrição de apetite que a caneta dava — é reconhecer que parte do resultado já não depende mais dela.',
  true,
  true,
  '["desmame", "hábitos", "manutenção"]'
)
ON CONFLICT (slug) DO NOTHING;
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
