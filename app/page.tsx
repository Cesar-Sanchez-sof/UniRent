"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Users, 
  DollarSign, 
  Laptop, 
  Camera, 
  BookOpen, 
  Bike, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  Search,
  Lock,
  Heart,
  TrendingUp,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) setIsLoggedIn(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 font-sans selection:bg-primary selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-primary via-indigo-600 to-blue-600 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 animate-bounce" />
        <span><strong>¡Bienvenido a UniRent!</strong> El marketplace P2P exclusivo para la comunidad universitaria.</span>
        <Link href="/marketplace" className="underline font-bold hover:text-indigo-200 transition-colors ml-2 hidden sm:inline-flex items-center gap-1">
          Visitar Marketplace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 2. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
              <span className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary/20">
                U
              </span>
              <span>Uni<span className="text-primary">Rent</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#como-funciona" className="hover:text-primary transition-colors">Cómo Funciona</a>
            <a href="#beneficios" className="hover:text-primary transition-colors">Beneficios</a>
            <a href="#categorias" className="hover:text-primary transition-colors">Categorías</a>
            <a href="#seguridad" className="hover:text-primary transition-colors">Seguridad P2P</a>
            <a href="#testimonios" className="hover:text-primary transition-colors">Opiniones</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex font-semibold">
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button variant="outline" asChild className="hidden sm:inline-flex font-semibold border-slate-300">
                  <Link href="/register">Registrarse</Link>
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild className="font-semibold">
                <Link href="/profile">Mi Perfil</Link>
              </Button>
            )}

            {/* MAIN CTA TO MARKETPLACE */}
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all px-6">
              <Link href="/marketplace" className="flex items-center gap-2">
                <span>Visitar UniRent</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* 3. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
          {/* Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>Alquileres 100% seguros entre universitarios</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                  Alquila lo que necesitas, <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-primary via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    gana dinero con lo que no usas
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  La plataforma P2P donde universitarios alquilan laptops, cámaras, calculadoras científicas, libros y movilidad por días o semanas. Todo con garantía y calificaciones transparentes.
                </p>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-base font-bold h-14 px-8 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                    <Link href="/marketplace" className="flex items-center justify-center gap-3">
                      <span>Explorar Marketplace</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base font-semibold h-14 px-8 rounded-2xl border-slate-300 hover:bg-slate-100/80">
                    <Link href="/publish">Publicar un Artículo</Link>
                  </Button>
                </div>

                {/* Micro Trust Badges */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-left">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">+1,200</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Estudiantes activos</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">30%</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Seguro de garantía</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">4.9 ★</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Calificación promedio</div>
                  </div>
                </div>

              </div>

              {/* Right Visual Card Mockup */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  
                  {/* Decorative backdrop */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse" />

                  {/* Main Preview Card */}
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
                    
                    {/* Header bar preview */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                          🎓
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">Marketplace Universitario</div>
                          <div className="text-xs text-slate-500">Disponibilidad en tiempo real</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Activo
                      </span>
                    </div>

                    {/* Featured Product Mock Card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                      <div className="relative h-44 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 overflow-hidden flex items-center justify-center text-white">
                        <Camera className="h-16 w-16 text-indigo-300 opacity-80" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                          Cámara DSLR Canon EOS
                        </div>
                        <div className="absolute bottom-3 right-3 bg-primary text-white px-3 py-1 rounded-lg text-xs font-black shadow-md">
                          S/ 35 / día
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.95 (18 reseñas)
                        </span>
                        <span className="text-slate-500">Publicado por Diego M.</span>
                      </div>
                    </div>

                    {/* Action button inside preview */}
                    <Link href="/marketplace" className="block w-full">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2">
                        <span>Ver más productos en UniRent</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. CÓMO FUNCIONA (HOW IT WORKS) */}
        <section id="como-funciona" className="py-20 bg-white border-y border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
                Proceso Simple & Transparente
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ¿Cómo funciona UniRent?
              </p>
              <p className="text-slate-600 text-base sm:text-lg">
                En solo 3 pasos puedes comenzar a alquilar herramientas para tus estudios o ganar dinero con tus propios artículos.
              </p>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200/80 space-y-4 hover:shadow-lg transition-all">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/30">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900">Busca y Elige</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Explora el catálogo de laptops, calculadoras, cámaras o transporte cerca de ti. Filtra por disponibilidad de fechas y precios.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <Search className="h-4 w-4" /> Filtros por fecha en tiempo real
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200/80 space-y-4 hover:shadow-lg transition-all">
                <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900">Reserva con Garantía</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Selecciona el período de alquiler. El sistema valida automáticamente que no haya traslapes y calcula el seguro de protección (30%).
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary">
                  <Lock className="h-4 w-4" /> Sin traslapes garantizado
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200/80 space-y-4 hover:shadow-lg transition-all">
                <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/30">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900">Devuelve y Califica</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Disfruta el servicio. Al devolver el producto, el propietario confirma la recepción y ambas partes se califican para fortalecer su reputación.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <Star className="h-4 w-4" /> Reputación bidireccional
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. PROPUESTA DE VALOR / BENEFICIOS */}
        <section id="beneficios" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
                Por Qué Elegirnos
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Diseñado exclusivamente para la vida universitaria
              </p>
            </div>

            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-3 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Ahorra hasta un 80%</h3>
                <p className="text-sm text-slate-600">
                  No compres equipos caros para un solo ciclo o proyecto. Alquila solo por los días que realmente necesitas.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-3 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Genera Ingresos Pasivos</h3>
                <p className="text-sm text-slate-600">
                  Pon a trabajar esa cámara o calculadora que tienes guardada en la mochila y recupera tu inversión.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-3 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Seguridad & Garantía</h3>
                <p className="text-sm text-slate-600">
                  Respaldo con depósito de garantía (30%) y verificación de perfiles de la comunidad académica.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-3 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Sistema de Confianza</h3>
                <p className="text-sm text-slate-600">
                  Calificaciones mutuas (dueño y arrendador) para asegurar tratos honestos y de alta calidad.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 6. VISTA PREVIA DE CATEGORÍAS */}
        <section id="categorias" className="py-20 bg-white border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
                  Explora por Categoría
                </h2>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                  ¿Qué necesitas hoy para tus clases?
                </p>
              </div>
              
              <Button asChild variant="outline" className="rounded-xl font-bold border-slate-300">
                <Link href="/marketplace" className="flex items-center gap-2">
                  <span>Ver todas en Marketplace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* Category 1 */}
              <Link href="/marketplace" className="group bg-slate-50 hover:bg-primary/5 border border-slate-200/80 hover:border-primary/40 rounded-2xl p-6 text-center space-y-3 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm group-hover:scale-110 flex items-center justify-center mx-auto text-primary transition-transform">
                  <Laptop className="h-7 w-7" />
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-primary">Tecnología & Laptops</div>
                <div className="text-xs text-slate-500">Laptops, Tablets, Gadgets</div>
              </Link>

              {/* Category 2 */}
              <Link href="/marketplace" className="group bg-slate-50 hover:bg-primary/5 border border-slate-200/80 hover:border-primary/40 rounded-2xl p-6 text-center space-y-3 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm group-hover:scale-110 flex items-center justify-center mx-auto text-indigo-600 transition-transform">
                  <Camera className="h-7 w-7" />
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600">Fotografía & Audiovisual</div>
                <div className="text-xs text-slate-500">Cámaras, Micrófonos, Luces</div>
              </Link>

              {/* Category 3 */}
              <Link href="/marketplace" className="group bg-slate-50 hover:bg-primary/5 border border-slate-200/80 hover:border-primary/40 rounded-2xl p-6 text-center space-y-3 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm group-hover:scale-110 flex items-center justify-center mx-auto text-emerald-600 transition-transform">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Libros & Calculadoras</div>
                <div className="text-xs text-slate-500">TI-Nspire, Textos de Ingeniería</div>
              </Link>

              {/* Category 4 */}
              <Link href="/marketplace" className="group bg-slate-50 hover:bg-primary/5 border border-slate-200/80 hover:border-primary/40 rounded-2xl p-6 text-center space-y-3 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm group-hover:scale-110 flex items-center justify-center mx-auto text-amber-600 transition-transform">
                  <Bike className="h-7 w-7" />
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-amber-600">Movilidad Urbana</div>
                <div className="text-xs text-slate-500">Scooters, Bicicletas</div>
              </Link>

              {/* Category 5 */}
              <Link href="/marketplace" className="group bg-slate-50 hover:bg-primary/5 border border-slate-200/80 hover:border-primary/40 rounded-2xl p-6 text-center space-y-3 transition-all col-span-2 sm:col-span-1">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm group-hover:scale-110 flex items-center justify-center mx-auto text-purple-600 transition-transform">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-purple-600">Herramientas & Lab</div>
                <div className="text-xs text-slate-500">Equipos de Prototipado</div>
              </Link>

            </div>
          </div>
        </section>

        {/* 7. SISTEMA DE SEGURIDAD & CONFIANZA */}
        <section id="seguridad" className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <ShieldCheck className="h-4 w-4" /> Confianza Estudiantil
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Alquila con total tranquilidad y respaldo
                </h2>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  En UniRent hemos creado un protocolo de seguridad diseñado específicamente para proteger tanto al propietario como al estudiante que alquila.
                </p>

                <ul className="space-y-4 text-sm sm:text-base text-slate-200">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Bloqueo de Traslapes:</strong> El calendario solo aprueba fechas disponibles de forma transparente.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Fondo de Garantía (30%):</strong> Protección financiera automática ante imprevistos o cancelaciones.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Reputación Mutua:</strong> Al finalizar el alquiler, ambas partes se califican obligatoriamente para promover el buen uso.</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Button asChild size="lg" className="bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl px-8 h-12">
                    <Link href="/marketplace">Visitar Marketplace Ahora</Link>
                  </Button>
                </div>
              </div>

              {/* Safety Cards Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2">
                  <Lock className="h-8 w-8 text-indigo-400" />
                  <div className="font-bold text-lg text-white">Cancelaciones Transparentes</div>
                  <div className="text-xs text-slate-300">Si un propietario rechaza tu solicitud, las fechas se liberan al instante.</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2">
                  <Star className="h-8 w-8 text-amber-400" />
                  <div className="font-bold text-lg text-white">Promedio AVG de Reseñas</div>
                  <div className="text-xs text-slate-300">Visualiza la puntuación del dueño y del arrendador antes de aceptar un pedido.</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2">
                  <Zap className="h-8 w-8 text-emerald-400" />
                  <div className="font-bold text-lg text-white">Notificaciones Inmediatas</div>
                  <div className="text-xs text-slate-300">Entérate al instante de solicitudes recibidas y cambios de estado.</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div className="font-bold text-lg text-white">Comunidad Verificada</div>
                  <div className="text-xs text-slate-300">Red exclusiva para estudiantes universitarios con registro directo.</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 8. TESTIMONIOS (PRUEBA SOCIAL) */}
        <section id="testimonios" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
                Comunidad Satisfecha
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Lo que dicen los estudiantes de UniRent
              </p>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8">
              
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  "Necesitaba una calculadora financiera TI-Nspire para mi examen final de finanzas y no quería pagar S/ 600 por usarla dos días. En UniRent la alquilé por S/ 25 total. ¡Me salvó el ciclo!"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    CM
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Camila Morales</div>
                    <div className="text-xs text-slate-500">Estudiante de Economía</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  "Tenía mi cámara Canon guardada en el escritorio. En menos de un mes alquilándola en UniRent he ganado más de S/ 400 extra para mis pasajes y copias. El sistema de seguro da mucha tranquilidad."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    JS
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Javier Silva</div>
                    <div className="text-xs text-slate-500">Estudiante de Comunicaciones</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  "La interfaz es súper fácil de usar y el sistema de calificaciones me permite saber exactamente a quién le entrego mis pertenencias. Totalmente recomendado."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                    AL
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Andrea López</div>
                    <div className="text-xs text-slate-500">Estudiante de Arquitectura</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 9. CALL TO ACTION FINAL */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary via-indigo-600 to-blue-600 rounded-3xl p-10 sm:p-14 text-white text-center space-y-6 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                ¿Listo para alquilar o ganar dinero hoy?
              </h2>
              
              <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
                Únete a la plataforma P2P universitaria más confiable. Explora los artículos disponibles o publica el tuyo en menos de 2 minutos.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-extrabold h-14 px-8 rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all text-base">
                  <Link href="/marketplace" className="flex items-center justify-center gap-2">
                    <span>Entrar a UniRent Ahora</span>
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-bold h-14 px-8 rounded-2xl text-base">
                  <Link href="/register">Crear una Cuenta</Link>
                </Button>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="text-xl font-black text-white flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">U</span>
              <span>UniRent</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de alquileres P2P pensada por y para la comunidad universitaria.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Navegación</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="/publish" className="hover:text-white transition-colors">Publicar Artículo</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Legal & Seguridad</div>
            <ul className="space-y-2 text-xs">
              <li><a href="#seguridad" className="hover:text-white transition-colors">Sistema de Garantía</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Términos de Servicio</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">Políticas de Privacidad</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Comunidad</div>
            <p className="text-xs text-slate-400">
              Conectando estudiantes de diversas facultades para el uso compartido de tecnología y recursos.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} UniRent P2P Renting System. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
