"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, ChevronLeft, ChevronRight, ShieldCheck, Star, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"

interface ProductCardProps {
  title: string
  images: string[]
  distance: string
  pricePerDay: number
  trustScore: number
  verified: boolean
  onClick: () => void
  onEdit?: () => void // Nueva prop opcional
}

export function ProductCard({
  title,
  images,
  distance,
  pricePerDay,
  trustScore,
  verified,
  onClick,
  onEdit,
}: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
  }

  return (
    <article
      className="group cursor-pointer relative"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick() }}
      aria-label={`${title}, S/ ${pricePerDay} por día`}
    >
      {/* Action Buttons (Solo para el dueño) */}
      {onEdit && (
        <div className="absolute top-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="bg-white/90 backdrop-blur-md text-primary p-2.5 rounded-2xl shadow-xl hover:bg-primary hover:text-white transition-all"
            title="Editar"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image Carousel */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-sm">
        <Image
          src={images[currentImage]}
          alt={`${title}`}
          fill
          priority={true}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Like button (Solo si NO es modo edición) */}
        {!onEdit && (
          <button
            onClick={toggleLike}
            className="absolute top-3 right-3 z-10 p-2 rounded-full hover:scale-110 transition-transform"
            aria-label={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={cn(
                "h-6 w-6 drop-shadow-md transition-colors",
                liked ? "fill-red-500 text-red-500" : "fill-black/20 text-white"
              )}
            />
          </button>
        )}

        {/* Verified badge */}
        {verified && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-white/20">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">Verificado</span>
          </div>
        )}

        {/* Carousel navigation */}
        {mounted && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-card hover:scale-105"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-card hover:scale-105"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    idx === currentImage
                      ? "bg-card w-2"
                      : "bg-card/60"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Info */}
      <div className="mt-3 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="text-sm font-medium text-foreground">{trustScore}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{distance}</p>
        <p className="mt-1 text-sm text-foreground">
          <span className="font-bold text-base">S/ {formatPrice(pricePerDay)}</span>
          <span className="text-muted-foreground font-medium text-xs"> / día</span>
        </p>
      </div>
    </article>
  )
}
