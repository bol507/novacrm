import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Trash2, 
  ExternalLink, 
  Loader2 
} from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/shared/lib/axios"

interface AttachmentsSectionProps {
  module: string
  recordId: number
}

export function AttachmentsSection({ module, recordId }: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar archivos adjuntos
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/attachments/${module}/${recordId}`)
        setAttachments(response.data.data)
      } catch (error) {
        console.error('Error al cargar archivos adjuntos:', error)
        toast.error('Error al cargar archivos adjuntos')
      } finally {
        setLoading(false)
      }
    }

    fetchAttachments()
  }, [module, recordId])

  // Eliminar archivo
  const deleteAttachment = async (id: string) => {
    try {
      await apiClient.delete(`/attachments/${module}/${recordId}/${id}`)
      setAttachments(attachments.filter(att => att.id !== id))
      toast.success('Archivo eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar archivo:', error)
      toast.error('Error al eliminar archivo')
    }
  }

  if (loading) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Archivos Adjuntos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay archivos adjuntos aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    {file.mime_type.startsWith('image/') ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteAttachment(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}