import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface DemoUser {
  id: string
  email: string
  full_name: string
}

function getDemoUser(cookieStore: Awaited<ReturnType<typeof cookies>>): DemoUser | null {
  const demoAuth = cookieStore.get("demo_auth")?.value
  if (demoAuth !== "true") return null
  const demoUserCookie = cookieStore.get("demo_user")?.value
  if (!demoUserCookie) return null
  try {
    return JSON.parse(demoUserCookie)
  } catch {
    return null
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const demoUser = getDemoUser(cookieStore)

  if (demoUser) {
    return {
      auth: {
        getUser: async () => ({
          data: { user: { id: demoUser.id, email: demoUser.email } },
          error: null,
        }),
        signOut: async () => {
          cookieStore.delete("demo_user")
          cookieStore.delete("demo_auth")
        },
      },
      from: (table: string) => createDemoQuery(table, demoUser.id),
    } as any
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - safe to ignore
          }
        },
      },
    }
  )
}

// Demo mock data
const DEMO_PROFILES: Record<string, any> = {
  "demo-user-id": {
    id: "demo-user-id",
    full_name: "Maria Clara",
    age_confirmed: true,
    onboarding_completed: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
}

const DEMO_PREFERENCES: Record<string, any> = {
  "demo-user-id": {
    id: "pref-1",
    user_id: "demo-user-id",
    medication_name: "ozempic",
    treatment_duration_category: "2_to_6_months",
    primary_goal: "nao_sei_o_que_comer",
    preferred_content_type: "recipes",
  },
}

const DEMO_TRACKER_ENTRIES = [
  {
    id: "te-1",
    user_id: "demo-user-id",
    entry_date: "2026-07-25",
    weight_kg: 92.4,
    waist_measurement: 88,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 8,
    sleep_hours: 7.5,
    water_intake_ml: 2200,
    protein_intake_g: 95,
    dose_applied: true,
    notes: "Dia tranquilo, boa alimentação",
    photo_url: null,
  },
  {
    id: "te-2",
    user_id: "demo-user-id",
    entry_date: "2026-07-24",
    weight_kg: 92.6,
    waist_measurement: 88.2,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 7,
    sleep_hours: 6.5,
    water_intake_ml: 1800,
    protein_intake_g: 82,
    dose_applied: false,
    notes: null,
    photo_url: null,
  },
  {
    id: "te-3",
    user_id: "demo-user-id",
    entry_date: "2026-07-23",
    weight_kg: 92.8,
    waist_measurement: 88.5,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "fatigue",
    energy_level: 5,
    sleep_hours: 5,
    water_intake_ml: 2500,
    protein_intake_g: 105,
    dose_applied: false,
    notes: "Cansado mas comendo bem",
    photo_url: null,
  },
  {
    id: "te-4",
    user_id: "demo-user-id",
    entry_date: "2026-07-22",
    weight_kg: 93.0,
    waist_measurement: 89,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 7,
    sleep_hours: 7,
    water_intake_ml: 2000,
    protein_intake_g: 90,
    dose_applied: false,
    notes: null,
    photo_url: null,
  },
  {
    id: "te-5",
    user_id: "demo-user-id",
    entry_date: "2026-07-21",
    weight_kg: 93.3,
    waist_measurement: 89.2,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 8,
    sleep_hours: 8,
    water_intake_ml: 2100,
    protein_intake_g: 88,
    dose_applied: false,
    notes: null,
    photo_url: null,
  },
  {
    id: "te-6",
    user_id: "demo-user-id",
    entry_date: "2026-07-20",
    weight_kg: 93.5,
    waist_measurement: 89.5,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "nausea",
    energy_level: 4,
    sleep_hours: 5.5,
    water_intake_ml: 1600,
    protein_intake_g: 78,
    dose_applied: false,
    notes: "Náusea pela manhã",
    photo_url: null,
  },
  {
    id: "te-7",
    user_id: "demo-user-id",
    entry_date: "2026-07-19",
    weight_kg: 93.7,
    waist_measurement: 89.8,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 7,
    sleep_hours: 7,
    water_intake_ml: 2300,
    protein_intake_g: 100,
    dose_applied: true,
    notes: null,
    photo_url: null,
  },
  {
    id: "te-8",
    user_id: "demo-user-id",
    entry_date: "2026-07-10",
    weight_kg: 94.2,
    waist_measurement: 90.5,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 7,
    sleep_hours: 7,
    water_intake_ml: 2000,
    protein_intake_g: 85,
    dose_applied: false,
    notes: null,
    photo_url: null,
  },
  {
    id: "te-9",
    user_id: "demo-user-id",
    entry_date: "2026-07-01",
    weight_kg: 94.8,
    waist_measurement: 91,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "fatigue",
    energy_level: 5,
    sleep_hours: 6,
    water_intake_ml: 1800,
    protein_intake_g: 80,
    dose_applied: false,
    notes: null,
    photo_url: null,
  },
  {
    id: "te-10",
    user_id: "demo-user-id",
    entry_date: "2026-06-24",
    weight_kg: 95.5,
    waist_measurement: 92,
    hip_measurement: null,
    chest_measurement: null,
    arm_measurement: null,
    thigh_measurement: null,
    mood: "well",
    energy_level: 6,
    sleep_hours: 7,
    water_intake_ml: 1700,
    protein_intake_g: 75,
    dose_applied: false,
    notes: null,
    photo_url: null,
  },
]

const DEMO_SYMPTOM_ENTRIES = [
  {
    id: "se-1",
    user_id: "demo-user-id",
    entry_date: "2026-07-25",
    nausea: false,
    constipation: false,
    hair_loss: false,
    food_aversion: false,
    taste_change: false,
    fatigue: false,
    headache: false,
    other_notes: null,
  },
  {
    id: "se-2",
    user_id: "demo-user-id",
    entry_date: "2026-07-23",
    nausea: false,
    constipation: true,
    hair_loss: false,
    food_aversion: false,
    taste_change: false,
    fatigue: true,
    headache: false,
    other_notes: "Cansado e intestino preso",
  },
  {
    id: "se-3",
    user_id: "demo-user-id",
    entry_date: "2026-07-20",
    nausea: true,
    constipation: false,
    hair_loss: false,
    food_aversion: false,
    taste_change: false,
    fatigue: false,
    headache: true,
    other_notes: "Náusea e enxaqueca leve",
  },
]

const DEMO_CONTENT_MEAL_PLANS = [
  { id: "cp-1", title: "Cardápio Semanal Leve e Nutritivo", slug: "cardapio-semanal-leve", description: "Um cardápio planejado para ajudar na organização da alimentação.", is_premium: false, tags: ["alimentação", "organização"], is_published: true, type: "meal_plan" },
  { id: "cp-2", title: "Cardápio Rico em Proteína", slug: "cardapio-rico-proteina", description: "Opções de refeições com foco em proteína.", is_premium: false, tags: ["proteína", "alimentação"], is_published: true, type: "meal_plan" },
  { id: "cp-3", title: "Refeições Práticas para o Dia a Dia", slug: "refeccoes-praticas", description: "Sugestões de refeições práticas.", is_premium: true, tags: ["prático"], is_published: true, type: "meal_plan" },
  { id: "cp-4", title: "Alimentação e Hidratação", slug: "alimentacao-hidratacao", description: "Como organizar a hidratação junto com a alimentação.", is_premium: false, tags: ["hidratação"], is_published: true, type: "meal_plan" },
  { id: "cp-5", title: "Lanches Saudáveis", slug: "lanches-saudaveis", description: "Ideias de lanches para incluir na rotina.", is_premium: true, tags: ["lanche"], is_published: true, type: "meal_plan" },
]

const DEMO_CONTENT_RECIPES = [
  { id: "r-1", title: "Omelete de Espinafre com Ricota", slug: "omelete-espinafre-ricota", description: "Receita simples e rica em proteína.", is_premium: false, tags: ["proteína", "rápido"], is_published: true, type: "recipe" },
  { id: "r-2", title: "Frango com Legumes Assados", slug: "frango-legumes-assados", description: "Receita nutritiva para o almoço.", is_premium: false, tags: ["proteína", "almoço"], is_published: true, type: "recipe" },
  { id: "r-3", title: "Smoothie Verde Proteico", slug: "smoothie-verde-proteico", description: "Bebida nutritiva para complementar a alimentação.", is_premium: false, tags: ["proteína", "lanche"], is_published: true, type: "recipe" },
  { id: "r-4", title: "Salada de Grão-de-Bico", slug: "salada-grao-de-bico", description: "Receita rica em fibras e proteína vegetal.", is_premium: false, tags: ["vegetariano"], is_published: true, type: "recipe" },
  { id: "r-5", title: "Sopa Cremosa de Abóbora", slug: "sopa-cremosa-aborbora", description: "Sopa nutritiva e confortável.", is_premium: true, tags: ["sopa", "conforto"], is_published: true, type: "recipe" },
  { id: "r-6", title: "Panquecas de Aveia e Banana", slug: "panquecas-aveia-banana", description: "Opção saudável para o café da manhã.", is_premium: true, tags: ["café da manhã"], is_published: true, type: "recipe" },
  { id: "r-7", title: "Tilápia com Purê de Batata-Doce", slug: "tilapia-pure-batata-doce", description: "Refeição balanceada com proteína magra.", is_premium: false, tags: ["almoço", "peixe"], is_published: true, type: "recipe" },
  { id: "r-8", title: "Iogurte Grego com Granola", slug: "iogurte-granola", description: "Lanche nutritivo e saboroso.", is_premium: false, tags: ["lanche", "proteína"], is_published: true, type: "recipe" },
]

const DEMO_CONTENT_EDUCATIONAL = [
  { id: "e-1", title: "Organizando Sua Alimentação no Dia a Dia", slug: "organizacao-alimentacao", description: "Dicas práticas para organizar suas refeições.", is_premium: false, tags: ["alimentação", "educação"], is_published: true, type: "educational" },
  { id: "e-2", title: "Importância do Registro de Sintomas", slug: "importancia-registro-sintomas", description: "Por que registrar sintomas é importante.", is_premium: false, tags: ["sintomas", "educação"], is_published: true, type: "educational" },
  { id: "e-3", title: "Hidratação: Por Que Importa", slug: "hidratacao-importancia", description: "Como a hidratação pode impactar seu bem-estar.", is_premium: false, tags: ["hidratação", "educação"], is_published: true, type: "educational" },
  { id: "e-4", title: "Conversando com Seu Profissional", slug: "conversando-profissional", description: "Como preparar informações para a consulta.", is_premium: false, tags: ["profissional"], is_published: true, type: "educational" },
  { id: "e-5", title: "Construindo Hábitos Sustentáveis", slug: "construindo-habitos", description: "Estratégias para criar hábitos que duram.", is_premium: false, tags: ["hábitos"], is_published: true, type: "educational" },
  { id: "e-6", title: "Guia Completo de Proteína", slug: "guia-completo-proteina", description: "Tudo sobre a importância da proteína.", is_premium: true, tags: ["proteína", "premium"], is_published: true, type: "educational" },
  { id: "e-7", title: "Planejamento de Manutenção", slug: "planejamento-manutencao", description: "Como se preparar para a fase de manutenção.", is_premium: true, tags: ["manutenção", "premium"], is_published: true, type: "educational" },
]

const DEMO_CONTENT_GUIDES = [
  { id: "g-1", title: "Como Usar o Tracker", slug: "como-usar-tracker", description: "Guia rápido para começar a usar o registro.", is_premium: false, tags: ["guia", "início"], is_published: true, type: "guide" },
  { id: "g-2", title: "Calculadora de Proteína: Como Usar", slug: "calculadora-proteina-guia", description: "Entenda como interpretar os resultados.", is_premium: false, tags: ["guia", "proteína"], is_published: true, type: "guide" },
  { id: "g-3", title: "Lista de Compras: Como Montar", slug: "lista-compras-guia", description: "Dicas para montar sua lista de compras.", is_premium: false, tags: ["guia", "compras"], is_published: true, type: "guide" },
  { id: "g-4", title: "Primeiros Passos no CanetaOS", slug: "primeiros-passos", description: "Um guia para começar a usar o CanetaOS.", is_premium: false, tags: ["guia", "tutorial"], is_published: true, type: "guide" },
  { id: "g-5", title: "Seus Direitos como Usuário", slug: "direitos-usuario", description: "Entenda como seus dados são tratados.", is_premium: false, tags: ["guia", "privacidade"], is_published: true, type: "guide" },
]

function createDemoQuery(table: string, userId: string) {
  const DATA: Record<string, any[]> = {
    profiles: [DEMO_PROFILES[userId] || DEMO_PROFILES["demo-user-id"]],
    user_preferences: [DEMO_PREFERENCES[userId] || DEMO_PREFERENCES["demo-user-id"]],
    tracker_entries: DEMO_TRACKER_ENTRIES.filter((e) => e.user_id === userId),
    symptom_entries: DEMO_SYMPTOM_ENTRIES.filter((e) => e.user_id === userId),
    content_items: [...DEMO_CONTENT_MEAL_PLANS, ...DEMO_CONTENT_RECIPES, ...DEMO_CONTENT_EDUCATIONAL, ...DEMO_CONTENT_GUIDES],
    plans: [
      { id: "plan-free", name: "CanetaOS Starter", slug: "free", price_monthly: 0, is_active: true },
      { id: "plan-plus", name: "CanetaOS Plus", slug: "plus", price_monthly: 29.90, is_active: true },
    ],
    subscriptions: [],
    user_roles: [{ user_id: userId, role: "user" }],
    daily_checklists: [
      {
        user_id: userId,
        entry_date: new Date().toISOString().split("T")[0],
        water: true,
        protein: true,
        training: false,
        application: true,
        tracking: true,
        sleep: true,
        movement: false,
      },
    ],
    favorites: [],
    notifications: [],
  }

  const tableData = DATA[table] || []

  let _filters: { column: string; value: any }[] = []
  let _orderColumn: string | null = null
  let _orderAsc = true
  let _limit: number | null = null
  let _single = false
  let _head = false

  const query = {
    select: (fields: string) => query,
    eq: (column: string, value: any) => {
      _filters.push({ column, value })
      return query
    },
    in: (column: string, values: any[]) => {
      // Simple filter
      return query
    },
    order: (column: string, opts?: { ascending?: boolean }) => {
      _orderColumn = column
      _orderAsc = opts?.ascending ?? true
      return query
    },
    limit: (n: number) => {
      _limit = n
      return query
    },
    single: () => {
      _single = true
      return query
    },
    maybeSingle: () => {
      _single = true
      return query
    },
    then: (resolve: (result: { data: any; error: null; count?: number }) => void) => {
      let filtered = [...tableData]

      for (const f of _filters) {
        filtered = filtered.filter((row) => row[f.column] === f.value)
      }

      if (_orderColumn) {
        filtered.sort((a, b) => {
          const aVal = a[_orderColumn!]
          const bVal = b[_orderColumn!]
          if (_orderAsc) return aVal > bVal ? 1 : -1
          return aVal < bVal ? 1 : -1
        })
      }

      if (_limit) filtered = filtered.slice(0, _limit)
      if (_single) filtered = [filtered[0] || null]

      resolve({ data: _single ? filtered[0] : filtered, error: null })
    },
  }

  return query
}
