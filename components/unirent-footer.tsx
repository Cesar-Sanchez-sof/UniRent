"use client"

import { useState, useEffect, useRef } from "react"
import { Leaf, Shield, HelpCircle, AlertCircle, Camera, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "../lib/api"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const footerLinks = [
  {
    title: "Economía Circular",
    description: "Reutiliza, comparte y ahorra en campus",
    icon: Leaf,
    href: "#",
  },
  {
    title: "Seguro UniRent Protect",
    description: "Protección contra daños y robo",
    icon: Shield,
    href: "#",
  },
  {
    title: "Centro de Ayuda",
    description: "Resuelve tus dudas rápidamente",
    icon: HelpCircle,
    href: "#",
  },
]

export function UniRentFooter() {
  const { toast } = useToast()
  const [showLibroModal, setShowLibroModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [rentals, setRentals] = useState<any[]>([])
  const [isLoadingRentals, setIsLoadingRentals] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [selectedRentalId, setSelectedRentalId] = useState<string>("")
  const [descripcion, setDescripcion] = useState("")
  const [gravedad, setGravedad] = useState<string>("Media")
  const [evidence, setEvidence] = useState<File | null>(null)
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleOpenLibro = async () => {
    setShowLibroModal(true)
    const token = localStorage.getItem('auth_token')
    if (!token) return

    setIsLoadingRentals(true)
    try {
      // Obtener mis alquileres solicitados
      const resMyRentals = await fetch(`${API_URL}/user/alquileres`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      // Obtener mis solicitudes de alquiler recibidas
      const resIncoming = await fetch(`${API_URL}/user/solicitudes`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })

      let combined: any[] = []

      if (resMyRentals.ok) {
        const myRentalsData = await resMyRentals.json()
        // Filtrar activos y finalizados
        combined = [...combined, ...myRentalsData.filter((r: any) => r.estado === 'Activo' || r.estado === 'Finalizado')]
      }

      if (resIncoming.ok) {
        const incomingData = await resIncoming.json()
        combined = [...combined, ...incomingData.filter((r: any) => r.estado === 'Activo' || r.estado === 'Finalizado')]
      }

      // Eliminar duplicados por ID de alquiler
      const unique = combined.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.id_alquiler === current.id_alquiler);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);

      setRentals(unique)
    } catch (e) {
      console.error("Error cargando alquileres en footer", e)
    } finally {
      setIsLoadingRentals(false)
    }
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRentalId) {
      return toast({ variant: "destructive", title: "Falta selección", description: "Por favor selecciona la transacción objeto del reclamo." })
    }
    if (!descripcion.trim()) {
      return toast({ variant: "destructive", title: "Falta descripción", description: "Por favor describe lo sucedido." })
    }

    setIsSubmitting(true)
    const token = localStorage.getItem('auth_token')

    try {
      // 1. Crear reclamo
      const res = await fetch(`${API_URL}/incidencias`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_alquiler: Number(selectedRentalId),
          descripcion: descripcion,
          gravedad: gravedad
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar el reclamo")
      }

      // 2. Subir foto de evidencia si existe
      if (evidence) {
        const formData = new FormData()
        formData.append('foto', evidence)
        await fetch(`${API_URL}/incidencias/${data.incidencia.id_incidencia}/evidence`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          body: formData
        })
      }

      toast({
        title: "Reclamo registrado con éxito",
        description: "El administrador revisará las evidencias y tomará medidas correctivas."
      })

      // Reset
      setDescripcion("")
      setSelectedRentalId("")
      setEvidence(null)
      setEvidencePreview(null)
      setShowLibroModal(false)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "No se pudo procesar tu reclamo."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <footer className="border-t border-border bg-card">
        {/* Links row */}
        <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {footerLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.title}
                  href={link.href}
                  className="flex items-center sm:items-start gap-3.5 group p-3 sm:p-0 rounded-2xl bg-slate-50 sm:bg-transparent border border-slate-100 sm:border-0"
                >
                  <div className="h-10 w-10 rounded-xl bg-white sm:bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors shadow-sm sm:shadow-none">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[10px]">U</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {"© 2026 UniRent. Todos los derechos reservados."}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="/" className="hover:text-foreground font-semibold text-primary transition-colors">Ver Landing Page</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Términos</a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleOpenLibro(); }}
                className="hover:text-red-700 text-red-500 font-bold transition-colors flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5" /> Libro de Reclamaciones
              </a>
              <a href="https://wa.me/+51907905925" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

      {/* LIBRO DE RECLAMACIONES MODAL */}
      <Dialog open={showLibroModal} onOpenChange={setShowLibroModal}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6 bg-white border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5 animate-pulse" /> Libro de Reclamaciones
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Registra un reclamo o incidencia sobre un artículo defectuoso, dañado o con problemas de devolución.
            </DialogDescription>
          </DialogHeader>

          {!isLoggedIn ? (
            <div className="py-6 text-center space-y-4">
              <p className="text-sm font-semibold text-slate-500">Debes iniciar sesión para registrar una reclamación asociada a tus alquileres.</p>
              <Button className="rounded-xl px-6" onClick={() => window.location.href = "/login"}>Iniciar Sesión</Button>
            </div>
          ) : isLoadingRentals ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-slate-400 font-medium">Cargando tus alquileres activos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitClaim} className="space-y-4 mt-2">
              
              <div className="space-y-1">
                <Label htmlFor="reclamo-alquiler">Selecciona el Alquiler afectado:</Label>
                {rentals.length > 0 ? (
                  <Select value={selectedRentalId} onValueChange={setSelectedRentalId}>
                    <SelectTrigger className="rounded-xl h-11 border border-border bg-white text-left font-medium text-xs">
                      <SelectValue placeholder="Seleccionar transacción..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[250px]">
                      {rentals.map((r: any) => {
                        const isClient = r.id_usuario_cliente === JSON.parse(localStorage.getItem('user') || '{}').id_usuario;
                        const roleLabel = isClient ? 'Recibido' : 'Prestado';
                        return (
                          <SelectItem key={r.id_alquiler} value={r.id_alquiler.toString()} className="text-xs py-2">
                            {r.publicacion?.titulo} ({roleLabel} - #{r.id_alquiler})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-semibold text-center">
                    No tienes alquileres Activos o Finalizados para reportar.
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="reclamo-desc">Detalle del Reclamo:</Label>
                <textarea
                  id="reclamo-desc"
                  required
                  rows={4}
                  className="w-full text-xs rounded-xl border border-border p-3 focus:ring-2 focus:ring-primary/20 outline-none bg-background resize-none"
                  placeholder="Describe detalladamente el daño, piezas faltantes o inconformidad..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reclamo-gravedad">Gravedad estimada:</Label>
                <Select value={gravedad} onValueChange={setGravedad}>
                  <SelectTrigger className="rounded-xl h-11 border border-border bg-white text-left font-medium text-xs">
                    <SelectValue placeholder="Seleccionar gravedad..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Baja">Baja (Accesorios faltantes o detalle menor)</SelectItem>
                    <SelectItem value="Media">Media (Falla de funcionamiento parcial, rasguños)</SelectItem>
                    <SelectItem value="Alta">Alta (Inservible, roto, no devuelto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subir Evidencia (Foto):</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2 border-border text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" /> Seleccionar Foto
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEvidence(file)
                        setEvidencePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {evidence && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                      {evidence.name}
                    </span>
                  )}
                </div>
                {evidencePreview && (
                  <div className="relative mt-2 h-24 w-full rounded-xl overflow-hidden border">
                    <img src={evidencePreview} alt="Evidencia" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setEvidence(null); setEvidencePreview(null); }}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-6 flex justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowLibroModal(false)} className="rounded-xl text-xs">
                  Cerrar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || rentals.length === 0} 
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 text-xs"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                  Enviar Reclamo
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

