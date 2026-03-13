"use client"

import { useState, useEffect } from "react"
import { NexusHeader } from "@/components/nexus-header"
import { CategoryFilters } from "@/components/category-filters"
import { ProductGrid } from "@/components/product-grid"
import { ProductDetail } from "@/components/product-detail"
import { NexusFooter } from "@/components/nexus-footer"

export default function Home() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Escuchar evento global de búsqueda del Header
  useEffect(() => {
    const handleGlobalSearch = (event: any) => {
      setSearchTerm(event.detail)
    }
    window.addEventListener('global-search', handleGlobalSearch)
    return () => window.removeEventListener('global-search', handleGlobalSearch)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NexusHeader />
      <CategoryFilters onCategoryChange={(id) => setSelectedCategoryId(id)} />

      <main className="flex-1">
        <ProductGrid 
          onProductClick={(id) => setSelectedProductId(id)} 
          selectedCategoryId={selectedCategoryId}
          searchTerm={searchTerm}
        />
      </main>

      <NexusFooter />

      {selectedProductId && (
        <ProductDetail 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      )}
    </div>
  )
}
