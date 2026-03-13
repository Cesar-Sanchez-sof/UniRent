"use client"

import { NexusHeader } from "@/components/nexus-header"
import { NexusFooter } from "@/components/nexus-footer"
import { PublishForm } from "@/components/publish-form"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <NexusHeader />
      
      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
        <div className="flex flex-col gap-8">
          {/* Header de la página */}
          <div className="flex flex-col gap-4">
            <Button variant="ghost" className="w-fit -ml-4 gap-2 text-muted-foreground hover:text-foreground" asChild>
              <a href="/">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </a>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Publicar un artículo</h1>
                <p className="text-muted-foreground">Llena los detalles para poner tu artículo en alquiler.</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-card rounded-3xl border border-border p-6 lg:p-10 shadow-sm">
            <PublishForm />
          </div>
        </div>
      </main>

      <NexusFooter />
    </div>
  )
}
