"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  Tag,
  Info,
  CalendarX2,
  MessageCircle,
  DollarSign,
  FileText,
  BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import { API_URL } from "../lib/api"
import { DateRange } from "react-day-picker"
import { differenceInDays, format, parseISO, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailProps {
  productId: number
  onClose: () => void
}

export function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const { toast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [bookedDates, setBookedDates] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Verificar si el usuario está logueado
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // 1. Cargamos el producto (Crítico)
        const productRes = await fetch(`${API_URL}/publicaciones/${productId}`, { 
          headers: { "Accept": "application/json" } 
        })
        
        if (!productRes.ok) {
          const errorInfo = await productRes.text();
          console.error("Error cargando producto:", errorInfo);
          throw new Error("El artículo no está disponible o no existe.");
        }
        
        const productData = await productRes.json()
        setProduct(productData)

        // 2. Cargamos datos secundarios (No críticos - si fallan, seguimos)
        try {
          const [bookedRes, resenasRes] = await Promise.all([
            fetch(`${API_URL}/publicaciones/${productId}/booked-dates`, { headers: { "Accept": "application/json" } }),
            fetch(`${API_URL}/publicaciones/${productId}/resenas`, { headers: { "Accept": "application/json" } })
          ])

          if (bookedRes.ok) {
            const bookedData = await bookedRes.json()
            const disabledRanges = bookedData.map((range: any) => ({
              from: startOfDay(parseISO(range.from)),
              to: startOfDay(parseISO(range.to))
            }))
            setBookedDates(disabledRanges)
          }

          if (resenasRes.ok) {
            setResenas(await resenasRes.json())
          }
        } catch (secondaryErr) {
          console.warn("Error cargando datos secundarios (fechas o reseñas):", secondaryErr)
          // No lanzamos error, permitimos que el usuario vea el producto
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [productId])

  const isRangeInvalid = useMemo(() => {
    if (!dateRange?.from) return false
    const checkFrom = startOfDay(dateRange.from)
    const checkTo = startOfDay(dateRange.to || dateRange.from)

    return bookedDates.some(booked => {
      return (checkFrom <= booked.to && checkTo >= booked.from)
    })
  }, [dateRange, bookedDates])

  const handleRentalRequest = async () => {
    if (!isLoggedIn) {
      toast({ 
        title: "Inicia sesión", 
        description: "Debe iniciar sesión para separar alquiler.", 
        variant: "destructive" 
      })
      window.location.href = "/login"
      return
    }

    if (!dateRange?.from || isRangeInvalid) return

    setIsSubmitting(true)
    const token = localStorage.getItem('auth_token')
    
    try {
      const fechaInicio = format(dateRange.from, 'yyyy-MM-dd')
      const fechaFin = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : fechaInicio

      const response = await fetch(`${API_URL}/alquileres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id_publicacion: productId,
          fec_inicio: fechaInicio,
          fec_fin: fechaFin,
          monto_total: total,
          monto_garantia: deposit
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "¡Solicitud enviada!", description: "El dueño recibirá tu propuesta.", className: "bg-green-50 text-green-800" })
        setTimeout(() => onClose(), 2000)
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
        <div className="bg-card p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="font-bold text-muted-foreground animate-pulse text-sm">Validando disponibilidad...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
        <div className="bg-card p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-border">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">Error de Carga</h3>
          <p className="text-muted-foreground text-sm mb-6 font-medium leading-relaxed">{error || "No se pudo encontrar la información del producto."}</p>
          <Button onClick={onClose} className="w-full rounded-2xl h-12 font-black bg-primary text-white shadow-lg">Cerrar Ventana</Button>
        </div>
      </div>
    )
  }

  const pricePerDay = Number(product.precio_dia)
  const deposit = pricePerDay
  const totalDays = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : (dateRange?.from ? 1 : 0)
  const subtotal = pricePerDay * totalDays
  const total = subtotal + deposit

  // Función para normalizar URLs de imágenes (S3/Supabase vs Local)
  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg"
    if (url.startsWith('http')) return url
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${url}`
  }

  const images = product.imagenes?.length > 0 
    ? product.imagenes.map((img: any) => getImageUrl(img.url_photo)) 
    : ["/placeholder.jpg"]

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      
      <div className="relative bg-card w-full max-w-6xl max-h-[95vh] lg:max-h-[92vh] rounded-t-[3rem] lg:rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border-t lg:border border-border/50 animate-in slide-in-from-bottom duration-500">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-30 h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl border border-border/50 transition-all hover:bg-white hover:scale-110 active:scale-95 group">
          <X className="h-5 w-5 text-foreground transition-transform group-hover:rotate-90" />
        </button>

        <div className="h-full overflow-y-auto lg:grid lg:grid-cols-[1.2fr,1fr]">
          {/* Columna Izquierda: Galería e Información */}
          <div className="flex flex-col border-r border-border/50 bg-white">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[500px] bg-secondary/20">
              <Image 
                src={images[currentImage]} 
                alt={product.titulo} 
                fill 
                className="object-cover transition-all duration-700 ease-in-out" 
                sizes="(max-width: 1024px) 100vw, 50vw" 
                priority 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none">
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImage((prev) => (prev - 1 + images.length) % images.length) }} className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center pointer-events-auto hover:bg-white hover:scale-110 active:scale-90 transition-all border border-border/20"><ChevronLeft className="h-6 w-6" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImage((prev) => (prev + 1) % images.length) }} className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center pointer-events-auto hover:bg-white hover:scale-110 active:scale-90 transition-all border border-border/20"><ChevronRight className="h-6 w-6" /></button>
                </div>
              )}

              {/* Indicador de imágenes */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20">
                {images.map((_, i) => (
                  <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === currentImage ? "w-6 bg-white" : "w-1.5 bg-white/50")} />
                ))}
              </div>
            </div>

            <div className="p-8 lg:p-12 space-y-10">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary/10"><Tag className="h-3 w-3" /> {product.categoria?.nombre || "General"}</span>
                  <span className="bg-secondary/50 text-secondary-foreground px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-border/50">Estado: {product.condicion || "Usado"}</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[0.9]">{product.titulo}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  <div className="bg-secondary/20 p-4 rounded-3xl border border-border/30 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                      {product.usuario?.foto_perfil ? <img src={getImageUrl(product.usuario.foto_perfil)} alt="User" className="w-full h-full object-cover" /> : <span className="font-black text-primary">{product.usuario?.primer_nombre?.[0]}</span>}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Dueño</p>
                      <p className="text-sm font-bold leading-tight">{product.usuario?.primer_nombre}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-3xl border border-border/30 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0 text-amber-600">
                      <Star className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Confianza</p>
                      <p className="text-sm font-bold leading-tight">{product.usuario?.puntaje_dueno || "5.0"}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-3xl border border-border/30 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0 text-blue-600">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Ubicación</p>
                      <p className="text-sm font-bold leading-tight truncate max-w-[100px]">{product.distrito?.nombre || "Lima"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Descripción del artículo
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base font-medium bg-secondary/10 p-6 rounded-[2rem] border border-border/20 italic">
                    "{product.descripcion}"
                  </p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Star className="h-6 w-6 fill-primary text-primary" /> Reseñas ({resenas.length})
                  </h3>
                </div>

                {resenas.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {resenas.map((resena: any) => (
                      <div key={resena.id_resena} className="bg-white p-6 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-black text-primary overflow-hidden border border-border/20">
                              {resena.alquiler?.usuario?.foto_perfil ? <img src={getImageUrl(resena.alquiler.usuario.foto_perfil)} alt="U" className="w-full h-full object-cover" /> : <span>{resena.alquiler?.usuario?.primer_nombre?.[0]}</span>}
                            </div>
                            <div>
                              <p className="text-sm font-black">{resena.alquiler?.usuario?.primer_nombre}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={cn("h-2.5 w-2.5", s <= Number(resena.calificacion) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest bg-secondary/50 px-3 py-1 rounded-full border border-border/20">
                            {format(new Date(resena.alquiler?.fecha_devolucion), "MMM yyyy", { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium italic leading-relaxed pl-4 border-l-2 border-primary/30">
                          "{resena.comentario}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-border/50">
                    <Star className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-black text-sm uppercase tracking-widest">Sin reseñas aún</p>
                    <p className="text-[10px] text-muted-foreground/60 font-bold mt-2">¡Sé el primero en probar este artículo!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Alquiler (Sticky) */}
          <div className="p-8 lg:p-12 bg-secondary/10 flex flex-col gap-8 lg:sticky lg:top-0">
            <div className="bg-white border border-border shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 space-y-8 animate-in zoom-in-95 duration-500 delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-4xl font-black tracking-tighter text-foreground">S/ {formatPrice(pricePerDay)}</span>
                  <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-2">/ día</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-xl border border-green-100">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Garantizado</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Fechas disponibles
                  </h3>
                  {dateRange?.from && (
                    <button onClick={() => setDateRange(undefined)} className="text-[9px] font-black uppercase text-primary hover:underline transition-all">Limpiar</button>
                  )}
                </div>
                <div className="border border-border/50 rounded-[2rem] p-4 bg-card shadow-inner overflow-hidden">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={es}
                    disabled={[
                      { before: new Date() },
                      ...bookedDates
                    ]}
                    className="w-full"
                    classNames={{
                      month: "space-y-4 w-full",
                      table: "w-full border-collapse space-y-1",
                      head_cell: "text-muted-foreground rounded-md w-full font-black text-[0.6rem] uppercase tracking-tighter",
                      row: "flex w-full mt-2",
                      day_selected: "bg-primary text-primary-foreground font-black rounded-xl",
                      day_today: "bg-secondary text-foreground font-black rounded-xl",
                      day: "h-9 w-full text-center text-xs p-0 font-medium hover:bg-primary/10 transition-all rounded-xl",
                      day_disabled: "text-muted-foreground/30 opacity-50 cursor-not-allowed line-through"
                    }}
                  />
                </div>
              </div>

              {isRangeInvalid ? (
                <div className="p-6 bg-destructive/5 border-2 border-destructive/20 rounded-[2rem] flex flex-col items-center gap-3 text-center animate-in fade-in zoom-in">
                  <CalendarX2 className="h-10 w-10 text-destructive opacity-80" />
                  <div className="space-y-1">
                    <h4 className="font-black text-destructive text-sm uppercase tracking-tighter">Rango no disponible</h4>
                    <p className="text-[10px] text-destructive/70 font-bold leading-tight">Esas fechas ya están reservadas. Por favor selecciona otro periodo.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-6 bg-secondary/30 rounded-[2rem] border border-border/50 transition-all">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">Subtotal ({totalDays} d)</span>
                    <span className="text-foreground">S/ {formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1 text-muted-foreground group">
                      <span className="uppercase tracking-widest">Garantía</span>
                      <Info className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity cursor-help" />
                    </div>
                    <span className="text-foreground">S/ {formatPrice(deposit)}</span>
                  </div>
                  <div className="h-px bg-border/50 w-full" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black uppercase text-[10px] tracking-[0.2em] text-primary">Total a pagar</span>
                    <span className="font-black text-3xl text-foreground tracking-tighter">S/ {formatPrice(total)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={handleRentalRequest} 
                  disabled={isLoggedIn && (!dateRange?.from || isRangeInvalid || isSubmitting)} 
                  className={cn(
                    "w-full rounded-2xl h-16 text-base font-black uppercase tracking-widest shadow-2xl transition-all duration-300",
                    isRangeInvalid ? "bg-muted text-muted-foreground" : 
                    !isLoggedIn ? "bg-[#1e5d8c] hover:bg-[#164a6d] text-white animate-pulse" :
                    "bg-primary text-primary-foreground hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0"
                  )}
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                   !isLoggedIn ? "Inicia sesión para alquilar" : 
                   isRangeInvalid ? "No disponible" : "Confirmar Alquiler"}
                </Button>

                {product.usuario?.telefono && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/51${product.usuario.telefono}?text=Hola ${product.usuario.primer_nombre}, tengo una consulta sobre tu publicación: ${product.titulo}`, '_blank')}
                    className="w-full rounded-2xl h-12 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200 transition-all gap-2"
                  >
                    <MessageCircle className="h-4 w-4" /> Consultar al dueño
                  </Button>
                )}
              </div>

              <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <p className="text-[10px] leading-tight text-primary font-black uppercase tracking-tighter">
                  Alquiler Protegido: <span className="text-muted-foreground font-bold normal-case tracking-normal">NexUs retiene el pago hasta que valides el estado del artículo.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
