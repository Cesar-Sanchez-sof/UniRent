"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Tag,
  MapPin,
  DollarSign,
  FileText,
  Loader2,
  Check,
  Info,
  Plus,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { MultiImageUpload } from "@/components/multi-image-upload"
import { API_URL } from "@/lib/api"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ImageFile {
  id: string
  file: File
  preview: string
}

const categories = [
  { id: "tech", label: "Tecnología", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "books", label: "Libros", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { id: "photo", label: "Fotografía", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "tools", label: "Herramientas", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "art", label: "Arte", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { id: "sports", label: "Deporte", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
]

const conditions = [
  { id: "new", label: "Nuevo", desc: "Sin usar o con empaque original" },
  { id: "like-new", label: "Como nuevo", desc: "Usado pocas veces, excelente estado" },
  { id: "good", label: "Buen estado", desc: "Uso normal, funciona perfectamente" },
  { id: "fair", label: "Aceptable", desc: "Marcas de uso pero completamente funcional" },
]

const locationsData = {
  "La Libertad": {
    "Trujillo": [
      "Trujillo (Cercado)", "Victor Larco Herrera", "La Esperanza", "El Porvenir", 
      "Florencia de Mora", "Laredo", "Moche", "Salaverry", "Huanchaco", "Simbal", "Poroto"
    ],
    "Ascope": ["Ascope", "Casa Grande", "Chicama", "Chocope", "Magdalena de Cao", "Paiján", "Rázuri", "Santiago de Cao"],
    "Chepén": ["Chepén", "Pacanga", "Pueblo Nuevo"],
    "Pacasmayo": ["San Pedro de Lloc", "Guadalupe", "Jequetepeque", "Pacasmayo", "San José"],
    "Virú": ["Virú", "Chao", "Guadalupito"]
  },
  "Lima": {
    "Lima": ["Cercado de Lima", "Miraflores", "San Isidro", "Santiago de Surco", "Barranco", "San Borja", "La Molina"],
    "Callao": ["Callao", "Bellavista", "La Perla", "La Punta", "Carmen de la Legua", "Ventanilla"]
  },
  "Lambayeque": {
    "Chiclayo": ["Chiclayo", "Chongoyape", "Eten", "Eten Puerto", "José Leonardo Ortiz", "La Victoria", "Lagunas"],
    "Lambayeque": ["Lambayeque", "Chochope", "Illimo", "Mórrope", "Motupe", "Olmos", "Salas"]
  }
}

export function PublishForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [images, setImages] = useState<ImageFile[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [pricePerDay, setPricePerDay] = useState("")
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0)
  
  // Ubicación Real desde API
  const [departamentos, setDepartamentos] = useState<any[]>([])
  const [provincias, setProvincias] = useState<any[]>([])
  const [distritos, setDistritos] = useState<any[]>([])

  const [idDepartamento, setIdDepartamento] = useState("")
  const [idProvincia, setIdProvincia] = useState("")
  const [idDistrito, setIdDistrito] = useState("")
  
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Cargar Departamentos al iniciar
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones/departamentos`);
        if (res.ok) {
          const data = await res.json();
          setDepartamentos(data);
        }
      } catch (e) {
        console.error("Error cargando departamentos:", e);
      }
    };
    loadDepts();
  }, [])

  // Cargar Provincias cuando cambie el departamento
  useEffect(() => {
    if (!idDepartamento) return;
    const loadProvs = async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones/provincias/${idDepartamento}`);
        if (res.ok) {
          const data = await res.json();
          setProvincias(data);
          setIdProvincia("");
          setIdDistrito("");
          setDistritos([]);
        }
      } catch (e) {
        console.error("Error cargando provincias:", e);
      }
    };
    loadProvs();
  }, [idDepartamento])

  // Cargar Distritos cuando cambie la provincia
  useEffect(() => {
    if (!idProvincia) return;
    const loadDists = async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones/distritos/${idProvincia}`);
        if (res.ok) {
          const data = await res.json();
          setDistritos(data);
          setIdDistrito("");
        }
      } catch (e) {
        console.error("Error cargando distritos:", e);
      }
    };
    loadDists();
  }, [idProvincia])

  const handlePriceChange = (value: string) => {
    setPricePerDay(value)
    const price = parseFloat(value)
    if (!isNaN(price)) {
      setInsuranceAmount(price * 0.30)
    } else {
      setInsuranceAmount(0)
    }
  }

  const isValid =
    images.length >= 1 &&
    title.trim().length > 3 &&
    description.trim().length > 10 &&
    category &&
    condition &&
    pricePerDay &&
    idDistrito

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    const token = localStorage.getItem('auth_token')

    try {
      const formData = new FormData()
      formData.append('titulo', title)
      formData.append('descripcion', description)
      formData.append('precio_dia', pricePerDay)
      formData.append('condicion', condition)
      formData.append('id_categoria', category)
      formData.append('id_distrito', idDistrito) // Enviamos el ID real

      images.forEach((img, index) => {
        formData.append(`imagenes[${index}]`, img.file)
      })

      const response = await fetch(`${API_URL}/publicaciones`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setIsPublished(true)
      } else {
        toast({ variant: "destructive", title: "Error al publicar", description: data.message })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error de conexión" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isPublished) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Check className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artículo publicado</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Tu artículo está ahora visible para todos los estudiantes de tu campus.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl" asChild>
            <a href="/">Ir al inicio</a>
          </Button>
          <Button
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setIsPublished(false)
              setImages([])
              setTitle("")
              setDescription("")
              setCategory("")
              setCondition("")
              setPricePerDay("")
              setDeposit("")
              setLocation("")
            }}
          >
            Publicar otro
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Section 1: Images */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">1</span>
          </div>
          <h2 className="text-base font-semibold text-foreground">Fotos del artículo</h2>
          <span className="text-xs text-muted-foreground ml-auto">Mín. 1, máx. 8</span>
        </div>
        <MultiImageUpload images={images} onChange={setImages} maxImages={8} />
        <div className="mt-2 flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Las fotos claras y bien iluminadas aumentan un 60% las solicitudes de alquiler. Incluye fotos de todos los ángulos y detalles del estado.
          </p>
        </div>
      </section>

      {/* Section 2: Basic info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">2</span>
          </div>
          <h2 className="text-base font-semibold text-foreground">Información básica</h2>
        </div>
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pub-title" className="text-foreground text-sm font-medium">
              Título del artículo
            </Label>
            <div className="relative">
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none transition-colors",
                focusedField === "title" ? "text-primary" : "text-muted-foreground"
              )}>
                <Tag className="h-[18px] w-[18px]" />
              </div>
              <Input
                id="pub-title"
                type="text"
                placeholder="Ej: Calculadora Gráfica TI-84 Plus"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
                className="h-12 pl-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                required
                maxLength={80}
              />
            </div>
            <span className="text-[11px] text-muted-foreground text-right">{title.length}/80</span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pub-desc" className="text-foreground text-sm font-medium">
              Descripción
            </Label>
            <div className="relative">
              <div className={cn(
                "absolute left-3 top-3 pointer-events-none transition-colors",
                focusedField === "desc" ? "text-primary" : "text-muted-foreground"
              )}>
                <FileText className="h-[18px] w-[18px]" />
              </div>
              <textarea
                id="pub-desc"
                placeholder="Describe el estado, características y lo que incluye tu artículo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setFocusedField("desc")}
                onBlur={() => setFocusedField(null)}
                className="min-h-[120px] w-full pl-10 pr-4 pt-3 pb-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary outline-none resize-y transition-all"
                required
                maxLength={500}
              />
            </div>
            <span className="text-[11px] text-muted-foreground text-right">{description.length}/500</span>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground text-sm font-medium">Categoría</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 transition-all text-center",
                    category === cat.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                  </svg>
                  <span className="text-[11px] font-medium leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground text-sm font-medium">Estado del artículo</Label>
            <div className="grid grid-cols-2 gap-2">
              {conditions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCondition(c.id)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border-2 p-3 transition-all text-left",
                    condition === c.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    condition === c.id ? "text-primary" : "text-foreground"
                  )}>
                    {c.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Price & Location */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">3</span>
          </div>
          <h2 className="text-base font-semibold text-foreground">Precio y ubicación</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price per day */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pub-price" className="text-foreground text-sm font-medium">
                Precio de alquiler por día (Soles)
              </Label>
              <div className="relative">
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none transition-colors font-bold text-sm",
                  focusedField === "price" ? "text-primary" : "text-muted-foreground"
                )}>
                  S/
                </div>
                <Input
                  id="pub-price"
                  type="number"
                  placeholder="0.00"
                  value={pricePerDay}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  onFocus={() => setFocusedField("price")}
                  onBlur={() => setFocusedField(null)}
                  className="h-12 pl-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                  required
                  min={1}
                />
              </div>
            </div>

            {/* Insurance Info - Automatic */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm font-medium flex items-center gap-1.5">
                Seguro de la plataforma (30%)
                <Popover>
                  <PopoverTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help" />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 text-xs leading-relaxed bg-card border-border rounded-xl shadow-xl">
                    <p className="font-bold mb-1 text-primary">Seguro Automático</p>
                    Este monto se calcula automáticamente (30% del precio) y es lo que la plataforma cobra por cada reserva realizada.
                  </PopoverContent>
                </Popover>
              </Label>
              <div className="h-12 flex items-center px-4 rounded-xl border border-dashed border-border bg-secondary/20 text-muted-foreground font-semibold">
                {insuranceAmount > 0 ? (
                  <span className="text-accent">S/ {insuranceAmount.toFixed(2)}</span>
                ) : (
                  <span className="text-xs font-normal">Se calculará al ingresar el precio</span>
                )}
              </div>
            </div>
          </div>

          {/* Location - Dept, Province & District */}
          <div className="flex flex-col gap-3">
            <Label className="text-foreground text-sm font-medium">
              Ubicación del artículo
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Departamento Selector */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pub-dept" className="text-[11px] text-muted-foreground uppercase font-bold">Departamento</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <select
                    id="pub-dept"
                    value={idDepartamento}
                    onChange={(e) => setIdDepartamento(e.target.value)}
                    className="h-12 w-full pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all"
                    required
                  >
                    <option value="" disabled>Seleccionar</option>
                    {departamentos.map((d) => (
                      <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Provincia Selector */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pub-province" className="text-[11px] text-muted-foreground uppercase font-bold">Provincia</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <select
                    id="pub-province"
                    value={idProvincia}
                    onChange={(e) => setIdProvincia(e.target.value)}
                    disabled={!idDepartamento}
                    className={cn(
                      "h-12 w-full pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all",
                      !idDepartamento && "opacity-50 cursor-not-allowed"
                    )}
                    required
                  >
                    <option value="" disabled>Seleccionar</option>
                    {provincias.map((p) => (
                      <option key={p.id_provincia} value={p.id_provincia}>{p.nombre}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Distrito Selector */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pub-district" className="text-[11px] text-muted-foreground uppercase font-bold">Distrito</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <select
                    id="pub-district"
                    value={idDistrito}
                    onChange={(e) => setIdDistrito(e.target.value)}
                    disabled={!idProvincia}
                    className={cn(
                      "h-12 w-full pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all",
                      !idProvincia && "opacity-50 cursor-not-allowed"
                    )}
                    required
                  >
                    <option value="" disabled>Seleccionar</option>
                    {distritos.map((d) => (
                      <option key={d.id_distrito} value={d.id_distrito}>{d.nombre}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Define la ubicación exacta. Esto ayudará a los estudiantes a saber qué tan cerca está el artículo.
            </p>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-border text-foreground font-medium px-6"
            asChild
          >
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </a>
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                Poner artículo en alquiler
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Al publicar, aceptas las políticas de UniRent para propietarios.
        </p>
      </div>
    </form>
  )
}
