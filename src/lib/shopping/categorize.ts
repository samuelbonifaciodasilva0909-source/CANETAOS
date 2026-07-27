export const SHOPPING_CATEGORIES = ["Proteínas", "Hortifruti", "Despensa", "Laticínios", "Outros"] as const
export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]

const RULES: Array<{ category: ShoppingCategory; keywords: string[] }> = [
  {
    category: "Proteínas",
    keywords: [
      "frango", "carne", "patinho", "peixe", "tilápia", "salmão", "camarão", "sardinha",
      "ovo", "clara", "tofu", "whey", "atum", "peru", "ricota", "cottage", "grão-de-bico",
      "lentilha", "feijão",
    ],
  },
  {
    category: "Laticínios",
    keywords: ["leite", "queijo", "iogurte", "manteiga", "requeijão", "creme de leite"],
  },
  {
    category: "Hortifruti",
    keywords: [
      "espinafre", "abobrinha", "cenoura", "brócolis", "tomate", "pepino", "couve",
      "abacate", "banana", "morango", "manga", "cogumelo", "vagem", "batata", "cebola",
      "alho", "limão", "gengibre", "fruta", "vegetal", "verdura",
    ],
  },
  {
    category: "Despensa",
    keywords: [
      "aveia", "arroz", "quinoa", "farinha", "pão", "tapioca", "açúcar", "mel", "sal",
      "azeite", "óleo", "tempero", "canela", "páprica", "cominho", "ervas", "cuscuz",
      "granola", "mostarda", "ketchup",
    ],
  },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function categorizeIngredient(text: string): ShoppingCategory {
  const normalized = normalize(text)
  for (const rule of RULES) {
    if (rule.keywords.some((k) => normalized.includes(normalize(k)))) {
      return rule.category
    }
  }
  return "Outros"
}

/** Strips a leading quantity ("100g de ", "2 un de ") to get a comparable
 * core name, so the same ingredient added from different recipes dedupes. */
export function coreIngredientName(text: string): string {
  const match = text.match(/^[\d.,/\s]*\S*\s+de\s+(.+)$/i)
  return normalize(match ? match[1] : text).trim()
}
