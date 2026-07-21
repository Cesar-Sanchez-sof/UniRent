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
          let data = await response.json()
          
          // Filtrado estricto en el cliente: Excluir publicaciones del usuario autenticado
          try {
            const storedUserStr = localStorage.getItem('user')
            if (storedUserStr) {
              const storedUser = JSON.parse(storedUserStr)
              const currentUserId = Number(storedUser.id_usuario ?? storedUser.id)
              if (currentUserId) {
                data = data.filter((p: any) => Number(p.id_usuario) !== currentUserId && Number(p.usuario?.id_usuario) !== currentUserId)
              }
            }
          } catch (err) {}

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
          <h3 className="text-xl font-bold">No hay publicaciones de otros estudiantes</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm mt-1 leading-relaxed">
            Por ahora no hay publicaciones de otros usuarios disponibles para alquilar. Tus artículos publicados se gestionan en tu perfil.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/profile?tab=publications" className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[#1e5d8c] text-white text-xs font-bold shadow-md hover:bg-[#164a6d] transition-all">
              Ver Mis Publicaciones
            </a>
            <a href="/publish" className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-secondary transition-all">
              Publicar un Artículo
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section aria-label="Resultados de productos" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
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
