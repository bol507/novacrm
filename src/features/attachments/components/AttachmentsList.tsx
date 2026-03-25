"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Trash2, 
  Eye, 
  Download,
  Image,
  Loader2,
  Info
} from "lucide-react"
import { useAttachments } from "../hooks/useAttachments"
import { useDeleteAttachment } from "../hooks/useDeleteAttachment"
import { toast } from "sonner"
import { ExpandableText } from "@/components/ExpandableText"

interface AttachmentsListProps {
  module: string
  recordId: number
  onFileClick?: (url: string) => void
}

export function AttachmentsList({ module, recordId, onFileClick }: AttachmentsListProps) {
  const { data: attachments, isLoading, error } = useAttachments(module, recordId)
  const deleteAttachmentMutation = useDeleteAttachment(module, recordId)

  const handleDelete = (attachmentId: number) => {
    toast.promise(
      deleteAttachmentMutation.mutateAsync(attachmentId),
      {
        loading: 'Eliminando archivo...',
        success: 'Archivo eliminado exitosamente',
        error: 'Error al eliminar archivo',
      }
    )
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivos Adjuntos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivos Adjuntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Error al cargar archivos adjuntos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Archivos Adjuntos ({attachments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments && attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay archivos adjuntos aún</p>
            <p className="text-sm mt-2">Sube planos, renders, facturas u otros documentos relacionados con este proyecto</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attachments?.map((file) => (
              <div 
                key={file.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div 
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                    onClick={() => onFileClick?.(file.viewUrl)}
                  >
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {file.mimeType.startsWith('image/') ? (
                        <img 
                          src={`https://drive.google.com/thumbnail?id=${file.googleDriveId}&sz=w1000`}
                          alt={file.name} 
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.parentElement as HTMLElement).innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <Image class="h-5 w-5" />
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        getFileIcon(file.mimeType)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('es-PA')}
                      </p>
                      {file.description && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4 mt-0.5 shrink-0" />
                          <ExpandableText
                            text={file.description}
                            maxLines={2}
                            className="text-xs"
                            expandedClassName="text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(file.viewUrl, '_blank')
                      }}
                      className="h-8 w-8"
                      title="Ver archivo"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(file.url, file.name)
                      }}
                      className="h-8 w-8"
                      title="Descargar archivo"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(file.id)
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}