"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { API_URL } from "../lib/api"

interface CategoryFiltersProps {
  onCategoryChange: (categoryId: number | null) => void
}

export function CategoryFilters({ onCategoryChange }: CategoryFiltersProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias?_t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (err) {
        console.error("Error fetching categories", err)
      }
    }
    fetchCategories()
  }, [])

  const handleSelect = (id: number | null) => {
    setActiveId(id)
    onCategoryChange(id)
  }

  return (
    <nav aria-label="Filtros de categoría" className="border-b border-border bg-white sticky top-[60px] sm:top-[64px] lg:top-[72px] z-10 shadow-sm overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 relative">
        <div className="flex items-center justify-start gap-2.5 overflow-x-auto scrollbar-none py-3.5 sm:py-4">
          {/* Opción "Todo" */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border text-center",
              activeId === null
                ? "bg-[#1e5d8c] text-white border-[#1e5d8c] shadow-md shadow-blue-500/10 scale-105"
                : "bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100 hover:text-slate-800"
            )}
          >
            Todo
          </button>

          {/* Categorías dinámicas */}
          {categories.map((cat) => {
            const isActive = activeId === cat.id_categoria
            return (
              <button
                key={cat.id_categoria}
                onClick={() => handleSelect(cat.id_categoria)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border text-center",
                  isActive
                    ? "bg-[#1e5d8c] text-white border-[#1e5d8c] shadow-md shadow-blue-500/10 scale-105"
                    : "bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {cat.nombre}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
