import {
  Beef, Egg, Fish, Soup, Sprout, GlassWater, Sandwich, Salad, Cookie,
  type LucideIcon,
} from "lucide-react"

export interface RecipeVisual {
  icon: LucideIcon
  gradient: string
  iconClass: string
}

const RULES: Array<{ match: (title: string, tags: string[]) => boolean; visual: RecipeVisual }> = [
  {
    match: (t) => /vitamina|smoothie/i.test(t),
    visual: { icon: GlassWater, gradient: "from-fuchsia-50 to-purple-100", iconClass: "text-fuchsia-400" },
  },
  {
    match: (t) => /creme|sopa|caldo/i.test(t),
    visual: { icon: Soup, gradient: "from-amber-50 to-orange-100", iconClass: "text-amber-500" },
  },
  {
    match: (t) => /omelete|panqueca|muffin|ovo/i.test(t),
    visual: { icon: Egg, gradient: "from-yellow-50 to-amber-100", iconClass: "text-yellow-500" },
  },
  {
    match: (t) => /tilápia|salmão|camarão|sardinha|peixe/i.test(t),
    visual: { icon: Fish, gradient: "from-sky-50 to-cyan-100", iconClass: "text-sky-500" },
  },
  {
    match: (t) => /grão-de-bico|lentilha|feijão|tofu|vegetari/i.test(t),
    visual: { icon: Sprout, gradient: "from-emerald-50 to-green-100", iconClass: "text-emerald-500" },
  },
  {
    match: (t) => /wrap|torrada|pão|tapioca/i.test(t),
    visual: { icon: Sandwich, gradient: "from-orange-50 to-amber-100", iconClass: "text-orange-500" },
  },
  {
    match: (t) => /salada/i.test(t),
    visual: { icon: Salad, gradient: "from-lime-50 to-emerald-100", iconClass: "text-lime-600" },
  },
  {
    match: (_t, tags) => tags.includes("lanche") || /iogurte|patê|pote/i.test(_t),
    visual: { icon: Cookie, gradient: "from-rose-50 to-pink-100", iconClass: "text-rose-400" },
  },
]

const DEFAULT_VISUAL: RecipeVisual = {
  icon: Beef,
  gradient: "from-navy-50 to-warm-100",
  iconClass: "text-navy-300",
}

/** Deterministic per-recipe "thumbnail": no stock photos, but every recipe
 * gets a distinct icon + color pairing based on its title/tags, instead of
 * the same generic placeholder for all 200+ recipes. */
export function getRecipeVisual(title: string, tags: string[] = []): RecipeVisual {
  const rule = RULES.find((r) => r.match(title, tags))
  return rule?.visual || DEFAULT_VISUAL
}
