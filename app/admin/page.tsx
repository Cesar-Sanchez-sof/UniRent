"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, Users, DollarSign, Package, ShieldCheck, ShieldAlert, GraduationCap, 
  Edit, Trash, Plus, Check, Loader2, ArrowLeft, Calendar, FileText, AlertTriangle, 
  AlertCircle, RefreshCw, X, MessageSquare, BookOpen, ExternalLink, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "../../lib/api"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { UniRentHeader } from "@/components/unirent-header"
import { UniRentFooter } from "@/components/unirent-footer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

type TabType = 'metrics' | 'categories' | 'universities' | 'debts' | 'claims';

export default function AdminDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('metrics')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // API states
  const [metrics, setMetrics] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [usersDebt, setUsersDebt] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryName, setCategoryName] = useState("")

  const [showUniModal, setShowUniModal] = useState(false)
  const [editingUni, setEditingUni] = useState<any>(null)
  const [uniForm, setUniForm] = useState({ nombre: "", sedes: "" })

  const [showDebtModal, setShowDebtModal] = useState(false)
  const [selectedUserDebt, setSelectedUserDebt] = useState<any>(null)
  const [newDebtValue, setNewDebtValue] = useState("")

  const [showClaimDetailModal, setShowClaimDetailModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [updatingClaimStatus, setUpdatingClaimStatus] = useState(false)

  // Estados para gestionar solicitudes de pago
  const [paymentRequests, setPaymentRequests] = useState<any[]>([])
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'requests'>('users')
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const fetchPaymentRequests = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    setIsLoadingPayments(true)
    try {
      const res = await fetch(`${API_URL}/admin/solicitudes-pago`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      if (res.ok) {
        setPaymentRequests(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const handleProcessPayment = async (id: number, estado: 'Aprobado' | 'Rechazado') => {
    setIsProcessingPayment(true)
    const token = localStorage.getItem('auth_token')
    try {
      const res = await fetch(`${API_URL}/admin/solicitudes-pago/${id}/procesar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado })
      })

      if (res.ok) {
        toast({
          title: `Solicitud de pago ${estado.toLowerCase()} con éxito.`,
          description: estado === 'Aprobado' ? "La deuda del usuario se actualizó a S/ 0." : "El pago fue rechazado."
        })
        setShowPaymentDetailModal(false)
        fetchPaymentRequests()
        fetchUsersDebt()
      } else {
        const err = await res.json()
        throw new Error(err.message || "Error al procesar la solicitud.")
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || "No se pudo procesar la solicitud."
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Verify Admin role
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      window.location.replace('/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (user.is_admin || user.correo === 'admin@unirent.com') {
        setIsAdmin(true)
        setIsVerifying(false)
        fetchMetrics() // Carga inicial
      } else {
        toast({
          variant: "destructive",
          title: "Acceso Restringido",
          description: "No tienes privilegios de administrador."
        })
        window.location.replace('/marketplace')
      }
    } catch (e) {
      window.location.replace('/login')
    }
  }, [])

  // Refetch based on tab
  useEffect(() => {
    if (!isAdmin) return
    if (activeTab === 'metrics') fetchMetrics()
    if (activeTab === 'categories') fetchCategories()
    if (activeTab === 'universities') fetchUniversities()
    if (activeTab === 'debts') {
      fetchUsersDebt()
      fetchPaymentRequests()
    }
    if (activeTab === 'claims') fetchClaims()
  }, [activeTab, isAdmin])

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  }

  // Fetch functions
  const fetchMetrics = async () => {
    setIsLoadingData(true)
    try {
      const res = await fetch(`${API_URL}/admin/metrics`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (e) {
      console.error("Error fetching metrics", e)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchCategories = async () => {
    setIsLoadingData(true)
    try {
      // Usamos el listado público o el del admin
      const res = await fetch(`${API_URL}/publicaciones`, { headers: getHeaders() }) // Solo para fallback, pero esperemos que devuelva categoras
      // Nota: El backend tiene ruta de universidades, y para categoras obtenemos la lista general.
      // Vamos a cargar las categorías desde el listado de admin si existe, o del endpoint general.
      // Pero espera, en Laravel obtenemos categoras. ¿Hay endpoint público para categoras?
      // En la API Laravel no hay un index directo para categorías en api.php, pero podemos consultarlo a través de un SELECT en Laravel.
      // Para ser 100% compatibles, hemos creado AdminController con CRUD de categorías. Pero, ¿cómo listamos categorías?
      // Ah! En el AdminController agregamos métricas que devuelve la distribución de categorías, lo cual incluye el listado completo de categorías con su conteo!
      // Vamos a usar ese conteo o llamar a `/api/admin/metrics` que devuelve `categories_distribution`.
      const resMetrics = await fetch(`${API_URL}/admin/metrics`, { headers: getHeaders() })
      if (resMetrics.ok) {
        const data = await resMetrics.json()
        setCategories(data.categories_distribution || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchUniversities = async () => {
    setIsLoadingData(true)
    try {
      const res = await fetch(`${API_URL}/universidades`, { headers: getHeaders() })
      if (res.ok) {
        setUniversities(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchUsersDebt = async () => {
    setIsLoadingData(true)
    try {
      const res = await fetch(`${API_URL}/admin/users-debt`, { headers: getHeaders() })
      if (res.ok) {
        setUsersDebt(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchClaims = async () => {
    setIsLoadingData(true)
    try {
      const res = await fetch(`${API_URL}/admin/incidencias`, { headers: getHeaders() })
      if (res.ok) {
        setClaims(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Category Actions
  const handleOpenCategoryModal = (cat: any = null) => {
    setEditingCategory(cat)
    setCategoryName(cat ? cat.nombre : "")
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    try {
      const url = editingCategory 
        ? `${API_URL}/admin/categorias/${editingCategory.id_categoria}` 
        : `${API_URL}/admin/categorias`
      
      const method = editingCategory ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ nombre: categoryName })
      })

      if (res.ok) {
        toast({ title: editingCategory ? "Categoría actualizada" : "Categoría creada con éxito" })
        setShowCategoryModal(false)
        fetchCategories()
      } else {
        const err = await res.json()
        toast({ variant: "destructive", title: "Error", description: err.message || "No se pudo guardar la categoría." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error de conexión" })
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Solo se eliminará si no tiene publicaciones asociadas.")) return
    try {
      const res = await fetch(`${API_URL}/admin/categorias/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      })
      if (res.ok) {
        toast({ title: "Categoría eliminada con éxito" })
        fetchCategories()
      } else {
        const err = await res.json()
        toast({ variant: "destructive", title: "Error", description: err.message || "No se pudo eliminar." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error" })
    }
  }

  // University Actions
  const handleOpenUniModal = (uni: any = null) => {
    setEditingUni(uni)
    setUniForm(uni ? { nombre: uni.nombre || uni.nombre_completo.split(" - ")[0], sedes: uni.sedes || uni.nombre_completo.split(" - ")[1] || "" } : { nombre: "", sedes: "" })
    setShowUniModal(true)
  }

  const handleSaveUni = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uniForm.nombre.trim() || !uniForm.sedes.trim()) return

    try {
      const url = editingUni 
        ? `${API_URL}/admin/universidades/${editingUni.id_universidad}` 
        : `${API_URL}/admin/universidades`
      
      const method = editingUni ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(uniForm)
      })

      if (res.ok) {
        toast({ title: editingUni ? "Universidad actualizada" : "Universidad creada con éxito" })
        setShowUniModal(false)
        fetchUniversities()
      } else {
        const err = await res.json()
        toast({ variant: "destructive", title: "Error", description: err.message || "No se pudo guardar la universidad." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error de conexión" })
    }
  }

  const handleDeleteUni = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta universidad? Solo se eliminará si no tiene usuarios registrados.")) return
    try {
      const res = await fetch(`${API_URL}/admin/universidades/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      })
      if (res.ok) {
        toast({ title: "Universidad eliminada con éxito" })
        fetchUniversities()
      } else {
        const err = await res.json()
        toast({ variant: "destructive", title: "Error", description: err.message || "No se pudo eliminar." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error" })
    }
  }

  // Debt Actions
  const handleOpenDebtModal = (user: any) => {
    setSelectedUserDebt(user)
    setNewDebtValue(user.deuda.toString())
    setShowDebtModal(true)
  }

  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isNaN(Number(newDebtValue)) || Number(newDebtValue) < 0) {
      return toast({ variant: "destructive", title: "Valor inválido" })
    }

    try {
      const res = await fetch(`${API_URL}/admin/users-debt/${selectedUserDebt.id_usuario}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ deuda: Number(newDebtValue) })
      })

      if (res.ok) {
        toast({ title: "Deuda actualizada", description: "Se notificó al usuario la actualización de su saldo." })
        setShowDebtModal(false)
        fetchUsersDebt()
      } else {
        toast({ variant: "destructive", title: "Error al actualizar deuda" })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error de conexión" })
    }
  }

  // Claim Actions
  const handleUpdateClaimStatus = async (status: string) => {
    if (!selectedClaim) return
    setUpdatingClaimStatus(true)
    try {
      const res = await fetch(`${API_URL}/admin/incidencias/${selectedClaim.id_incidencia}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ estado: status })
      })

      if (res.ok) {
        toast({ title: "Reclamo actualizado", description: `El estado se ha cambiado a ${status}.` })
        const updated = await res.json()
        setSelectedClaim(updated.incidencia)
        fetchClaims()
        setShowClaimDetailModal(false)
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado del reclamo." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error de conexión" })
    } finally {
      setUpdatingClaimStatus(false)
    }
  }

  const handleUpdateClaimSeverity = async (severity: string) => {
    if (!selectedClaim) return
    setUpdatingClaimStatus(true)
    try {
      const res = await fetch(`${API_URL}/admin/incidencias/${selectedClaim.id_incidencia}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ gravedad: severity })
      })

      if (res.ok) {
        toast({ title: "Gravedad actualizada", description: `La gravedad se ha cambiado a ${severity}.` })
        const updated = await res.json()
        setSelectedClaim(updated.incidencia)
        fetchClaims()
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la gravedad." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error de conexión" })
    } finally {
      setUpdatingClaimStatus(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Verificando credenciales administrativas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      <UniRentHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {/* Header / Intro */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="h-3.5 w-3.5" /> Administrador General
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1">Panel de Control Administrativo</h1>
            <p className="text-sm text-slate-500 font-medium">Supervisa el uso del sistema, gestiona finanzas, categorías y el libro de reclamaciones.</p>
          </div>
          
          <Button variant="outline" className="rounded-xl gap-2 border-slate-300 font-semibold shadow-sm" asChild>
            <a href="/marketplace"><ArrowLeft className="h-4 w-4" /> Volver al Marketplace</a>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-200 gap-1 mb-8">
          <button 
            onClick={() => setActiveTab('metrics')} 
            className={cn("px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", 
              activeTab === 'metrics' ? "border-primary text-primary font-black bg-white rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-900")}
          >
            <TrendingUp className="h-4 w-4" /> Métricas
          </button>
          <button 
            onClick={() => setActiveTab('categories')} 
            className={cn("px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", 
              activeTab === 'categories' ? "border-primary text-primary font-black bg-white rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-900")}
          >
            <Package className="h-4 w-4" /> Categorías
          </button>
          <button 
            onClick={() => setActiveTab('universities')} 
            className={cn("px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", 
              activeTab === 'universities' ? "border-primary text-primary font-black bg-white rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-900")}
          >
            <GraduationCap className="h-4 w-4" /> Universidades
          </button>
          <button 
            onClick={() => setActiveTab('debts')} 
            className={cn("px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2", 
              activeTab === 'debts' ? "border-primary text-primary font-black bg-white rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-900")}
          >
            <DollarSign className="h-4 w-4" /> Cobranzas & Mora
          </button>
          <button 
            onClick={() => setActiveTab('claims')} 
            className={cn("px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative", 
              activeTab === 'claims' ? "border-primary text-primary font-black bg-white rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-900")}
          >
            <ShieldAlert className="h-4 w-4" /> Libro de Reclamaciones
            {claims.filter(c => c.estado === 'Pendiente').length > 0 && (
              <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                {claims.filter(c => c.estado === 'Pendiente').length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {isLoadingData ? (
          <div className="bg-white border rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 min-h-[400px] shadow-sm">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Cargando datos actualizados de UniRent...</p>
          </div>
        ) : (
          <div className="w-full">
            
            {/* 1. TAB METRICS */}
            {activeTab === 'metrics' && metrics && (
              <div className="space-y-8">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  
                  <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuarios</p>
                      <h3 className="text-2xl font-black text-slate-900">{metrics.metrics.total_usuarios}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Publicaciones</p>
                      <h3 className="text-2xl font-black text-slate-900">{metrics.metrics.total_publicaciones}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alquileres</p>
                      <h3 className="text-2xl font-black text-slate-900">{metrics.metrics.total_alquileres}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comisiones (30%)</p>
                      <h3 className="text-2xl font-black text-slate-900">S/ {metrics.metrics.total_comisiones.toFixed(2)}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reclamos Activos</p>
                      <h3 className="text-2xl font-black text-slate-900">{metrics.metrics.incidencias_activas}</h3>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Categorías distribution */}
                  <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-indigo-600" /> Distribución de Publicaciones por Categoría</h3>
                    <div className="space-y-4">
                      {metrics.categories_distribution && metrics.categories_distribution.length > 0 ? (
                        metrics.categories_distribution.map((cat: any) => {
                          const maxCount = Math.max(...metrics.categories_distribution.map((c: any) => Number(c.count) || 1));
                          const percent = Math.round((Number(cat.count) / maxCount) * 100);
                          return (
                            <div key={cat.id_categoria} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span>{cat.nombre}</span>
                                <span className="text-slate-400">{cat.count} anuncios</span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-xs font-semibold text-slate-400 py-8 text-center">No hay categorías registradas.</p>
                      )}
                    </div>
                  </div>

                  {/* Estado de alquileres */}
                  <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" /> Estados de Alquileres</h3>
                    <div className="space-y-4">
                      {metrics.rentals_status && metrics.rentals_status.length > 0 ? (
                        metrics.rentals_status.map((status: any) => {
                          const maxCount = Math.max(...metrics.rentals_status.map((c: any) => Number(c.count) || 1));
                          const percent = Math.round((Number(status.count) / maxCount) * 100);
                          
                          let statusColor = "from-amber-400 to-amber-500"
                          if (status.estado === 'Activo') statusColor = "from-green-400 to-green-500"
                          if (status.estado === 'Finalizado') statusColor = "from-blue-400 to-blue-500"
                          if (status.estado === 'Cancelado') statusColor = "from-red-400 to-red-500"

                          return (
                            <div key={status.estado} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="uppercase text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{status.estado}</span>
                                <span className="text-slate-400">{status.count} pedidos</span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full bg-gradient-to-r", statusColor)} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-xs font-semibold text-slate-400 py-8 text-center">No hay alquileres registrados.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Categorías de Artículos</h3>
                    <p className="text-xs text-slate-400 font-medium">Define las clasificaciones de artículos permitidas en el marketplace.</p>
                  </div>
                  <Button onClick={() => handleOpenCategoryModal()} className="rounded-xl gap-2 font-bold px-5 bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4" /> Agregar Categoría
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Nombre de Categoría</th>
                        <th className="py-4 px-6">Publicaciones Asociadas</th>
                        <th className="py-4 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <tr key={cat.id_categoria} className="hover:bg-slate-50/55 transition-colors">
                            <td className="py-4 px-6 text-slate-400">#{cat.id_categoria}</td>
                            <td className="py-4 px-6 font-bold text-slate-900">{cat.nombre}</td>
                            <td className="py-4 px-6">
                              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                                {cat.count || 0} anuncios
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleOpenCategoryModal(cat)}
                                className="rounded-xl h-8 w-8 p-0 border-slate-200"
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeleteCategory(cat.id_categoria)}
                                className="rounded-xl h-8 w-8 p-0 border-red-100 hover:bg-red-50 hover:border-red-200"
                              >
                                <Trash className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">No hay categorías registradas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. TAB UNIVERSITIES */}
            {activeTab === 'universities' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Universidades Afiliadas</h3>
                    <p className="text-xs text-slate-400 font-medium">Gestiona las universidades y sedes que forman parte de la red de UniRent.</p>
                  </div>
                  <Button onClick={() => handleOpenUniModal()} className="rounded-xl gap-2 font-bold px-5 bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4" /> Agregar Universidad
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Nombre de Universidad</th>
                        <th className="py-4 px-6">Sedes</th>
                        <th className="py-4 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {universities.length > 0 ? (
                        universities.map((uni) => (
                          <tr key={uni.id_universidad} className="hover:bg-slate-50/55 transition-colors">
                            <td className="py-4 px-6 text-slate-400">#{uni.id_universidad}</td>
                            <td className="py-4 px-6 font-bold text-slate-900">{uni.nombre || uni.nombre_completo.split(" - ")[0]}</td>
                            <td className="py-4 px-6 font-semibold text-slate-600">{uni.sedes || uni.nombre_completo.split(" - ")[1]}</td>
                            <td className="py-4 px-6 text-right flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleOpenUniModal(uni)}
                                className="rounded-xl h-8 w-8 p-0 border-slate-200"
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeleteUni(uni.id_universidad)}
                                className="rounded-xl h-8 w-8 p-0 border-red-100 hover:bg-red-50 hover:border-red-200"
                              >
                                <Trash className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">No hay universidades registradas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. TAB DEBTS */}
            {activeTab === 'debts' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Cobranzas & Control de Deuda</h3>
                    <p className="text-xs text-slate-400 font-medium">Monitorea deudas acumuladas de comisiones y valida los pagos enviados por los arrendadores.</p>
                  </div>
                </div>

                {/* Sub-tabs de Cobranzas */}
                <div className="flex gap-6 border-b border-slate-100 pb-3 mb-6">
                  <button
                    onClick={() => setActiveSubTab('users')}
                    className={cn(
                      "text-xs font-black uppercase tracking-wider pb-1.5 border-b-2 transition-all cursor-pointer",
                      activeSubTab === 'users'
                        ? "border-[#1e5d8c] text-[#1e5d8c]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Usuarios Deudores
                  </button>
                  <button
                    onClick={() => setActiveSubTab('requests')}
                    className={cn(
                      "text-xs font-black uppercase tracking-wider pb-1.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                      activeSubTab === 'requests'
                        ? "border-[#1e5d8c] text-[#1e5d8c]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Solicitudes de Pago
                    {paymentRequests.filter(r => r.estado === 'Pendiente').length > 0 && (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
                        {paymentRequests.filter(r => r.estado === 'Pendiente').length}
                      </span>
                    )}
                  </button>
                </div>

                {activeSubTab === 'users' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-4 px-6">Estudiante</th>
                          <th className="py-4 px-6">Usuario / Correo</th>
                          <th className="py-4 px-6">Teléfono</th>
                          <th className="py-4 px-6">Deuda Acumulada</th>
                          <th className="py-4 px-6 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {usersDebt.length > 0 ? (
                          usersDebt.map((user) => (
                            <tr key={user.id_usuario} className={cn("hover:bg-slate-50/55 transition-colors", Number(user.deuda) > 0 ? "bg-red-50/10 hover:bg-red-50/20" : "")}>
                              <td className="py-4 px-6">
                                <p className="font-bold text-slate-900">{user.primer_nombre} {user.primer_apellido}</p>
                              </td>
                              <td className="py-4 px-6 text-xs">
                                <span className="text-slate-500 font-bold">@{user.username}</span>
                                <p className="text-slate-400">{user.correo}</p>
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-500 font-semibold">{user.telefono}</td>
                              <td className="py-4 px-6">
                                <span className={cn("font-black text-sm px-3 py-1 rounded-full", 
                                  Number(user.deuda) > 0 ? "bg-red-100 text-red-700 font-black animate-pulse" : "bg-green-100 text-green-700")}>
                                  S/ {Number(user.deuda).toFixed(2)}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleOpenDebtModal(user)}
                                  className="rounded-xl gap-1 text-xs font-bold bg-[#1e5d8c] hover:bg-[#164a6d] text-white"
                                >
                                  <DollarSign className="h-3.5 w-3.5" /> Ajustar Saldo
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400">No hay usuarios registrados.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-4 px-6">Usuario / Estudiante</th>
                          <th className="py-4 px-6">Monto Reportado</th>
                          <th className="py-4 px-6">Nro. Operación</th>
                          <th className="py-4 px-6">Fecha Envío</th>
                          <th className="py-4 px-6">Estado</th>
                          <th className="py-4 px-6 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-xs">
                        {paymentRequests.length > 0 ? (
                          paymentRequests.map((req) => (
                            <tr key={req.id_solicitud} className="hover:bg-slate-50/55 transition-colors">
                              <td className="py-4 px-6 text-xs">
                                <p className="font-bold text-slate-900">{req.usuario?.primer_nombre} {req.usuario?.primer_apellido}</p>
                                <p className="text-slate-400">@{req.usuario?.username} | Telf: {req.usuario?.telefono}</p>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-black text-sm text-slate-950">S/ {Number(req.monto).toFixed(2)}</span>
                              </td>
                              <td className="py-4 px-6 font-mono text-slate-500 font-semibold">{req.nro_operacion}</td>
                              <td className="py-4 px-6 text-slate-400 font-medium">
                                {new Date(req.created_at).toLocaleDateString('es-PE')}
                              </td>
                              <td className="py-4 px-6">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide",
                                  req.estado === 'Pendiente' && "bg-amber-100 text-amber-700",
                                  req.estado === 'Aprobado' && "bg-green-100 text-green-700",
                                  req.estado === 'Rechazado' && "bg-red-100 text-red-700"
                                )}>
                                  {req.estado}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(req);
                                    setShowPaymentDetailModal(true);
                                  }}
                                  className="rounded-xl bg-[#1e5d8c] hover:bg-[#164a6d] text-white text-xs font-bold"
                                >
                                  Ver Detalles
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">No hay solicitudes de pago registradas.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 5. TAB CLAIMS */}
            {activeTab === 'claims' && (
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-black tracking-tight text-slate-900 font-sans">Libro de Reclamaciones (Incidencias)</h3>
                  <p className="text-xs text-slate-400 font-medium">Revisa las denuncias y reclamos presentados por fallas en artículos, incumplimientos o pérdidas.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-4 px-6">Fecha</th>
                        <th className="py-4 px-6">Artículo / ID Alquiler</th>
                        <th className="py-4 px-6">Reportante (Agraviado)</th>
                        <th className="py-4 px-6">Reportado (Infractor)</th>
                        <th className="py-4 px-6">Gravedad</th>
                        <th className="py-4 px-6">Estado</th>
                        <th className="py-4 px-6 text-right">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-xs">
                      {claims.length > 0 ? (
                        claims.map((claim) => {
                          let gravColor = "bg-slate-100 text-slate-600"
                          if (claim.gravedad === 'Baja') gravColor = "bg-blue-100 text-blue-700"
                          if (claim.gravedad === 'Media') gravColor = "bg-amber-100 text-amber-700"
                          if (claim.gravedad === 'Alta') gravColor = "bg-red-100 text-red-700 font-black animate-pulse"

                          let estColor = "bg-slate-100 text-slate-600"
                          if (claim.estado === 'Pendiente') estColor = "bg-amber-100 text-amber-700"
                          if (claim.estado === 'En Revision') estColor = "bg-indigo-100 text-indigo-700"
                          if (claim.estado === 'Resuelta') estColor = "bg-green-100 text-green-700"
                          if (claim.estado === 'Desestimada') estColor = "bg-slate-100 text-slate-400"

                          return (
                            <tr key={claim.id_incidencia} className="hover:bg-slate-50/55 transition-colors">
                              <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                                {format(new Date(claim.created_at || claim.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}
                              </td>
                              <td className="py-4 px-6">
                                <p className="font-bold text-slate-900 line-clamp-1">{claim.alquiler?.publicacion?.titulo || "Artículo no disponible"}</p>
                                <span className="text-[10px] text-slate-400">ID Alquiler: #{claim.id_alquiler}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-slate-900">{claim.usuario_reportante?.primer_nombre} {claim.usuario_reportante?.primer_apellido}</span>
                                <p className="text-slate-400">@{claim.usuario_reportante?.username}</p>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-slate-900">{claim.usuario_reportado?.primer_nombre} {claim.usuario_reportado?.primer_apellido}</span>
                                <p className="text-slate-400">@{claim.usuario_reportado?.username}</p>
                              </td>
                              <td className="py-4 px-6">
                                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", gravColor)}>
                                  {claim.gravedad}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", estColor)}>
                                  {claim.estado}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => { setSelectedClaim(claim); setShowClaimDetailModal(true); }}
                                  className="rounded-xl h-8 text-[11px] font-bold border-slate-200 hover:bg-slate-50"
                                >
                                  Ver Ficha
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">No hay incidencias reportadas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* CATEGORY MODAL */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <Package className="h-5 w-5 text-primary" /> {editingCategory ? "Editar Categoría" : "Agregar Categoría"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Escribe el nombre de la categoría. Procura usar nombres breves y claros.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nombre de la Categoría</Label>
              <Input
                id="cat-name"
                required
                className="rounded-xl h-11 border-slate-200"
                placeholder="Ej: Proyectores, Calculadoras..."
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCategoryModal(false)} className="rounded-xl font-bold">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl font-bold px-6 bg-primary hover:bg-primary/90 text-white">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* UNIVERSITY MODAL */}
      <Dialog open={showUniModal} onOpenChange={setShowUniModal}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <GraduationCap className="h-5 w-5 text-primary" /> {editingUni ? "Editar Universidad" : "Agregar Universidad"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Agrega una universidad y sus sedes correspondientes para el registro de estudiantes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUni} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="uni-nombre">Nombre de la Universidad</Label>
              <Input
                id="uni-nombre"
                required
                className="rounded-xl h-11 border-slate-200"
                placeholder="Ej: Universidad Nacional de Trujillo"
                value={uniForm.nombre}
                onChange={e => setUniForm({ ...uniForm, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uni-sedes">Sedes (Separadas por comas)</Label>
              <Input
                id="uni-sedes"
                required
                className="rounded-xl h-11 border-slate-200"
                placeholder="Ej: Sede Trujillo, Sede Valle Chicama"
                value={uniForm.sedes}
                onChange={e => setUniForm({ ...uniForm, sedes: e.target.value })}
              />
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowUniModal(false)} className="rounded-xl font-bold">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl font-bold px-6 bg-primary hover:bg-primary/90 text-white">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DEBT ADJUSTMENT MODAL */}
      <Dialog open={showDebtModal} onOpenChange={setShowDebtModal}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <DollarSign className="h-5 w-5 text-primary" /> Ajustar Saldo de Deuda
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Modifica manualmente la deuda de comisiones del usuario. Esto se reflejará inmediatamente en su panel.
            </DialogDescription>
          </DialogHeader>
          {selectedUserDebt && (
            <form onSubmit={handleSaveDebt} className="space-y-4 mt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border text-xs space-y-1">
                <p className="font-bold text-slate-700">Usuario: {selectedUserDebt.primer_nombre} {selectedUserDebt.primer_apellido}</p>
                <p className="text-slate-400">Username: @{selectedUserDebt.username}</p>
                <p className="text-slate-400">Teléfono: {selectedUserDebt.telefono}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="debt-value">Monto de la Deuda (S/)</Label>
                <Input
                  id="debt-value"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="rounded-xl h-11 border-slate-200 font-bold"
                  placeholder="0.00"
                  value={newDebtValue}
                  onChange={e => setNewDebtValue(e.target.value)}
                />
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowDebtModal(false)} className="rounded-xl font-bold">
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-xl font-bold px-6 bg-primary hover:bg-primary/90 text-white">
                  Actualizar Saldo
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* CLAIM DETAIL MODAL */}
      <Dialog open={showClaimDetailModal} onOpenChange={setShowClaimDetailModal}>
        <DialogContent className="rounded-3xl sm:max-w-xl p-6 bg-white border border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Expediente de Incidencia #{selectedClaim?.id_incidencia}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Analiza los detalles de la reclamación y toma acciones administrativas correctivas.
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6 mt-4">
              
              {/* Información del Alquiler */}
              <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-black text-slate-400">Detalles de la Transacción</h4>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900">Artículo: {selectedClaim.alquiler?.publicacion?.titulo}</p>
                  <p className="text-slate-500">Monto del Alquiler: S/ {Number(selectedClaim.alquiler?.monto_total - selectedClaim.alquiler?.monto_seguro).toFixed(2)} (+ Garantía: S/ {Number(selectedClaim.alquiler?.monto_seguro).toFixed(2)})</p>
                  <p className="text-slate-500">Fechas: {format(new Date(selectedClaim.alquiler?.fecha_alquiler), "dd/MM/yyyy", { locale: es })} al {format(new Date(selectedClaim.alquiler?.fecha_devolucion), "dd/MM/yyyy", { locale: es })}</p>
                </div>
              </div>

              {/* Partes Involucradas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border p-4 rounded-2xl space-y-1 bg-green-50/10 border-green-100">
                  <h4 className="text-[10px] uppercase tracking-wider font-black text-green-700">Reportante (Agraviado)</h4>
                  <p className="text-xs font-bold text-slate-900">{selectedClaim.usuario_reportante?.primer_nombre} {selectedClaim.usuario_reportante?.primer_apellido}</p>
                  <p className="text-[10px] text-slate-500">Cel: {selectedClaim.usuario_reportante?.telefono}</p>
                  <p className="text-[10px] text-slate-500">{selectedClaim.usuario_reportante?.correo}</p>
                </div>

                <div className="border p-4 rounded-2xl space-y-1 bg-red-50/10 border-red-100">
                  <h4 className="text-[10px] uppercase tracking-wider font-black text-red-700">Reportado (Presunto Infractor)</h4>
                  {selectedClaim.usuario_reportado ? (
                    <>
                      <p className="text-xs font-bold text-slate-900">{selectedClaim.usuario_reportado.primer_nombre} {selectedClaim.usuario_reportado.primer_apellido}</p>
                      <p className="text-[10px] text-slate-500">Cel: {selectedClaim.usuario_reportado.telefono}</p>
                      <p className="text-[10px] text-slate-500">{selectedClaim.usuario_reportado.correo}</p>
                    </>
                  ) : (
                    <p className="text-xs font-bold text-slate-500">Reclamo General (Sin infractor)</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <h4 className="text-xs uppercase tracking-wider font-black text-slate-400">Descripción del Suceso</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-700 font-medium leading-relaxed">
                  {selectedClaim.descripcion}
                </div>
              </div>

              {/* Evidencia Visual */}
              {selectedClaim.evidencias && selectedClaim.evidencias.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-black text-slate-400">Evidencia Fotográfica</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedClaim.evidencias.map((ev: string, idx: number) => {
                      const supabaseBaseUrl = "https://khagadpjvxmzrouelwpu.storage.supabase.co/storage/v1/object/public/nex-us";
                      const imgUrl = ev.startsWith('http') ? ev : `${supabaseBaseUrl}/${ev}`;
                      return (
                        <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="relative h-32 rounded-xl overflow-hidden border group">
                          <img src={imgUrl} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-5 w-5 text-white" />
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Acciones de Resolución */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-black text-slate-400">Acciones del Administrador</h4>
                
                {/* Gravedad Adjust */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Ajustar Gravedad:</span>
                  <div className="flex gap-1">
                    {['Baja', 'Media', 'Alta'].map((g) => (
                      <button
                        key={g}
                        disabled={updatingClaimStatus}
                        onClick={() => handleUpdateClaimSeverity(g)}
                        className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", 
                          selectedClaim.gravedad === g 
                            ? g === 'Baja' ? "bg-blue-600 text-white" : g === 'Media' ? "bg-amber-500 text-white" : "bg-red-600 text-white animate-pulse"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Adjust */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold">Cambiar Estado del Caso:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button 
                      onClick={() => handleUpdateClaimStatus('Pendiente')}
                      disabled={updatingClaimStatus}
                      className={cn("rounded-xl h-9 text-[10px] font-bold uppercase", 
                        selectedClaim.estado === 'Pendiente' ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
                    >
                      Pendiente
                    </Button>
                    <Button 
                      onClick={() => handleUpdateClaimStatus('En Revision')}
                      disabled={updatingClaimStatus}
                      className={cn("rounded-xl h-9 text-[10px] font-bold uppercase", 
                        selectedClaim.estado === 'En Revision' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
                    >
                      En Revisión
                    </Button>
                    <Button 
                      onClick={() => handleUpdateClaimStatus('Resuelta')}
                      disabled={updatingClaimStatus}
                      className={cn("rounded-xl h-9 text-[10px] font-bold uppercase", 
                        selectedClaim.estado === 'Resuelta' ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
                    >
                      Resuelta
                    </Button>
                    <Button 
                      onClick={() => handleUpdateClaimStatus('Desestimada')}
                      disabled={updatingClaimStatus}
                      className={cn("rounded-xl h-9 text-[10px] font-bold uppercase", 
                        selectedClaim.estado === 'Desestimada' ? "bg-slate-500 text-white hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
                    >
                      Desestimada
                    </Button>
                  </div>
                </div>

                {/* Contact Shortcuts */}
                <div className="flex gap-2 justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-slate-200 font-bold text-xs"
                    onClick={() => window.open(`https://wa.me/51${selectedClaim.usuario_reportante?.telefono}?text=Hola ${selectedClaim.usuario_reportante?.primer_nombre}, te contacto del soporte de UniRent sobre tu reclamo #${selectedClaim.id_incidencia}.`, '_blank')}
                  >
                    WhatsApp Reportante
                  </Button>
                  {selectedClaim.usuario_reportado && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-xl border-slate-200 font-bold text-xs"
                      onClick={() => window.open(`https://wa.me/51${selectedClaim.usuario_reported?.telefono || selectedClaim.usuario_reportado?.telefono}?text=Hola ${selectedClaim.usuario_reported?.primer_nombre || selectedClaim.usuario_reportado?.primer_nombre}, te contacto del soporte de UniRent sobre la incidencia #${selectedClaim.id_incidencia} reportada en tu contra.`, '_blank')}
                    >
                      WhatsApp Reportado
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button variant="ghost" onClick={() => setShowClaimDetailModal(false)} className="rounded-xl font-bold">
                  Cerrar Ficha
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DETAIL MODAL FOR PAYMENT REQUEST */}
      <Dialog open={showPaymentDetailModal} onOpenChange={setShowPaymentDetailModal}>
        <DialogContent className="rounded-3xl sm:max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <DollarSign className="h-5 w-5 text-green-600 bg-green-50 rounded-lg p-0.5" /> Ficha de Pago #{selectedPayment?.id_solicitud}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Verifica los detalles del comprobante para aprobar el pago y reiniciar la deuda del usuario.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 mt-4">
              <div className="border p-4 rounded-2xl bg-slate-50 space-y-1 text-xs">
                <p className="font-bold text-slate-800">Datos del Estudiante:</p>
                <p className="text-slate-600">Nombre: <span className="font-bold">{selectedPayment.usuario?.primer_nombre} {selectedPayment.usuario?.primer_apellido}</span></p>
                <p className="text-slate-600">Usuario: <span className="font-bold">@{selectedPayment.usuario?.username}</span></p>
                <p className="text-slate-600">Telf: <span className="font-bold">{selectedPayment.usuario?.telefono}</span></p>
                <p className="text-slate-600">DNI: <span className="font-bold">{selectedPayment.usuario?.dni}</span></p>
              </div>

              <div className="border p-4 rounded-2xl bg-slate-50 space-y-1 text-xs">
                <p className="font-bold text-slate-800">Datos del Pago:</p>
                <p className="text-slate-600">Monto Reportado: <span className="font-bold text-slate-900 text-sm">S/ {Number(selectedPayment.monto).toFixed(2)}</span></p>
                <p className="text-slate-600">Nro. Operación: <span className="font-mono font-bold text-slate-900">{selectedPayment.nro_operacion}</span></p>
                <p className="text-slate-600">Fecha Envío: <span className="font-bold text-slate-700">{new Date(selectedPayment.created_at).toLocaleString('es-PE')}</span></p>
                <p className="text-slate-600">Estado: 
                  <span className={cn(
                    "ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide",
                    selectedPayment.estado === 'Pendiente' && "bg-amber-100 text-amber-700",
                    selectedPayment.estado === 'Aprobado' && "bg-green-100 text-green-700",
                    selectedPayment.estado === 'Rechazado' && "bg-red-100 text-red-700"
                  )}>
                    {selectedPayment.estado}
                  </span>
                </p>
              </div>

              {/* Imagen del Comprobante */}
              {selectedPayment.comprobante_url ? (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Comprobante (Imagen)</p>
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border bg-slate-100 shadow-inner flex items-center justify-center">
                    <img 
                      src={`${API_URL.replace('/api', '')}/storage/${selectedPayment.comprobante_url}`} 
                      alt="Comprobante de Pago" 
                      className="max-w-full max-h-full object-contain cursor-zoom-in"
                      onClick={() => window.open(`${API_URL.replace('/api', '')}/storage/${selectedPayment.comprobante_url}`, '_blank')}
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-400 mt-1 italic">* Haz clic en la imagen para verla en tamaño completo</p>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 border border-slate-200 text-center rounded-2xl text-xs text-slate-500 font-bold">
                  No se cargó ninguna foto del comprobante.
                </div>
              )}

              {/* Botones de Acción */}
              <div className="border-t pt-4 flex gap-2 justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPaymentDetailModal(false)}
                  className="rounded-xl font-bold text-xs"
                >
                  Cerrar
                </Button>
                {selectedPayment.estado === 'Pendiente' ? (
                  <>
                    <Button 
                      disabled={isProcessingPayment}
                      onClick={() => handleProcessPayment(selectedPayment.id_solicitud, 'Rechazado')}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4"
                    >
                      Rechazar
                    </Button>
                    <Button 
                      disabled={isProcessingPayment}
                      onClick={() => handleProcessPayment(selectedPayment.id_solicitud, 'Aprobado')}
                      className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4"
                    >
                      Aprobar (Deuda S/ 0)
                    </Button>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground italic flex items-center">
                    Procesado como: {selectedPayment.estado}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UniRentFooter />
    </div>
  )
}
