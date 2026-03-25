"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileUp, 
  X, 
  Loader2, 
  Image,
  FileText,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { toast } from "sonner"
import { useUploadAttachment } from "../hooks/useUploadAttachment"

interface FileUploaderProps {
  module: string
  recordId: number
  onUploadSuccess?: () => void
  maxFiles?: number
  accept?: string
}

export function FileUploader({
  module,
  recordId,
  onUploadSuccess,
  maxFiles = 5,
  accept = "image/jpeg,image/jpg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [description, setDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadAttachment(module, recordId)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }, [])

  const handleFiles = (selectedFiles: File[]) => {
    // Validar cantidad máxima
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    // Validar tamaño (10MB máximo por archivo)
    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Los archivos no pueden superar los 10MB cada uno')
      return
    }

    // Validar extensión
    const invalidFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
      return !extension || !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Archivos no permitidos: ${invalidFiles.map(f => f.name).join(', ')}. Extensiones permitidas: JPG, PNG, GIF, PDF, DOC, XLS`);
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    try {
      // ✅ Subir cada archivo con su descripción
      for (const file of files) {
        await uploadMutation.mutateAsync({ 
          file, 
          description: description.trim() || undefined 
        })
      }
      
      setFiles([])
      setDescription("")
      onUploadSuccess?.()
    } catch (error: any) {
      console.error('Error al subir archivos:', error)
      toast.error(error.response?.data?.error || 'Error al subir archivo. Verifica el tipo y tamaño del archivo.')
    }
  }

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <Image className="h-6 w-6" />
    if (extension === 'pdf') return <FileText className="h-6 w-6 text-red-500" />
    if (['doc', 'docx'].includes(extension || '')) return <FileText className="h-6 w-6 text-blue-500" />
    if (['xls', 'xlsx'].includes(extension || '')) return <FileText className="h-6 w-6 text-green-500" />
    return <FileText className="h-6 w-6" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          dragActive 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileChange}
        />
        
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileUp className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <p className="text-sm font-medium mb-2">
          {dragActive 
            ? "Suelta los archivos aquí" 
            : "Arrastra y suelta archivos aquí"}
        </p>
        
        <p className="text-xs text-muted-foreground mb-2">
          o haz clic para buscar archivos
        </p>
        
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG, GIF, PDF, DOC, XLS hasta 10MB • Máximo {maxFiles} archivos
        </p>
      </div>

      {/* Campo de descripción */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="file-description">Descripción (opcional)</Label>
          <Textarea
            id="file-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Plano de planta baja, factura de materiales, render 3D..."
            className="min-h-20"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/500 caracteres
          </p>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={uploadFiles} 
            disabled={uploadMutation.isPending}
            className="flex-1"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-2" />
                Subir {files.length} archivo{files.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setFiles([])
              setDescription("")
            }}
            disabled={uploadMutation.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}