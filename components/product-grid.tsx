"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Loader2, Package } from "lucide-react"
import { API_URL } from "../lib/api"

interface ProductGridProps {
  onProductClick: (productId: number) => void
  selectedCategoryId: number | null
  searchTerm: string
}

export function ProductGrid({ onProductClick, selectedCategoryId, searchTerm }: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  // Implementar Debounce: Espera 400ms después de que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')
      
      try {
        let url = `${API_URL}/publicaciones?`
        if (selectedCategoryId) url += `id_categoria=${selectedCategoryId}&`
        if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}`

        const response = await fetch(url, {
          headers: { 
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (e) {
        console.error("Error cargando productos del home", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategoryId, debouncedSearch])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium italic">Buscando artículos para ti...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
          <Package className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div>
          <h3 className="text-xl font-bold">No hay artículos disponibles</h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm mt-1">Parece que por ahora no hay publicaciones de otros estudiantes en tu zona.</p>
        </div>
      </div>
    )
  }

  return (
    <section aria-label="Resultados de productos" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id_publicacion}
            title={product.titulo}
            images={product.imagenes?.length > 0 
              ? product.imagenes.map((img: any) => img.url_photo)
              : ["/placeholder.jpg"]
            }
            distance={product.distrito?.nombre || "Ubicación"}
            pricePerDay={Number(product.precio_dia)}
            trustScore={Number(product.usuario?.puntaje_dueno) || 5.0}
            verified={product.estado}
            onClick={() => onProductClick(product.id_publicacion)}
          />
        ))}
      </div>
    </section>
  )
}
