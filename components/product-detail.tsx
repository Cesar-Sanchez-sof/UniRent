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
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import { API_URL } from "@/lib/api-config"
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [productRes, bookedRes, resenasRes] = await Promise.all([
          fetch(`${API_URL}/publicaciones/${productId}`, { headers: { "Accept": "application/json" } }),
          fetch(`${API_URL}/publicaciones/${productId}/booked-dates`, { headers: { "Accept": "application/json" } }),
          fetch(`${API_URL}/publicaciones/${productId}/resenas`, { headers: { "Accept": "application/json" } })
        ])
        
        if (!productRes.ok) throw new Error("No se pudo cargar el producto")
        
        const productData = await productRes.json()
        const bookedData = await bookedRes.json()
        const resenasData = resenasRes.ok ? await resenasRes.json() : []

        setProduct(productData)
        setResenas(resenasData)
        
        // Convertir strings de fechas a objetos Date (inicio del día) para comparaciones precisas
        const disabledRanges = bookedData.map((range: any) => ({
          from: startOfDay(parseISO(range.from)),
          to: startOfDay(parseISO(range.to))
        }))
        setBookedDates(disabledRanges)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [productId])

  // Validación de traslape en tiempo real
  const isRangeInvalid = useMemo(() => {
    if (!dateRange?.from) return false
    const checkFrom = startOfDay(dateRange.from)
    const checkTo = startOfDay(dateRange.to || dateRange.from)

    return bookedDates.some(booked => {
      return (checkFrom <= booked.to && checkTo >= booked.from)
    })
  }, [dateRange, bookedDates])

  const handleRentalRequest = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      toast({ title: "Inicia sesión", description: "Debes estar conectado para solicitar un alquiler.", variant: "destructive" })
      return
    }

    if (!dateRange?.from || isRangeInvalid) return

    setIsSubmitting(true)
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
        <div className="bg-card p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="font-medium text-muted-foreground italic">Cargando disponibilidad...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
        <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center text-destructive">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="mb-6">{error || "Producto no encontrado"}</p>
          <Button onClick={onClose} className="w-full">Cerrar</Button>
        </div>
      </div>
    )
  }

  const pricePerDay = Number(product.precio_dia)
  const deposit = pricePerDay
  const totalDays = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : (dateRange?.from ? 1 : 0)
  const subtotal = pricePerDay * totalDays
  const total = subtotal + deposit

  const images = product.imagenes?.length > 0 ? product.imagenes.map((img: any) => `http://localhost:8000/storage/${img.url_photo}`) : ["/placeholder.jpg"]

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-card w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh] rounded-t-3xl lg:rounded-3xl overflow-y-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-card/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-border/50"><X className="h-4 w-4" /></button>
        <div className="lg:grid lg:grid-cols-[1fr,1.1fr]">
          <div className="flex flex-col border-r border-border/50">
            <div className="relative aspect-[4/3] bg-muted">
              <Image src={images[currentImage]} alt={product.titulo} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" priority />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 flex items-center justify-center shadow-md hover:bg-card"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 flex items-center justify-center shadow-md hover:bg-card"><ChevronRight className="h-5 w-5" /></button>
                </>
              )}
            </div>
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase"><Tag className="h-3 w-3" /> {product.categoria?.nombre || "General"}</span>
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold">Condición: {product.condicion || "Usado"}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">{product.titulo}</h2>
              <div className="flex items-center gap-6 mb-8 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Dueño</span>
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/30">
                      {product.usuario?.foto_perfil ? <Image src={`http://localhost:8000/storage/${product.usuario.foto_perfil}`} alt={product.usuario.primer_nombre} fill className="object-cover" /> : product.usuario?.primer_nombre?.[0] || "U"}
                    </div>
                    <div><p className="text-sm font-bold leading-none">{product.usuario?.primer_nombre} {product.usuario?.primer_apellido}</p><p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{product.usuario?.universidad?.nombre_corto || "Estudiante"}</p></div>
                  </div>
                </div>
                <div className="h-8 w-px bg-border/60" /><div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Confianza</span><div className="flex items-center gap-1 text-foreground font-bold"><Star className="h-4 w-4 fill-primary text-primary" />{product.usuario?.puntaje_dueno || "5.0"}</div></div>
                <div className="h-8 w-px bg-border/60" /><div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Ubicación</span><div className="flex items-center gap-1 text-foreground font-bold font-sm"><MapPin className="h-4 w-4 text-accent" /> <span className="truncate max-w-[80px]">{product.distrito?.nombre || "Lima"}</span></div></div>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base mb-8">{product.descripcion}</p>

              <div className="border-t border-border/50 pt-8 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Star className="h-5 w-5 fill-primary text-primary" /> Reseñas ({resenas.length})
                  </h3>
                  {resenas.length > 0 && (
                    <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Promedio: {(resenas.reduce((acc, r) => acc + Number(r.calificacion), 0) / resenas.length).toFixed(1)}
                    </div>
                  )}
                </div>

                {resenas.length > 0 ? (
                  <div className="space-y-6">
                    {resenas.map((resena: any) => (
                      <div key={resena.id_resena} className="bg-secondary/20 p-5 rounded-2xl border border-border/30 transition-all hover:bg-secondary/30 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden border border-primary/20">
                              {resena.alquiler?.usuario?.foto_perfil ? (
                                <img src={`http://localhost:8000/storage/${resena.alquiler.usuario.foto_perfil}`} alt="User" className="w-full h-full object-cover" />
                              ) : (
                                <span>{resena.alquiler?.usuario?.primer_nombre?.[0] || "U"}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black">{resena.alquiler?.usuario?.primer_nombre} {resena.alquiler?.usuario?.primer_apellido}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={cn("h-3 w-3", s <= Number(resena.calificacion) ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-white/50 px-2.5 py-1.5 rounded-xl border border-border/20 shadow-sm">
                            {format(new Date(resena.alquiler?.fecha_devolucion), "MMM yyyy", { locale: es })}
                          </span>
                        </div>
                        <div className="relative">
                          <p className="text-sm text-muted-foreground font-medium italic leading-relaxed pl-4 border-l-2 border-primary/20">
                            "{resena.comentario}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
                    <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground font-bold text-sm">Aún no hay reseñas para este artículo.</p>
                    <p className="text-[10px] text-muted-foreground/60 uppercase font-black mt-2 tracking-widest bg-white/50 inline-block px-3 py-1 rounded-full border border-border/50">¡Sé el primero en alquilarlo!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8 bg-secondary/10 flex flex-col gap-6 lg:sticky lg:top-0">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-end justify-between mb-6"><div><span className="text-3xl font-black">S/ {formatPrice(pricePerDay)}</span><span className="text-muted-foreground font-medium text-sm"> / día</span></div>{product.estado && <div className="flex items-center gap-1 bg-accent/10 text-accent px-2.5 py-1 rounded-lg border border-accent/20"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-bold uppercase">Verificado</span></div>}</div>
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter"><CalendarIcon className="h-4 w-4 text-primary" /> Fechas del Alquiler</h3>
                <div className="border border-border rounded-xl p-1 bg-card overflow-hidden">
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
                    classNames={{ month: "space-y-4 w-full", table: "w-full border-collapse space-y-1", head_cell: "text-muted-foreground rounded-md w-full font-bold text-[0.7rem] uppercase", row: "flex w-full mt-2" }}
                  />
                </div>
              </div>

              {isRangeInvalid ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex flex-col items-center gap-2 text-center">
                  <CalendarX2 className="h-8 w-8 text-destructive mb-1" />
                  <h4 className="font-bold text-destructive text-sm">Rango no disponible</h4>
                  <p className="text-[11px] text-destructive-foreground">Tu selección incluye días que ya han sido reservados por otro usuario. Por favor, elige un periodo libre.</p>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                  <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2">Desglose de costos</h3>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">S/ {formatPrice(pricePerDay)} x {totalDays} {totalDays === 1 ? "día" : "días"}</span><span className="text-foreground font-bold">S/ {formatPrice(subtotal)}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground text-xs italic underline decoration-dotted">Garantía 100% Reembolsable (1 día)</span><span className="text-foreground font-bold">S/ {formatPrice(deposit)}</span></div>
                  <div className="border-t border-border pt-3 mt-1 flex items-center justify-between"><span className="font-black uppercase text-[10px] tracking-widest">Total Alquiler</span><span className="font-black text-xl text-primary font-mono tracking-tighter">S/ {formatPrice(total)}</span></div>
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-2.5 items-start"><AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><p className="text-[10px] leading-snug text-destructive-foreground font-medium"><strong>Importante:</strong> En caso de daños o faltantes, el reembolso de la garantía no será procesado.</p></div>
              
              <div className="grid grid-cols-1 gap-2 mt-4">
                <Button 
                  onClick={handleRentalRequest} 
                  disabled={!dateRange?.from || isRangeInvalid || isSubmitting} 
                  className={cn(
                    "w-full rounded-xl h-14 text-base font-bold shadow-lg transition-all",
                    isRangeInvalid ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:shadow-xl hover:-translate-y-0.5"
                  )}
                >
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</> : isRangeInvalid ? "Periodo no disponible" : "Solicitar Alquiler"}
                </Button>

                {product.usuario?.telefono && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/51${product.usuario.telefono}?text=Hola ${product.usuario.primer_nombre}, tengo una consulta sobre tu publicación: ${product.titulo}`, '_blank')}
                    className="w-full rounded-xl h-12 text-sm font-bold border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all gap-2"
                  >
                    <MessageCircle className="h-5 w-5" /> Consultar al dueño
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border border-accent/20 bg-accent/5 rounded-2xl"><ShieldCheck className="h-6 w-6 text-accent shrink-0" /><p className="text-xs text-accent-foreground leading-snug"><strong>Alquiler Protegido:</strong> Tu dinero está seguro con NexUs hasta recibir y validar el artículo.</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
