"use client"

import { useState } from "react"
import { API_URL } from "../lib/api"
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    correo: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const field = id.replace("login-", "")
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Evitamos múltiples clics
    if (isLoading) return;

    console.log("Intentando iniciar sesión con:", formData.correo);
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        // Guardamos los datos de sesión (BUENA PRÁCTICA: Persistencia local)
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        toast({
          title: "¡Bienvenido a NexUs!",
          description: "Has iniciado sesión correctamente.",
        })

        // Redirección inmediata al Home
        setTimeout(() => {
          window.location.href = "/"
        }, 500)
      } else {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: data.message || "Correo o contraseña incorrectos.",
        })
      }
    } catch (error) {
      console.error("Error en la petición de login:", error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor backend (127.0.0.1:8000).",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Inicia sesión</h1>
        <p className="text-muted-foreground text-sm mt-2">Ingresa tus credenciales universitarias</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-correo">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-correo"
              type="email"
              placeholder="tu@correo.edu.pe"
              className="pl-9 h-11 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/20"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              className="pl-9 pr-10 h-11 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/20"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Entrar a NexUs
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-2">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="text-primary font-semibold hover:underline underline-offset-4">Regístrate ahora</a>
      </div>
    </div>
  )
}
