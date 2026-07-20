"use client"

import { useState } from "react"
import {
  Monitor,
  BookOpen,
  Camera,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { id: null, name: "Todo", icon: LayoutGrid },
  { id: 1, name: "Tecnología", icon: Monitor },
  { id: 2, name: "Libros", icon: BookOpen },
  { id: 3, name: "Fotografía", icon: Camera },
]

interface CategoryFiltersProps {
  onCategoryChange: (categoryId: number | null) => void
}

export function CategoryFilters({ onCategoryChange }: CategoryFiltersProps) {
  const [activeId, setActiveId] = useState<number | null>(null)

  const handleSelect = (id: number | null) => {
    setActiveId(id)
    onCategoryChange(id)
  }

  return (
    <nav aria-label="Filtros de categoría" className="border-b border-border bg-white sticky top-[64px] lg:top-[72px] z-10 shadow-sm overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 relative">
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10 overflow-x-auto scrollbar-none py-3 lg:py-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeId === cat.id
            return (
              <button
                key={cat.name}
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-fit pb-1 border-b-2 transition-all cursor-pointer group",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-2 sm:p-2.5 rounded-xl transition-colors",
                  isActive ? "bg-primary/10" : "group-hover:bg-secondary"
                )}>
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className={cn(
                  "text-[10px] sm:text-[11px] font-bold uppercase tracking-tight whitespace-nowrap", 
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
