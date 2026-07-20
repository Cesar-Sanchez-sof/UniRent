"use client"

import { useState, useEffect } from "react"
import { UniRentHeader } from "@/components/unirent-header"
import { CategoryFilters } from "@/components/category-filters"
import { ProductGrid } from "@/components/product-grid"
import { ProductDetail } from "@/components/product-detail"
import { UniRentFooter } from "@/components/unirent-footer"

export default function MarketplacePage() {
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
      <UniRentHeader />
      <CategoryFilters onCategoryChange={(id) => setSelectedCategoryId(id)} />

      <main className="flex-1">
        <ProductGrid 
          onProductClick={(id) => setSelectedProductId(id)} 
          selectedCategoryId={selectedCategoryId}
          searchTerm={searchTerm}
        />
      </main>

      <UniRentFooter />

      {selectedProductId && (
        <ProductDetail 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      )}
    </div>
  )
}
