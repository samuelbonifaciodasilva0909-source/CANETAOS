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
