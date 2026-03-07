"use client"

import { useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileUp, 
  X, 
  Loader2, 
  Image,
  FileText,
  Trash2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { toast } from "sonner"
import { useUploadAttachment } from "../hooks/useTaskAttachments"

interface FileUploaderProps {
  taskId: number
  onUploadSuccess?: () => void
   onSuccess?: () => void  
  maxFiles?: number
  accept?: string
  className?: string
}

export default function FileUploader({
  taskId,
  onUploadSuccess,
  onSuccess,
  maxFiles = 5,
  accept = "image/jpeg,image/jpg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain",
  className
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [description, setDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadAttachment(taskId)

  // Constants for validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
     
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
    setError(null)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }, [])

  const handleFiles = (selectedFiles: File[]) => {
    setError(null)

    // Validate max files
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`)
      toast.error(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    // Validate file size
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      setError('Los archivos no pueden superar los 10MB cada uno')
      toast.error('Los archivos no pueden superar los 10MB cada uno')
      return
    }

    // Validate file extension
    const invalidFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      return !extension || !ALLOWED_EXTENSIONS.includes(extension)
    })

    if (invalidFiles.length > 0) {
      const message = `Archivos no permitidos: ${invalidFiles.map(f => f.name).join(', ')}. Extensiones permitidas: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
      setError(message)
      toast.error(message)
      return
    }

    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setError(null)
  }
   const handleSuccess = onUploadSuccess || onSuccess;
  const uploadFiles = async () => {
    if (files.length === 0) return

    try {
      setError(null)
      
      // Upload each file with the same description
      for (const file of files) {
        await uploadMutation.mutateAsync({ 
          file, 
          description: description.trim() || undefined 
        })
      }
      
      // Reset form on success
      setFiles([])
      setDescription("")
      toast.success('Archivos subidos correctamente')
      handleSuccess?.()
      
    } catch (error: any) {
      console.error('Error uploading files:', error)
      const message = error.response?.data?.error || 'Error al subir archivos. Verifica el tipo y tamaño del archivo.'
      setError(message)
      toast.error(message)
    }
  }

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="h-6 w-6 text-green-500" />
    }
    if (extension === 'pdf') {
      return <FileText className="h-6 w-6 text-red-500" />
    }
    if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="h-6 w-6 text-blue-500" />
    }
    if (['xls', 'xlsx'].includes(extension || '')) {
      return <FileText className="h-6 w-6 text-green-600" />
    }
    return <FileText className="h-6 w-6 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isUploading = uploadMutation.isPending

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          dragActive 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
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
          {ALLOWED_EXTENSIONS.map(ext => ext.toUpperCase()).join(', ')} hasta 10MB • Máximo {maxFiles} archivos
        </p>
      </div>

      {/* Description field */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="file-description">Descripción (opcional)</Label>
          <Textarea
            id="file-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Documento de referencia, imagen de evidencia, plano actualizado..."
            className="min-h-[80px] resize-none"
            maxLength={500}
            disabled={isUploading}
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
              key={`${file.name}-${index}`} 
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="h-8 w-8 shrink-0"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Actions */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={uploadFiles} 
            disabled={isUploading || files.length === 0}
            className="flex-1"
          >
            {isUploading ? (
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
              setError(null)
            }}
            disabled={isUploading}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}