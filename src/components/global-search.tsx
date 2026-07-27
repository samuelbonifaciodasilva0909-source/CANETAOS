"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Search, X, BookOpen, UtensilsCrossed, FileText, Loader2 } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  slug: string
  description: string | null
  type: "recipe" | "educational" | "meal_plan"
  is_premium: boolean
}

const typeLabels: Record<string, string> = {
  recipe: "Receita",
  educational: "Artigo",
  meal_plan: "Cardápio",
}

const typeIcons: Record<string, React.ReactNode> = {
  recipe: <UtensilsCrossed className="h-4 w-4" strokeWidth={1.5} />,
  educational: <BookOpen className="h-4 w-4" strokeWidth={1.5} />,
  meal_plan: <FileText className="h-4 w-4" strokeWidth={1.5} />,
}

const typeRoutes: Record<string, string> = {
  recipe: "/app/recipes",
  educational: "/app/learning",
  meal_plan: "/app/food",
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("content_items")
        .select("id, title, slug, description, type, is_premium")
        .eq("is_published", true)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(12)

      setResults((data as SearchResult[]) || [])
    } catch (err) {
      console.error("Falha na busca:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 250)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border/50 bg-warm-50/60 dark:bg-navy-800/50 px-3 py-2 text-[13px] text-navy-400 transition-smooth hover:border-navy-200 dark:hover:border-navy-600 hover:text-navy-600 dark:hover:text-navy-300"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="ml-2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-card px-1.5 py-0.5 text-[10px] text-navy-400 font-mono">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
          <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
              <Search className="h-4 w-4 text-navy-400 shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar receitas, artigos, cardápios..."
                className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-navy-400 outline-none"
              />
              {loading && <Loader2 className="h-4 w-4 text-navy-400 animate-spin shrink-0" />}
              <button onClick={() => setOpen(false)} className="shrink-0 rounded-lg p-1 hover:bg-warm-100 dark:hover:bg-navy-800 transition-smooth">
                <X className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.length < 2 ? (
                <div className="py-12 text-center">
                  <p className="text-[13px] text-navy-400">Digite pelo menos 2 caracteres para buscar.</p>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="py-12 text-center">
                  <p className="text-[13px] text-navy-400">Nenhum resultado encontrado.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((item) => (
                    <Link
                      key={item.id}
                      href={`${typeRoutes[item.type]}/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-warm-50 dark:hover:bg-navy-800/60 transition-smooth"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-400 shrink-0">
                        {typeIcons[item.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium text-foreground truncate">{item.title}</p>
                          {item.is_premium && <PremiumBadge variant="default" className="text-[9px] shrink-0">Plus</PremiumBadge>}
                        </div>
                        <p className="text-[11px] text-navy-400 truncate">{typeLabels[item.type]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border/40 px-4 py-2.5 flex items-center justify-between">
              <p className="text-[11px] text-navy-400">
                <kbd className="rounded border border-border/50 bg-warm-50 dark:bg-navy-800 px-1 py-0.5 text-[10px] font-mono">Esc</kbd>
                {" "}para fechar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
