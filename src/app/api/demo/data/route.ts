import { NextResponse } from "next/server"

export async function GET() {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  function daysAgo(n: number) {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return d.toISOString().split("T")[0]
  }

  const trackerEntries = [
    { entry_date: todayStr, weight_kg: 92.4, waist_measurement: 88, protein_intake_g: 95, water_intake_ml: 2200, dose_applied: true, mood: "well", energy_level: 8, sleep_hours: 7.5 },
    { entry_date: daysAgo(1), weight_kg: 92.6, waist_measurement: 88.2, protein_intake_g: 82, water_intake_ml: 1800, dose_applied: false, mood: "well", energy_level: 7, sleep_hours: 6.5 },
    { entry_date: daysAgo(2), weight_kg: 92.8, waist_measurement: 88.5, protein_intake_g: 105, water_intake_ml: 2500, dose_applied: false, mood: "fatigue", energy_level: 5, sleep_hours: 5 },
    { entry_date: daysAgo(3), weight_kg: 93.0, waist_measurement: 89, protein_intake_g: 90, water_intake_ml: 2000, dose_applied: false, mood: "well", energy_level: 7, sleep_hours: 7 },
    { entry_date: daysAgo(4), weight_kg: 93.3, waist_measurement: 89.2, protein_intake_g: 88, water_intake_ml: 2100, dose_applied: false, mood: "well", energy_level: 8, sleep_hours: 8 },
    { entry_date: daysAgo(5), weight_kg: 93.5, waist_measurement: 89.5, protein_intake_g: 78, water_intake_ml: 1600, dose_applied: false, mood: "nausea", energy_level: 4, sleep_hours: 5.5 },
    { entry_date: daysAgo(6), weight_kg: 93.7, waist_measurement: 89.8, protein_intake_g: 100, water_intake_ml: 2300, dose_applied: false, mood: "well", energy_level: 7, sleep_hours: 7 },
    { entry_date: daysAgo(7), weight_kg: 93.9, waist_measurement: 90, protein_intake_g: 92, water_intake_ml: 1900, dose_applied: true, mood: "well", energy_level: 6, sleep_hours: 6 },
    { entry_date: daysAgo(10), weight_kg: 94.2, waist_measurement: 90.5, protein_intake_g: 85, water_intake_ml: 2000, dose_applied: false, mood: "well", energy_level: 7, sleep_hours: 7 },
    { entry_date: daysAgo(14), weight_kg: 94.8, waist_measurement: 91, protein_intake_g: 80, water_intake_ml: 1800, dose_applied: false, mood: "fatigue", energy_level: 5, sleep_hours: 6 },
    { entry_date: daysAgo(21), weight_kg: 95.5, waist_measurement: 92, protein_intake_g: 75, water_intake_ml: 1700, dose_applied: false, mood: "well", energy_level: 6, sleep_hours: 7 },
    { entry_date: daysAgo(30), weight_kg: 96.2, waist_measurement: 93, protein_intake_g: 70, water_intake_ml: 1500, dose_applied: false, mood: "nausea", energy_level: 4, sleep_hours: 5 },
  ]

  const symptomEntries = [
    { entry_date: todayStr, nausea: false, constipation: false, fatigue: false, headache: false, mood: "Bem", energy_level: 8 },
    { entry_date: daysAgo(1), nausea: false, constipation: false, fatigue: false, headache: false, mood: "Bem", energy_level: 7 },
    { entry_date: daysAgo(2), nausea: false, constipation: true, fatigue: true, headache: false, mood: "Cansado", energy_level: 5 },
    { entry_date: daysAgo(3), nausea: false, constipation: false, fatigue: false, headache: false, mood: "Bem", energy_level: 7 },
    { entry_date: daysAgo(5), nausea: true, constipation: false, fatigue: false, headache: false, mood: "Nausea", energy_level: 4 },
  ]

  const recipes = [
    { id: "r1", title: "Bowl de frango com abacate", slug: "bowl-frango-abacate", description: "Receita rica em proteína com ingredientes frescos e saborosos, ideal para quem busca saciedade sem excesso de carboidratos.", type: "recipe", is_premium: false, tags: ["proteína", "rápido", "low-carb"] },
    { id: "r2", title: "Sopa cremosa de abóbora", slug: "sopa-cremosa-abobora", description: "Sopa leve e nutritiva, perfeita para dias de náusea ou quando o apetite está reduzido.", type: "recipe", is_premium: false, tags: ["leve", "sopa", "náusea"] },
    { id: "r3", title: "Omelete de espinafre e queijo", slug: "omelete-espinafre-queijo", description: "Café da manhã proteico em menos de 10 minutos.", type: "recipe", is_premium: true, tags: ["proteína", "rápido", "café-da-manhã"] },
    { id: "r4", title: "Salada de atum com grão-de-bico", slug: "salada-atum-grao-bico", description: "Combinação de proteína magra e fibras para saciedade prolongada.", type: "recipe", is_premium: false, tags: ["proteína", "fibra", "almoço"] },
  ]

  const mealPlans = [
    { id: "mp1", title: "Plano 7 dias — Iniciante", slug: "plano-7-dias-iniciante", description: "Cardápio completo para quem está começando o tratamento com GLP-1.", type: "meal_plan", is_premium: false, tags: ["iniciante", "semanal"] },
    { id: "mp2", title: "Plano alto em proteína", slug: "plano-alto-proteina", description: "Foco em atingir 100g+ de proteína diária mesmo com apetite reduzido.", type: "meal_plan", is_premium: true, tags: ["proteína", "avançado"] },
  ]

  const articles = [
    { id: "a1", title: "Como lidar com náusea no início do tratamento", slug: "lidar-com-nausea", description: "Estratégias práticas para reduzir desconforto gástrico nas primeiras semanas.", type: "educational", is_premium: false, tags: ["náusea", "início", "dicas"] },
    { id: "a2", title: "Proteína: por que é essencial no tratamento", slug: "proteina-tratamento-glp1", description: "Entenda como a proteína ajuda a preservar massa magra durante a perda de peso.", type: "educational", is_premium: false, tags: ["proteína", "ciência"] },
    { id: "a3", title: "Hidratação: quanto beber por dia?", slug: "hidratacao-glp1", description: "Guias práticos de hidratação para quem usa medicamentos da classe GLP-1.", type: "educational", is_premium: true, tags: ["água", "hidratação", "saúde"] },
  ]

  return NextResponse.json({
    profile: {
      full_name: "Maria Clara",
      onboarding_completed: true,
      created_at: daysAgo(25),
      age_confirmed: true,
    },
    preferences: {
      daily_water_goal_ml: 2000,
      treatment_duration_category: "2_to_6_months",
      primary_goal: "nao_sei_o_que_comer",
      medication_name: "ozempic",
    },
    trackerEntries,
    symptomEntries,
    recipes,
    mealPlans,
    articles,
    checklist: {
      water: true,
      protein: true,
      training: false,
      application: true,
      tracking: true,
      sleep: true,
      movement: false,
    },
  })
}
