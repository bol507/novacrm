"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Loader2,
  Trash2,
  Link,
  ExternalLink
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { toast } from "sonner"

interface ImageUploaderProps {
  module: string
  recordId: number
  onUploadSuccess?: (file: any) => void
  maxFiles?: number
  accept?: string
}

export function ImageUploader({
  module,
  recordId,
  onUploadSuccess,
  maxFiles = 5,
  accept = "image/*,.pdf"
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    // Validar tamaño (10MB máximo)
    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Los archivos no pueden superar los 10MB')
      return
    }

    setFiles(prev => [...prev, ...selectedFiles])
    
    // Generar previews
    selectedFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })
  }, [files, maxFiles])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('file', file)
      })

      const response = await fetch(`/api/attachments/${module}/${recordId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) throw new Error('Error al subir archivos')

      const result = await response.json()
      
      toast.success(`${files.length} archivo(s) subido(s) exitosamente`)
      setFiles([])
      setPreviewUrls([])
      onUploadSuccess?.(result)
    } catch (error: any) {
      toast.error(error.message || 'Error al subir archivos')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
          "transition-colors hover:border-primary/50",
          files.length > 0 && "border-primary bg-primary/5"
        )}
        onClick={() => document.getElementById(`file-input-${module}-${recordId}`)?.click()}
      >
        <input
          id={`file-input-${module}-${recordId}`}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileChange}
        />
        
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">
          {files.length === 0 
            ? `Arrastra y suelta archivos aquí o haz clic para buscar`
            : `${files.length} archivo(s) seleccionado(s)`}
        </p>
        
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF, PDF hasta 10MB • Máximo {maxFiles} archivos
        </p>
      </div>

      {/* Previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 
                          opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Acciones */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={uploadFiles} 
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir {files.length} archivo(s)
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setFiles([])
              previewUrls.forEach(url => URL.revokeObjectURL(url))
              setPreviewUrls([])
            }}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}