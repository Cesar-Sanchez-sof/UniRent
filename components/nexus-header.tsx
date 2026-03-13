"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Bell, Menu, X, ChevronDown, User, LogOut, Package, History, Plus, Home, Inbox, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function NexusHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Notificaciones
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    try {
      const response = await fetch("${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000/api\"}/notifications", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.leido).length)
      }
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      setIsLoggedIn(true)
      try {
        setUserData(JSON.parse(userStr))
        fetchNotifications()
        // Poll cada 10 segundos para respuesta rápida
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
      } catch (e) { console.error(e) }
    }

    const handlePhotoUpdate = (event: any) => {
      setUserData((prev: any) => ({ ...prev, foto_url_full: event.detail }))
    }

    window.addEventListener('user-photo-updated', handlePhotoUpdate)
    return () => window.removeEventListener('user-photo-updated', handlePhotoUpdate)
  }, [fetchNotifications])

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('auth_token')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000/api\"}/notifications/${id}/read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      setNotifications(prev => prev.map(n => n.id_notificacion === id ? { ...n, leido: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) { console.error(e) }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem('auth_token')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000/api\"}/notifications/read-all`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      })
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })))
      setUnreadCount(0)
    } catch (e) { console.error(e) }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUserData(null)
    window.location.href = "/"
  }

  const handleSearch = (value: string) => {
    window.dispatchEvent(new CustomEvent('global-search', { detail: value }))
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-2xl font-bold tracking-tighter text-foreground">NexUs</a>
            
            <div className="hidden md:flex relative w-80 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="¿Qué estás buscando?" 
                className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary border-none text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium rounded-full px-4" asChild>
              <a href={isLoggedIn ? "/publish" : "/login"}>Pon tu artículo para alquiler</a>
            </Button>
            
            <div className="h-8 w-px bg-border mx-2" />

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-white animate-pulse" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-2xl overflow-hidden border-border/50">
                    <div className="p-4 bg-primary/5 border-b flex justify-between items-center">
                      <DropdownMenuLabel className="p-0 font-bold flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" /> Notificaciones
                      </DropdownMenuLabel>
                      {unreadCount > 0 && (
                        <button onClick={(e) => { e.preventDefault(); markAllAsRead(); }} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">
                          Marcar todo como leído
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <DropdownMenuItem 
                            key={notif.id_notificacion} 
                            className={cn(
                              "flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-border/30 last:border-0",
                              !notif.leido ? "bg-primary/[0.03]" : "opacity-70"
                            )}
                            onClick={() => markAsRead(notif.id_notificacion)}
                          >
                            <div className="flex justify-between w-full gap-2">
                              <span className={cn("text-xs font-bold leading-tight", !notif.leido && "text-primary")}>{notif.titulo}</span>
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(notif.fecha_registro), { addSuffix: true, locale: es })}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">{notif.mensaje}</p>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <Inbox className="h-8 w-8 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground">No tienes notificaciones</p>
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <a href="/profile?tab=rentals" className="block p-3 text-center text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">
                      Ver historial completo
                    </a>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border">
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        {userData?.foto_url_full || userData?.foto ? (
                          <img 
                            src={userData?.foto_url_full || `http://localhost:8000/storage/${userData.foto}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userData?.primer_nombre || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{userData?.correo}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <a href="/profile">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary">
                        <User className="h-4 w-4" /> <span className="text-sm font-medium">Perfil</span>
                      </DropdownMenuItem>
                    </a>
                    <a href="/profile?tab=publications">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary">
                        <Package className="h-4 w-4" /> <span className="text-sm font-medium">Mis Publicaciones</span>
                      </DropdownMenuItem>
                    </a>
                    <a href="/profile?tab=rentals">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary border-b border-border/50">
                        <History className="h-4 w-4" /> <span className="text-sm font-medium">Mis Alquileres</span>
                      </DropdownMenuItem>
                    </a>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-destructive/10 text-destructive mt-1" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> <span className="text-sm font-medium">Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-sm font-medium rounded-full" asChild>
                  <a href="/login">Iniciar Sesión</a>
                </Button>
                <Button className="text-sm font-medium rounded-full px-6" asChild>
                  <a href="/register">Crear Cuenta</a>
                </Button>
              </div>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
            <div className="relative">
              <Menu className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-white" />
              )}
            </div>
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] bg-white lg:hidden flex flex-col">
          <div className="flex items-center justify-between p-4 h-16 border-b">
            <span className="text-2xl font-bold tracking-tighter">NexUs</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-secondary">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold overflow-hidden border border-white shadow-sm">
                    {userData?.foto_url_full || userData?.foto ? (
                      <img 
                        src={userData?.foto_url_full || `http://localhost:8000/storage/${userData.foto}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userData?.primer_nombre?.[0]
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{userData?.primer_nombre} {userData?.primer_apellido}</p>
                    <p className="text-xs text-muted-foreground">{userData?.username}</p>
                  </div>
                </div>
                <nav className="flex flex-col gap-1">
                  <a href="/" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="h-5 w-5 text-primary" /> Inicio
                  </a>
                  <a href="/profile" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5 text-primary" /> Mi Perfil
                  </a>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary font-medium cursor-pointer" onClick={fetchNotifications}>
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-primary" /> Notificaciones
                    </div>
                    {unreadCount > 0 && <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                  </div>
                  <a href="/profile?tab=publications" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    <Package className="h-5 w-5 text-primary" /> Mis Publicaciones
                  </a>
                  <a href="/profile?tab=rentals" className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary font-medium" onClick={() => setMobileMenuOpen(false)}>
                    <History className="h-5 w-5 text-primary" /> Mis Alquileres
                  </a>
                  <div className="h-px bg-border my-2" />
                  <a href="/publish" className="flex items-center gap-4 p-4 rounded-2xl bg-primary text-white font-bold justify-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Plus className="h-5 w-5" /> Poner artículo
                  </a>
                </nav>
                <div className="mt-auto pb-6">
                  <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 rounded-xl text-destructive font-bold bg-destructive/5">
                    <LogOut className="h-5 w-5" /> Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 pt-10">
                <Button className="w-full rounded-full h-12 font-bold" asChild onClick={() => setMobileMenuOpen(false)}>
                  <a href="/login">Iniciar Sesión</a>
                </Button>
                <Button variant="outline" className="w-full rounded-full h-12 font-bold" asChild onClick={() => setMobileMenuOpen(false)}>
                  <a href="/register">Crear Cuenta</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
