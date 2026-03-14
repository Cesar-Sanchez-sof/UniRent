"use client"

import { API_URL } from "../lib/api"
import { useState, useEffect, useCallback } from "react"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Check,
  Phone,
  CreditCard,
  Hash,
  AtSign,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Universidad {
  id_universidad: number;
  nombre_completo: string;
}

export function RegisterForm() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [universidades, setUniversidades] = useState<Universidad[]>([])

  const [formData, setFormData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    username: "",
    correo: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    dni: "",
    codigo_universitario: "",
    id_universidad: "",
  })

  // Carga de universidades - Usamos un useEffect limpio sin dependencias volátiles
  useEffect(() => {
    let mounted = true;
    const fetchUniversidades = async () => {
      try {
        const response = await fetch(`${API_URL}/universidades`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        if (response.ok && mounted) {
          const data = await response.json();
          setUniversidades(data);
        }
      } catch (error) {
        console.error("Error al cargar universidades:", error);
      }
    };
    fetchUniversidades();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const field = id.replace("reg-", "");
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  // Validación Paso 1 (Solo campos de la primera vista)
  const isStep1Complete = 
    formData.primer_nombre.trim() !== "" && 
    formData.primer_apellido.trim() !== "" && 
    formData.segundo_apellido.trim() !== "" && 
    formData.username.trim() !== "" && 
    formData.correo.includes("@");

  // Validación Paso 2 (Campos de seguridad y universidad)
  const isStep2Complete = 
    formData.dni.length === 8 && 
    formData.telefono.length === 9 && 
    formData.id_universidad !== "" && 
    formData.codigo_universitario.trim() !== "" && 
    formData.password.length >= 8 && 
    passwordsMatch;

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isStep1Complete) {
      setStep(2);
    } else {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor llena todos los campos obligatorios (*) antes de seguir."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "¡Éxito!", description: "Usuario registrado correctamente." });
        setTimeout(() => window.location.href = "/login", 1500);
      } else {
        const msg = data.errors ? Object.values(data.errors).flat().join(" ") : data.message;
        toast({ variant: "destructive", title: "Error", description: msg || "No se pudo registrar." });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor backend.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="mb-4 -ml-2 text-muted-foreground hover:text-primary transition-colors gap-2"
        >
          <a href="/login" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </a>
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm">
            {step === 1 ? "Paso 1: Información Personal" : "Paso 2: Datos Universitarios"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm", step >= 1 ? "bg-primary text-white" : "bg-muted")}>1</div>
        <div className={cn("h-1 flex-1", step === 2 ? "bg-primary" : "bg-muted")} />
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm", step === 2 ? "bg-primary text-white" : "bg-muted")}>2</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-primer_nombre">Primer Nombre *</Label>
                <Input id="reg-primer_nombre" placeholder="Ej: Juan" value={formData.primer_nombre} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-segundo_nombre">Segundo Nombre</Label>
                <Input id="reg-segundo_nombre" placeholder="Opcional" value={formData.segundo_nombre} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-primer_apellido">Ap. Paterno *</Label>
                <Input id="reg-primer_apellido" placeholder="Paterno" value={formData.primer_apellido} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-segundo_apellido">Ap. Materno *</Label>
                <Input id="reg-segundo_apellido" placeholder="Materno" value={formData.segundo_apellido} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-username">Nombre de Usuario *</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-username" placeholder="usuario_2024" className="pl-9" value={formData.username} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-correo">Correo electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="reg-correo" type="email" placeholder="alumno@universidad.edu.pe" className="pl-9" value={formData.correo} onChange={handleChange} />
              </div>
            </div>

            <Button type="button" onClick={handleNextStep} disabled={!isStep1Complete} className="w-full h-11">
              Siguiente paso <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-dni">DNI (8 dígitos) *</Label>
                <Input id="reg-dni" placeholder="12345678" maxLength={8} value={formData.dni} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-telefono">Teléfono (9 dígitos) *</Label>
                <Input id="reg-telefono" placeholder="987654321" maxLength={9} value={formData.telefono} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-id_universidad">Universidad *</Label>
              <select id="reg-id_universidad" value={formData.id_universidad} onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer">
                <option value="">Selecciona tu universidad</option>
                {universidades.map((u) => (
                  <option key={u.id_universidad} value={u.id_universidad}>{u.nombre_completo}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-codigo_universitario">Código Universitario *</Label>
              <Input id="reg-codigo_universitario" placeholder="20240011" value={formData.codigo_universitario} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Contraseña *</Label>
                <Input id="reg-password" type="password" value={formData.password} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirmPassword">Confirmar *</Label>
                <Input id="reg-confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Atrás</Button>
              <Button type="submit" disabled={isLoading || !isStep2Complete} className="flex-[2] h-11">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Finalizar Registro"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
