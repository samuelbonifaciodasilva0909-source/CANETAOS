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
