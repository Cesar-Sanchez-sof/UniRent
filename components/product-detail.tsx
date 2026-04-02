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

  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const productRes = await fetch(`${API_URL}/publicaciones/${productId}`, { 
          headers: { "Accept": "application/json" } 
        })
        
        if (!productRes.ok) throw new Error("El artículo no está disponible.")
        
        const productData = await productRes.json()
        setProduct(productData)

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
        } catch (e) { console.warn("Error en datos secundarios") }

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
    return bookedDates.some(booked => (checkFrom <= booked.to && checkTo >= booked.from))
  }, [dateRange, bookedDates])

  const handleRentalRequest = async () => {
    if (!isLoggedIn) {
      toast({ title: "Inicia sesión", description: "Debe iniciar sesión para separar alquiler.", variant: "destructive" })
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
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ id_publicacion: productId, fec_inicio: fechaInicio, fec_fin: fechaFin, monto_total: total, monto_garantia: deposit })
      })
      if (response.ok) {
        toast({ title: "¡Solicitud enviada!", description: "El dueño recibirá tu propuesta.", className: "bg-green-50 text-green-800" })
        setTimeout(() => onClose(), 2000)
      } else {
        const data = await response.json()
        throw new Error(data.message)
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  if (isLoading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>

  if (error || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
        <div className="bg-card p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-border">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="mb-6 font-bold">{error || "Error al cargar"}</p>
          <Button onClick={onClose} className="w-full rounded-xl">Cerrar</Button>
        </div>
      </div>
    )
  }

  const pricePerDay = Number(product.precio_dia)
  const deposit = pricePerDay
  const totalDays = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : (dateRange?.from ? 1 : 0)
  const subtotal = pricePerDay * totalDays
  const total = subtotal + deposit

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg"
    if (url.startsWith('http')) return url
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${url}`
  }

  const images = product.imagenes?.length > 0 ? product.imagenes.map((img: any) => getImageUrl(img.url_photo)) : ["/placeholder.jpg"]
  const averageRating = resenas.length > 0 ? (resenas.reduce((acc, r) => acc + Number(r.calificacion), 0) / resenas.length).toFixed(1) : "5.0"

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4" role="dialog">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl max-h-[95vh] lg:max-h-[90vh] rounded-t-[2.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 z-30 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-border/50 hover:scale-110 transition-all"><X className="h-5 w-5" /></button>

        <div className="overflow-y-auto">
          <div className="lg:grid lg:grid-cols-[1fr,450px]">
            {/* Contenido Principal */}
            <div className="p-6 lg:p-10 space-y-8">
              {/* Badges y Título */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="bg-blue-50 text-[#1e5d8c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100 flex items-center gap-1.5"><Tag className="h-3 w-3" /> {product.categoria?.nombre || "TECNOLOGÍA"}</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-gray-200">Condición: {product.condicion || "good"}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-[#1a1a1a] tracking-tight">{product.titulo}</h1>
              </div>

              {/* Galería de Imágenes (Solo móvil o integrada) */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100 lg:hidden">
                <Image src={images[currentImage]} alt={product.titulo} fill className="object-cover" />
              </div>

              {/* Recuadro del Dueño */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                    {product.usuario?.foto_perfil ? <img src={getImageUrl(product.usuario.foto_perfil)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">{product.usuario?.primer_nombre?.[0]}</div>}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Dueño</p>
                    <p className="text-sm font-bold text-gray-800 leading-none">{product.usuario?.primer_nombre} {product.usuario?.primer_apellido}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{product.usuario?.universidad?.nombre_corto || "Estudiante"}</p>
                  </div>
                </div>
                <div className="border-l border-gray-100 pl-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Confianza</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                    <span className="text-sm font-black text-gray-800">{product.usuario?.puntaje_dueno || "4.5"}</span>
                  </div>
                </div>
                <div className="border-l border-gray-100 pl-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Ubicación</p>
                  <div className="flex items-center gap-1 mt-1 text-blue-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-bold truncate">{product.distrito?.nombre || "Huanch..."}</span>
                  </div>
                </div>
              </div>

              {/* Galería Desktop */}
              <div className="hidden lg:block relative aspect-video rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100">
                <Image src={images[currentImage]} alt={product.titulo} fill className="object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition-all"><ChevronLeft className="h-5 w-5" /></button>
                    <button onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition-all"><ChevronRight className="h-5 w-5" /></button>
                  </>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line font-medium">
                  {product.description || product.descripcion}
                </p>
              </div>

              {/* Reseñas */}
              <div className="pt-8 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#1e5d8c] flex items-center gap-2 uppercase tracking-tighter">
                    <Star className="h-5 w-5 fill-[#1e5d8c]" /> Reseñas ({resenas.length})
                  </h3>
                  <span className="bg-blue-50 text-[#1e5d8c] px-3 py-1 rounded-full text-[10px] font-black border border-blue-100">Promedio: {averageRating}</span>
                </div>

                {resenas.length > 0 ? (
                  <div className="space-y-4">
                    {resenas.map((r: any) => (
                      <div key={r.id_resena} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white border border-gray-200 overflow-hidden">
                              {r.alquiler?.usuario?.foto_perfil ? <img src={getImageUrl(r.alquiler.usuario.foto_perfil)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-400">{r.alquiler?.usuario?.primer_nombre?.[0]}</div>}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-800">{r.alquiler?.usuario?.primer_nombre} {r.alquiler?.usuario?.primer_apellido}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={cn("h-3 w-3", s <= Number(r.calificacion) ? "fill-blue-500 text-blue-500" : "text-gray-200")} />)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-gray-100">{format(new Date(r.alquiler?.fecha_devolucion), "MMM yyyy", { locale: es })}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium italic pl-4 border-l-2 border-blue-200 leading-relaxed">"{r.comentario}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm">Aún no hay reseñas. ¡Sé el primero!</div>
                )}
              </div>
            </div>

            {/* Sidebar de Alquiler */}
            <div className="bg-[#f8fafc] p-6 lg:p-10 border-l border-gray-100 flex flex-col gap-6 lg:sticky lg:top-0 h-fit">
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">S/ {pricePerDay}</span>
                    <span className="text-gray-400 font-bold text-xs ml-2">/ día</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-xl border border-green-100">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verificado</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5 text-blue-500" /> Fechas del Alquiler</h3>
                  <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-inner overflow-hidden">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      locale={es}
                      disabled={[{ before: new Date() }, ...bookedDates]}
                      className="w-full"
                      classNames={{
                        month: "space-y-4 w-full",
                        table: "w-full border-collapse",
                        head_cell: "text-gray-400 font-black text-[0.6rem] uppercase p-2",
                        day_selected: "bg-[#1e5d8c] text-white font-black rounded-xl",
                        day_today: "bg-gray-100 text-gray-900 font-black rounded-xl",
                        day: "h-9 w-full text-center text-xs font-bold hover:bg-blue-50 transition-all rounded-xl"
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desglose de costos</p>
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>S/ {pricePerDay} × {totalDays} días</span>
                      <span>S/ {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-400">
                      <span className="underline decoration-dotted">Garantía 100% Reembolsable (1 día)</span>
                      <span>S/ {deposit}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Alquiler</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">S/ {total}</span>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex gap-3 items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-600 font-bold leading-tight">Importante: En caso de daños o faltantes, el reembolso de la garantía no será procesado.</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleRentalRequest}
                    disabled={isLoggedIn && (!dateRange?.from || isRangeInvalid || isSubmitting)}
                    className={cn(
                      "w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95",
                      !isLoggedIn ? "bg-[#1e5d8c] hover:bg-[#164a6d]" : "bg-[#1e5d8c] hover:shadow-blue-200"
                    )}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : !isLoggedIn ? "Inicia sesión para alquilar" : "Solicitar Alquiler"}
                  </Button>
                  
                  {product.usuario?.telefono && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(`https://wa.me/51${product.usuario.telefono}`, '_blank')}
                      className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-green-100 text-green-600 hover:bg-green-50 gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Consultar al dueño
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
