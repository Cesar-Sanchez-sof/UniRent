"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { UniRentHeader } from "@/components/unirent-header"
import { UniRentFooter } from "@/components/unirent-footer"
import { ProductCard } from "@/components/product-card"
import {
  User, Settings, Star, CreditCard, GraduationCap, Phone, Mail, Save, Loader2,
  BadgeCheck, AlertCircle, Camera, AtSign, Package, History, Plus, X, Check, Lock, Eye, EyeOff, Edit2, Trash2, Calendar, MapPin, Inbox, CheckCircle2, XCircle,
  MessageCircle, Tag, DollarSign, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { API_URL } from "../../lib/api"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { MultiImageUpload } from "@/components/multi-image-upload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const conditions = [
  { id: "new", label: "Nuevo", desc: "Sin usar o con empaque original" },
  { id: "like-new", label: "Como nuevo", desc: "Usado pocas veces, excelente estado" },
  { id: "good", label: "Buen estado", desc: "Uso normal, funciona perfectamente" },
  { id: "fair", label: "Aceptable", desc: "Marcas de uso pero completamente funcional" },
]

type TabType = 'config' | 'publications' | 'rentals' | 'incoming';

interface ImageFile {
  id: string
  file: File
  preview: string
}

export function formatPrice(n: number): string {
  return n.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ProfileContent />
    </Suspense>
  )
}

function ProfileContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabType

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'config')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Publicaciones
  const [myPublications, setMyPublications] = useState<any[]>([])
  const [isPubsLoading, setIsPubsLoading] = useState(false)

  // Alquileres (Mis Pedidos)
  const [myRentals, setMyRentals] = useState<any[]>([])
  const [isRentalsLoading, setIsRentalsLoading] = useState(false)

  // Solicitudes Recibidas (Mis Productos prestados)
  const [incomingRentals, setIncomingRentals] = useState<any[]>([])
  const [isIncomingLoading, setIsIncomingLoading] = useState(false)

  // Edición
  const [editingPub, setEditingPub] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUpdatingPub, setIsUpdatingPub] = useState(false)
  const [newImages, setNewImages] = useState<ImageFile[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([])

  // Reseñas
  const [selectedRentalForReview, setSelectedRentalForReview] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewData, setReviewData] = useState({ calificacion: 5, comentario: "", tipo: 'cliente' as 'cliente' | 'dueno' })

  // Estados para la foto
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tempFile, setTempFile] = useState<File | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  // Estados para la contraseña
  const [showPassModal, setShowPassModal] = useState(false)
  const [passData, setPassData] = useState({ current_password: "", new_password: "", new_password_confirmation: "" })

  const [formData, setFormData] = useState({
    primer_nombre: "", segundo_nombre: "", primer_apellido: "", segundo_apellido: "",
    username: "", correo: "", telefono: ""
  })

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam)
  }, [tabParam])

  // Cargar usuario
  useEffect(() => {
    // 1. Hidratación inicial desde LocalStorage para carga instantánea
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        // Usamos foto_perfil que es el campo estándar de nuestro backend
        if (parsedUser.foto_perfil) setPreviewUrl(parsedUser.foto_perfil)
        else if (parsedUser.foto) setPreviewUrl(parsedUser.foto)

        setFormData({
          primer_nombre: parsedUser.primer_nombre || "",
          segundo_nombre: parsedUser.segundo_nombre || "",
          primer_apellido: parsedUser.primer_apellido || "",
          segundo_apellido: parsedUser.segundo_apellido || "",
          username: parsedUser.username || "",
          correo: parsedUser.correo || "",
          telefono: parsedUser.telefono || ""
        })

        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing stored user:", e)
      }
    }

    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) { window.location.href = "/login"; return; }
      try {
        const response = await fetch(`${API_URL}/user`, {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data)
          setFormData({
            primer_nombre: data.primer_nombre || "",
            segundo_nombre: data.segundo_nombre || "",
            primer_apellido: data.primer_apellido || "",
            segundo_apellido: data.segundo_apellido || "",
            username: data.username || "",
            correo: data.correo || "",
            telefono: data.telefono || ""
          })
          if (data.foto_perfil) {
            setPreviewUrl(data.foto_perfil)
          }
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  // Carga de pestañas
  useEffect(() => {
    if (user) {
      if (activeTab === 'publications') fetchMyPublications()
      if (activeTab === 'rentals') fetchMyRentals()
      if (activeTab === 'incoming') fetchIncomingRentals()
    }
  }, [activeTab, user])

  const fetchMyPublications = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    setIsPubsLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/publicaciones`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      if (response.ok) setMyPublications(await response.json())
    } finally { setIsPubsLoading(false) }
  }

  const fetchMyRentals = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    setIsRentalsLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/alquileres`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      if (response.ok) setMyRentals(await response.json())
    } finally { setIsRentalsLoading(false) }
  }

  const fetchIncomingRentals = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    setIsIncomingLoading(true)
    try {
      const response = await fetch(`${API_URL}/user/solicitudes`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      if (response.ok) setIncomingRentals(await response.json())
    } finally { setIsIncomingLoading(false) }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('auth_token')
    try {
      const response = await fetch(`${API_URL}/alquileres/${id}/status`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus })
      })
      if (response.ok) {
        toast({ title: `Solicitud ${newStatus === 'Activo' ? 'Aceptada' : newStatus}` })
        fetchIncomingRentals()
        fetchMyRentals()
      }
    } catch (e) { console.error(e) }
  }

  const handleOpenReview = (rental: any, tipo: 'cliente' | 'dueno' = 'cliente') => {
    setSelectedRentalForReview(rental)
    setReviewData({ calificacion: 5, comentario: "", tipo: tipo })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingReview(true)
    try {
      const response = await fetch(`${API_URL}/resenas`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_alquiler: selectedRentalForReview.id_alquiler,
          ...reviewData
        })
      })
      if (response.ok) {
        toast({ title: "Reseña enviada con éxito" })
        setShowReviewModal(false)
        fetchMyRentals()
        fetchIncomingRentals()
      } else {
        const data = await response.json()
        toast({ variant: "destructive", title: "Error", description: data.message || "No se pudo enviar la reseña" })
      }
    } finally { setIsSubmittingReview(false) }
  }

  const handleEditClick = (pub: any) => {
    setEditingPub({ 
      ...pub,
      estado: pub.estado === 1 || pub.estado === true || pub.estado === "1"
    }); 
    setNewImages([]);
    setDeleteImageIds([]);
    setShowEditModal(true);
  }

  const handleUpdatePublication = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsUpdatingPub(true);
    const token = localStorage.getItem('auth_token');
    
    try {
      const formData = new FormData();
      formData.append('titulo', editingPub.titulo);
      formData.append('precio_dia', editingPub.precio_dia);
      formData.append('descripcion', editingPub.descripcion);
      formData.append('condicion', editingPub.condicion);
      formData.append('estado', editingPub.estado ? "1" : "0");
      
      // Agregar nuevas imágenes
      newImages.forEach((img, index) => {
        formData.append(`imagenes[${index}]`, img.file);
      });

      // Agregar IDs de imágenes a eliminar
      deleteImageIds.forEach((id, index) => {
        formData.append(`delete_images[${index}]`, id.toString());
      });

      const response = await fetch(`${API_URL}/publicaciones/${editingPub.id_publicacion}`, {
        method: "POST", 
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json"
        },
        body: formData
      });

      if (response.ok) { 
        toast({ title: "Publicación actualizada con éxito" }); 
        setShowEditModal(false); 
        fetchMyPublications(); 
      } else {
        const errorData = await response.json();
        toast({ variant: "destructive", title: "Error", description: errorData.message || "No se pudo actualizar" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error de conexión" });
    } finally { 
      setIsUpdatingPub(false);
    }
  }

  const handleDeletePublication = async (id: number) => {
    if (!confirm("¿Eliminar publicación?")) return
    try {
      const response = await fetch(`${API_URL}/publicaciones/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem('auth_token')}` }
      })
      if (response.ok) { toast({ title: "Eliminada" }); fetchMyPublications(); }
    } catch (e) { toast({ variant: "destructive", title: "Error" }) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast({ variant: "destructive", title: "Máx 5MB" })
      setTempFile(file); setPreviewUrl(URL.createObjectURL(file)); setShowPhotoModal(true)
    }
  }

  const handleCancelPhoto = () => {
    setShowPhotoModal(false); setTempFile(null)
    if (user?.foto_perfil) setPreviewUrl(user.foto_perfil)
    else setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUploadPhoto = async () => {
    if (!tempFile) return
    setIsUploadingPhoto(true)
    const formDataPhoto = new FormData()
    formDataPhoto.append('foto', tempFile)
    try {
      const response = await fetch(`${API_URL}/user/upload-photo`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem('auth_token')}`, "Accept": "application/json" },
        body: formDataPhoto
      })
      if (response.ok) {
        const data = await response.json()
        setUser((prev: any) => ({ ...prev, foto_perfil: data.foto_url }))
        setPreviewUrl(data.foto_url)
        setShowPhotoModal(false); toast({ title: "Foto actualizada" })
        window.dispatchEvent(new CustomEvent('user-photo-updated', { detail: data.foto_url }))
      }
    } finally { setIsUploadingPhoto(false) }
  }

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true)
    try {
      const response = await fetch(`${API_URL}/user/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('auth_token')}`, "Accept": "application/json" },
        body: JSON.stringify(formData)
      })
      if (response.ok) toast({ title: "Perfil actualizado" })
    } finally { setIsSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passData.new_password !== passData.new_password_confirmation) {
      return toast({ variant: "destructive", title: "Error", description: "Las claves no coinciden" })
    }
    setIsChangingPass(true)
    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('auth_token')}`, "Accept": "application/json" },
        body: JSON.stringify(passData)
      })
      if (response.ok) {
        toast({ title: "Contraseña actualizada" })
        setShowPassModal(false)
        setPassData({ current_password: "", new_password: "", new_password_confirmation: "" })
      } else {
        const data = await response.json()
        toast({ variant: "destructive", title: "Error", description: data.message || "Error al cambiar clave" })
      }
    } finally { setIsChangingPass(false) }
  }

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  return (
    <div className="min-h-screen bg-secondary/30">
      <UniRentHeader />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm bg-white">
              <div className="h-24 bg-primary/10 flex items-end justify-center pb-4 relative">
                <div className="w-20 h-20 rounded-full bg-primary border-4 border-card flex items-center justify-center text-white text-3xl font-bold shadow-lg -mb-10 overflow-hidden relative group">
                  {previewUrl ? <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span>{user?.primer_nombre?.[0]}</span>}
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="h-6 w-6 text-white" /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
              <div className="pt-12 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-foreground truncate">{user?.primer_nombre} {user?.primer_apellido}</h2>
                <p className="text-muted-foreground text-sm">@{user?.username}</p>
              </div>
            </div>

            <nav className="bg-card rounded-2xl border border-border p-2 shadow-sm space-y-1 bg-white">
              <Button variant="ghost" onClick={() => setActiveTab('config')} className={cn("w-full justify-start gap-3 rounded-xl relative", activeTab === 'config' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground")}>
                <Settings className="h-4 w-4" /> 
                Configuración
                {Number(user?.deuda) > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('publications')} className={cn("w-full justify-start gap-3 rounded-xl", activeTab === 'publications' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground")}>
                <Package className="h-4 w-4" /> Mis Publicaciones
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('rentals')} className={cn("w-full justify-start gap-3 rounded-xl", activeTab === 'rentals' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground")}>
                <History className="h-4 w-4" /> Mis Alquileres
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('incoming')} className={cn("w-full justify-start gap-3 rounded-xl", activeTab === 'incoming' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground")}>
                <Inbox className="h-4 w-4" /> Solicitudes Recibidas
              </Button>
            </nav>
          </aside>

          <div className="lg:col-span-3 space-y-8 animate-in fade-in duration-500">
            {activeTab === 'publications' && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border p-8 flex justify-between items-center shadow-sm bg-white">
                  <div><h3 className="text-lg font-bold">Mis Publicaciones</h3><p className="text-sm text-muted-foreground">Gestiona tus artículos publicados.</p></div>
                  <Button className="rounded-xl gap-2" asChild><a href="/publish"><Plus className="h-4 w-4" /> Publicar artículo</a></Button>
                </div>
                {isPubsLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />)}</div> : myPublications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPublications.map(pub => (
                      <div key={pub.id_publicacion} className="relative group">
                        <ProductCard title={pub.titulo} images={pub.imagenes?.length > 0 ? pub.imagenes.map((img: any) => img.url_photo) : ["/placeholder.jpg"]} distance={pub.distrito?.nombre || "Lima"} pricePerDay={Number(pub.precio_dia)} trustScore={Number(pub.usuario?.puntaje_dueno) || 5.0} verified={pub.estado} onClick={() => { }} onEdit={() => handleEditClick(pub)} />
                        <div className="absolute top-3 right-14 z-30 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-5px] group-hover:translate-y-0"><button onClick={(e) => { e.stopPropagation(); handleDeletePublication(pub.id_publicacion); }} className="bg-white/90 backdrop-blur-md text-destructive p-2 rounded-xl shadow-lg hover:bg-destructive hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button></div>
                      </div>
                    ))}
                  </div>
                ) : <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm bg-white"><Package className="h-12 w-12 text-primary/20 mx-auto mb-4" /><p className="text-muted-foreground">No tienes artículos.</p></div>}
              </div>
            )}

            {activeTab === 'rentals' && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm bg-white"><h3 className="text-lg font-bold">Mis Alquileres</h3><p className="text-sm text-muted-foreground">Artículos que has solicitado.</p></div>
                {isRentalsLoading ? <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}</div> : myRentals.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {myRentals.map(rental => (
                      <div key={rental.id_alquiler} className="bg-card rounded-2xl border border-border p-4 flex gap-6 items-center shadow-sm bg-white">
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0 shadow-inner">
                          <img src={rental.publicacion?.imagenes?.[0] ? rental.publicacion.imagenes[0].url_photo : "/placeholder.jpg"} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold">{rental.publicacion?.titulo}</h4>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><User className="h-3 w-3" /> Dueño: {rental.publicacion?.usuario?.primer_nombre} {rental.publicacion?.usuario?.primer_apellido}</p>
                            </div>
                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              rental.estado === 'Pendiente' ? "bg-amber-100 text-amber-700" :
                                rental.estado === 'Activo' ? "bg-green-100 text-green-700" :
                                  rental.estado === 'Finalizado' ? "bg-blue-100 text-blue-700" :
                                    "bg-secondary text-muted-foreground")}>{rental.estado}</span>
                          </div>
                          <div className="flex gap-4 mt-2 border-t border-border/50 pt-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Periodo</span>
                              <p className="text-xs font-semibold">{format(new Date(rental.fecha_alquiler), "dd/MM", { locale: es })} al {format(new Date(rental.fecha_devolucion), "dd/MM", { locale: es })}</p>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
                              <p className="text-sm font-black">S/ {formatPrice(Number(rental.monto_total))}</p>
                            </div>
                            {rental.publicacion?.usuario?.telefono && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://wa.me/51${rental.publicacion.usuario.telefono}?text=Hola ${rental.publicacion.usuario.primer_nombre}, te contacto por el alquiler de ${rental.publicacion.titulo}`, '_blank')}
                                className="ml-auto rounded-xl gap-2 h-8 px-4 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                              >
                                <MessageCircle className="h-3.5 w-3.5" /> Contactar Dueño
                              </Button>
                            )}
                            {rental.estado === 'Finalizado' && !rental.resenas?.find((r: any) => r.tipo === 'cliente') && (
                              <Button size="sm" onClick={() => handleOpenReview(rental, 'cliente')} className={cn("rounded-xl gap-2 h-8 px-4 text-xs", !rental.publicacion?.usuario?.telefono && "ml-auto")}>
                                <Star className="h-3.5 w-3.5" /> Dejar Reseña
                              </Button>
                            )}
                            {rental.resenas?.find((r: any) => r.tipo === 'cliente') && (
                              <div className="ml-auto flex items-center gap-1 text-primary font-bold text-xs bg-primary/5 px-3 rounded-xl border border-primary/10 h-8">
                                <Star className="h-3.5 w-3.5 fill-current text-amber-400" /> {Number(rental.resenas.find((r: any) => r.tipo === 'cliente').calificacion).toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="bg-card rounded-2xl border border-border p-12 text-center bg-white"><History className="h-12 w-12 text-primary/20 mx-auto mb-4" /><p className="text-muted-foreground">Sin alquileres.</p></div>}
              </div>
            )}

            {activeTab === 'incoming' && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm bg-white">
                  <h3 className="text-lg font-bold">Solicitudes Recibidas</h3>
                  <p className="text-sm text-muted-foreground">Gestiona quién quiere alquilar tus artículos.</p>
                </div>
                {isIncomingLoading ? <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}</div> : incomingRentals.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {incomingRentals.map(req => (
                      <div key={req.id_alquiler} className="bg-card rounded-2xl border border-border p-5 flex gap-6 shadow-sm bg-white">
                        <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-muted shrink-0 shadow-inner">
                          <img src={req.publicacion?.imagenes?.[0] ? req.publicacion.imagenes[0].url_photo : "/placeholder.jpg"} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg leading-tight">{req.publicacion?.titulo}</h4>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                  {req.usuario?.foto_perfil ? <img src={req.usuario.foto_perfil} className="object-cover" /> : <span className="text-[10px] font-bold text-primary">{req.usuario?.primer_nombre?.[0]}</span>}
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Cliente: {req.usuario?.primer_nombre} {req.usuario?.primer_apellido}</span>
                              </div>
                            </div>
                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", req.estado === 'Pendiente' ? "bg-amber-100 text-amber-700" : req.estado === 'Activo' ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground")}>{req.estado}</span>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            <div className="flex gap-6">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Periodo solicitado</span>
                                <p className="text-xs font-semibold">
                                  {format(new Date(req.fecha_alquiler), "dd MMM", { locale: es })} - {format(new Date(req.fecha_devolucion), "dd MMM", { locale: es })}
                                  <span className="ml-1 text-muted-foreground font-normal">
                                    ({differenceInDays(new Date(req.fecha_devolucion), new Date(req.fecha_alquiler)) + 1} {differenceInDays(new Date(req.fecha_devolucion), new Date(req.fecha_alquiler)) + 1 === 1 ? 'día' : 'días'})
                                  </span>
                                </p>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Ingreso Estimado (Neto)</span>
                                <p className="text-sm font-black text-primary">
                                  S/ {formatPrice(
                                    (Number(req.publicacion?.precio_dia) * 0.7) *
                                    (differenceInDays(new Date(req.fecha_devolucion), new Date(req.fecha_alquiler)) + 1)
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {req.usuario?.telefono && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`https://wa.me/51${req.usuario.telefono}?text=Hola ${req.usuario.primer_nombre}, te contacto sobre tu solicitud para alquilar mi ${req.publicacion.titulo}`, '_blank')}
                                  className="rounded-xl border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                                </Button>
                              )}
                              {req.estado === 'Pendiente' && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(req.id_alquiler, 'Cancelado')} className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white"><XCircle className="h-4 w-4 mr-2" /> Rechazar</Button>
                                  <Button size="sm" onClick={() => handleUpdateStatus(req.id_alquiler, 'Activo')} className="rounded-xl bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-4 w-4 mr-2" /> Aceptar</Button>
                                </>
                              )}
                              {req.estado === 'Activo' && (
                                <Button size="sm" onClick={() => handleUpdateStatus(req.id_alquiler, 'Finalizado')} className="rounded-xl bg-blue-600 hover:bg-blue-700 h-9 px-4 font-bold transition-all hover:shadow-lg"><CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar</Button>
                              )}
                              {req.estado === 'Finalizado' && !req.resenas?.find((r: any) => r.tipo === 'dueno') && (
                                <Button size="sm" onClick={() => handleOpenReview(req, 'dueno')} className="rounded-xl bg-primary hover:bg-primary/90 h-9 px-4 font-bold transition-all hover:shadow-lg"><Star className="h-4 w-4 mr-2" /> Calificar Cliente</Button>
                              )}
                              {req.resenas?.find((r: any) => r.tipo === 'dueno') && (
                                <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/5 px-4 rounded-xl border border-primary/10 h-9">
                                  <Star className="h-4 w-4 fill-current text-amber-400" /> {Number(req.resenas.find((r: any) => r.tipo === 'dueno').calificacion).toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="bg-card rounded-2xl border border-border p-12 text-center bg-white shadow-sm"><Inbox className="h-12 w-12 text-primary/20 mx-auto mb-4" /><p className="text-muted-foreground">No tienes solicitudes pendientes por ahora.</p></div>}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-6">
                {/* Deuda Card */}
                <div className={cn(
                  "rounded-2xl border p-6 flex flex-col md:flex-row justify-between items-center shadow-sm transition-all duration-300",
                  Number(user?.deuda) > 0 
                    ? "bg-red-50 border-red-100 animate-in fade-in slide-in-from-top-4" 
                    : "bg-green-50 border-green-100"
                )}>
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm",
                      Number(user?.deuda) > 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    )}>
                      <DollarSign className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-lg font-black tracking-tight",
                        Number(user?.deuda) > 0 ? "text-red-900" : "text-green-900"
                      )}>
                        {Number(user?.deuda) > 0 ? "Deuda de Comisiones" : "¡Al día con UniRent!"}
                      </h4>
                      <p className={cn(
                        "text-sm font-medium",
                        Number(user?.deuda) > 0 ? "text-red-600/80" : "text-green-600/80"
                      )}>
                        {Number(user?.deuda) > 0 
                          ? "Tienes pagos pendientes por las comisiones de tus alquileres." 
                          : "No tienes deudas pendientes por el momento."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-current/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-left md:text-right flex-1 md:flex-none">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest opacity-60",
                        Number(user?.deuda) > 0 ? "text-red-500" : "text-green-500"
                      )}>Monto Total</p>
                      <p className={cn(
                        "text-3xl font-black tracking-tighter",
                        Number(user?.deuda) > 0 ? "text-red-900" : "text-green-900"
                      )}>S/ {formatPrice(Number(user?.deuda || 0))}</p>
                    </div>
                    
                    {Number(user?.deuda) > 0 && (
                      <Button 
                        className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black px-8 h-14 shadow-xl shadow-red-200 transition-all active:scale-95 group"
                        onClick={() => toast({ 
                          title: "Módulo de Pagos", 
                          description: "Estamos trabajando en una pasarela de pagos sin comisiones extra para ti.",
                          className: "bg-white border-red-200"
                        })}
                      >
                        Pagar Deuda
                        <CheckCircle2 className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden bg-white">
                <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-card">
                  <div><h3 className="text-lg font-bold">Configuración de Perfil</h3><p className="text-sm text-muted-foreground">Gestiona tus datos personales.</p></div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPassModal(true)} className="rounded-xl gap-2"><Lock className="h-4 w-4" /> Seguridad</Button>
                    <Button onClick={handleUpdateInfo} disabled={isSaving} className="rounded-xl px-6 gap-2 bg-[#1e5d8c] hover:bg-[#164a6d]">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar</Button>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label>Primer Nombre</Label><Input value={formData.primer_nombre} onChange={e => setFormData({ ...formData, primer_nombre: e.target.value })} className="rounded-xl h-11" /></div>
                  <div className="space-y-1.5"><Label>Apellido Paterno</Label><Input value={formData.primer_apellido} onChange={e => setFormData({ ...formData, primer_apellido: e.target.value })} className="rounded-xl h-11" /></div>
                  <div className="space-y-1.5"><Label>Usuario</Label><Input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="rounded-xl h-11" /></div>
                  <div className="space-y-1.5"><Label>Teléfono (9 dígitos)</Label><Input maxLength={9} value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, "").slice(0, 9) })} className="rounded-xl h-11" placeholder="987654321" /></div>
                  <div className="col-span-1 md:col-span-2 space-y-1.5"><Label>Correo Electrónico</Label><Input value={formData.correo} onChange={e => setFormData({ ...formData, correo: e.target.value })} className="rounded-xl h-11" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>

      {/* Modales */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="rounded-[2rem] max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 px-8 py-6 border-b border-border/50 flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
                <Edit2 className="h-6 w-6 text-primary" /> Editar Publicación
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">Actualiza los detalles de tu artículo</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)} className="rounded-full hover:bg-secondary/80">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {editingPub && (
            <form onSubmit={handleUpdatePublication} className="p-8 space-y-8">
              {/* Sección de Fotos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Camera className="h-4 w-4" />
                  <Label className="text-xs uppercase tracking-[0.2em] font-black">Fotos del artículo</Label>
                </div>
                <div className="bg-secondary/30 rounded-[1.5rem] p-4 border border-dashed border-border/50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                    {editingPub.imagenes?.map((img: any, i: number) => (
                      <div key={img.id_imagen} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm group">
                        <img src={img.url_photo} className={cn("object-cover w-full h-full transition-all", deleteImageIds.includes(img.id_imagen) && "opacity-20 grayscale")} />
                        <button 
                          type="button"
                          onClick={() => {
                            if (deleteImageIds.includes(img.id_imagen)) {
                              setDeleteImageIds(prev => prev.filter(id => id !== img.id_imagen));
                            } else {
                              setDeleteImageIds(prev => [...prev, img.id_imagen]);
                            }
                          }}
                          className={cn(
                            "absolute inset-0 flex items-center justify-center transition-all",
                            deleteImageIds.includes(img.id_imagen) ? "bg-primary/20 text-primary" : "bg-black/40 opacity-0 group-hover:opacity-100 text-white"
                          )}
                        >
                          {deleteImageIds.includes(img.id_imagen) ? <Check className="h-6 w-6" /> : <Trash2 className="h-5 w-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <MultiImageUpload 
                    images={newImages} 
                    onChange={setNewImages} 
                    maxImages={8 - (editingPub.imagenes?.length || 0) + deleteImageIds.length} 
                  />
                  <p className="text-[10px] text-muted-foreground mt-3 text-center font-medium italic">
                    Puedes tener hasta 8 fotos en total. Haz clic en una foto actual para eliminarla.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Información Principal */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Título del Anuncio</Label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={editingPub.titulo} 
                        onChange={e => setEditingPub({...editingPub, titulo: e.target.value})} 
                        className="rounded-2xl h-14 pl-11 bg-secondary/20 border-transparent focus:bg-white focus:border-primary/30 transition-all font-medium" 
                        placeholder="Ej: Laptop Gamer Nitro 5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Estado del artículo</Label>
                    <Select value={editingPub.condicion} onValueChange={(v) => setEditingPub({...editingPub, condicion: v})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-secondary/20 border-transparent focus:bg-white focus:border-primary/30 transition-all font-medium">
                        <SelectValue placeholder="¿En qué estado está?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        {conditions.map(c => (
                          <SelectItem key={c.id} value={c.id} className="rounded-xl py-3 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-bold">{c.label}</span>
                              <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Visibilidad Pública</Label>
                    <div className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                      editingPub.estado ? "bg-green-50/50 border-green-100" : "bg-amber-50/50 border-amber-100"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                          editingPub.estado ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                        )}>
                          {editingPub.estado ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-black">{editingPub.estado ? "Visible" : "Oculto"}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {editingPub.estado ? "Los usuarios pueden alquilarlo" : "Nadie podrá ver tu artículo"}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={editingPub.estado} 
                        onCheckedChange={(checked) => setEditingPub({...editingPub, estado: checked})} 
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Precios y Descripción */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Precio x Día</Label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">S/</span>
                      <Input 
                        type="number" 
                        value={editingPub.precio_dia} 
                        onChange={e => setEditingPub({...editingPub, precio_dia: e.target.value})} 
                        className="rounded-2xl h-14 pl-10 bg-secondary/20 border-transparent focus:bg-white focus:border-primary/30 transition-all font-black text-lg"
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20 space-y-4">
                    <div className="flex justify-between items-center opacity-80">
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Seguro UniRent (30%)</span>
                      </div>
                      <span className="font-bold text-sm">S/ {(Number(editingPub.precio_dia) * 0.3).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/20 w-full" />
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-black opacity-70 tracking-tighter">Tu ganancia neta</p>
                        <p className="text-3xl font-black tracking-tighter">S/ {(Number(editingPub.precio_dia) * 0.7).toFixed(2)}</p>
                      </div>
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Descripción del artículo</Label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <textarea 
                        value={editingPub.descripcion} 
                        onChange={e => setEditingPub({...editingPub, descripcion: e.target.value})} 
                        className="w-full min-h-[140px] pl-11 pr-4 py-4 rounded-2xl bg-secondary/20 border-transparent focus:bg-white focus:border-primary/30 transition-all text-sm font-medium outline-none resize-none"
                        placeholder="Describe detalladamente tu producto..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowEditModal(false)} 
                  className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground hover:bg-secondary/50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdatingPub} 
                  className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {isUpdatingPub ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" /> Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPassModal} onOpenChange={setShowPassModal}><DialogContent className="max-w-md rounded-2xl"><DialogHeader><DialogTitle>Seguridad</DialogTitle><DialogDescription>Cambia tu contraseña.</DialogDescription></DialogHeader>
        <form onSubmit={handleChangePassword} className="space-y-4 py-2"><div className="space-y-2"><Label>Clave Actual</Label><Input type="password" value={passData.current_password} onChange={e => setPassData({ ...passData, current_password: e.target.value })} className="rounded-xl" /></div><div className="space-y-2"><Label>Nueva Clave</Label><Input type="password" value={passData.new_password} onChange={e => setPassData({ ...passData, new_password: e.target.value })} className="rounded-xl" /></div><div className="space-y-2"><Label>Confirmar Clave</Label><Input type="password" value={passData.new_password_confirmation} onChange={e => setPassData({ ...passData, new_password_confirmation: e.target.value })} className="rounded-xl" /></div><DialogFooter className="pt-2"><Button type="submit" disabled={isChangingPass} className="w-full rounded-xl">{isChangingPass ? <Loader2 className="animate-spin h-4 w-4" /> : "Actualizar"}</Button></DialogFooter></form>
      </DialogContent></Dialog>

      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}><DialogContent className="max-w-xs rounded-2xl"><DialogHeader><DialogTitle>Avatar</DialogTitle><DialogDescription>Confirma tu nueva foto.</DialogDescription></DialogHeader>
        <div className="flex flex-col items-center py-4"><div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">{previewUrl && <img src={previewUrl} className="w-full h-full object-cover" />}</div><div className="grid grid-cols-2 gap-2 w-full mt-6"><Button variant="ghost" onClick={handleCancelPhoto} className="rounded-xl">Cancelar</Button><Button onClick={handleUploadPhoto} disabled={isUploadingPhoto} className="rounded-xl">Confirmar</Button></div></div>
      </DialogContent></Dialog>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md rounded-2xl bg-white border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-primary fill-primary/20" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-foreground">Calificar Experiencia</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium">
              ¿Qué te pareció el alquiler de <span className="text-primary font-bold">"{selectedRentalForReview?.publicacion?.titulo}"</span>?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReview} className="space-y-8 py-4 px-2">
            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground/80 block text-center">Tu Puntuación</Label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, calificacion: star })}
                    className={cn(
                      "group relative p-1 transition-all duration-300 transform active:scale-90",
                      reviewData.calificacion >= star ? "text-amber-400 scale-110" : "text-muted-foreground/20 hover:text-muted-foreground/40"
                    )}
                  >
                    <Star className={cn(
                      "h-10 w-10 transition-all duration-300",
                      reviewData.calificacion >= star ? "fill-current filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "fill-none"
                    )} />
                    {reviewData.calificacion === star && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-in zoom-in fade-in">
                        {star === 5 ? '¡Excelente!' : star === 4 ? 'Muy Bueno' : star === 3 ? 'Bueno' : star === 2 ? 'Regular' : 'Malo'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground/80 block">Comentario</Label>
              <textarea
                required
                value={reviewData.comentario}
                onChange={(e) => setReviewData({ ...reviewData, comentario: e.target.value })}
                className="w-full min-h-[140px] p-5 border-2 border-secondary/50 rounded-3xl bg-secondary/10 text-sm font-medium outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 resize-none"
                placeholder="Comparte detalles de tu experiencia para ayudar a otros usuarios..."
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full rounded-2xl h-14 gap-3 text-base font-black shadow-[0_10px_20px_-10px_rgba(var(--primary),0.5)] hover:shadow-none transition-all duration-300 active:translate-y-1"
              >
                {isSubmittingReview ? <Loader2 className="animate-spin h-6 w-6" /> : (
                  <>
                    <Check className="h-5 w-5" /> Publicar Reseña
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UniRentFooter />
    </div>
  )
}
