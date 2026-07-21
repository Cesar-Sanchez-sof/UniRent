"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Upload, X, GripVertical, Plus, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageFile {
  id: string
  file: File
  preview: string
}

interface MultiImageUploadProps {
  images: ImageFile[]
  onChange: (images: ImageFile[]) => void
  maxImages?: number
}

async function compressImage(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 800 * 1024) return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => resolve(file);
  });
}

export function MultiImageUpload({ images, onChange, maxImages = 8 }: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItem = useRef<number | null>(null)

  const addImages = useCallback(async (files: FileList | File[]) => {
    const remaining = maxImages - images.length
    const fileArray = Array.from(files).slice(0, remaining)
    const newImages: ImageFile[] = []

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) continue
      const compressedFile = await compressImage(file)
      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file: compressedFile,
        preview: URL.createObjectURL(compressedFile),
      })
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }
  }, [images, maxImages, onChange])

  const removeImage = (id: string) => {
    const img = images.find((i) => i.id === id)
    if (img) URL.revokeObjectURL(img.preview)
    onChange(images.filter((i) => i.id !== id))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files)
    }
  }, [addImages])

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnterItem = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDropOnItem = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(null)

    if (dragItem.current === null || dragItem.current === dropIndex) return

    const reordered = [...images]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dropIndex, 0, moved)
    onChange(reordered)
    dragItem.current = null
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="flex flex-col gap-3">
      {/* Main dropzone or image grid */}
      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 py-16 cursor-pointer group",
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          )}
        >
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
            dragOver ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
          )}>
            <ImagePlus className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              Arrastra tus fotos o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG o WebP. {"M\u00e1x."} {maxImages} {"im\u00e1genes"}
            </p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Image grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnterItem(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnItem(e, index)}
                onDragEnd={() => setDragOverIndex(null)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group cursor-grab active:cursor-grabbing",
                  index === 0 ? "sm:col-span-2 sm:row-span-2" : "",
                  dragOverIndex === index ? "border-primary scale-[1.02] shadow-lg" : "border-transparent hover:border-primary/30"
                )}
              >
                <Image
                  src={img.preview}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />

                {/* Cover badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                    Portada
                  </div>
                )}

                {/* Drag handle */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-card/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 shadow-sm">
                    <GripVertical className="h-3.5 w-3.5 text-foreground" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  aria-label={`Eliminar imagen ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Image number */}
                <div className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-sm text-[10px] font-semibold text-foreground rounded-md px-1.5 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}/{images.length}
                </div>
              </div>
            ))}

            {/* Add more button */}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                  Agregar
                </span>
              </button>
            )}
          </div>

          {/* Info text */}
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Upload className="h-3 w-3" />
            {images.length} de {maxImages} {"im\u00e1genes"} {" \u00b7 Arrastra para reordenar \u00b7 La primera ser\u00e1 la portada"}
          </p>
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          if (e.target.files) addImages(e.target.files)
          e.target.value = ""
        }}
        className="hidden"
        aria-label="Seleccionar imagenes"
      />
    </div>
  )
}
