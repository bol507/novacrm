import { useState } from "react";
import { 
  Loader2, 
  File, 
  FileText, 
  Image, 
  Trash2, 
  Download, 
  Eye,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTaskAttachments, useDeleteAttachment } from "../hooks/useTaskAttachments";
import type { Attachment } from "../types/task";
import { cn } from "@/shared/lib/utils";

interface AttachmentListProps {
  taskId: number;
  className?: string;
}

const AttachmentList = ({ taskId, className }: AttachmentListProps) => {
  const { data, isLoading, error } = useTaskAttachments(taskId);
  const deleteMutation = useDeleteAttachment(taskId);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);

  const attachments = data?.data || [];

  // ✅ CORREGIDO: Usar mimeType en lugar de type
  const getFileIcon = (mimeType: string | undefined) => {
    if (!mimeType) {
      return <File className="w-5 h-5 text-muted-foreground" />;
    }
    
    const lowerMime = mimeType.toLowerCase();
    
    if (lowerMime.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (lowerMime.includes("image")) return <Image className="w-5 h-5 text-green-500" />;
    if (lowerMime.includes("word") || lowerMime.includes("document")) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (lowerMime.includes("excel") || lowerMime.includes("sheet")) {
      return <FileText className="w-5 h-5 text-green-600" />;
    }
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  // ✅ CORREGIDO: Limpiar URLs y manejar vista previa para imágenes
  const handleView = (attachment: Attachment) => {
    // Limpiar espacios en blanco de la URL
    const viewUrl = attachment.viewUrl?.trim() || attachment.url?.trim();
    if (viewUrl) {
      window.open(viewUrl, "_blank");
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const downloadUrl = attachment.url?.trim();
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  // ✅ NUEVO: Obtener URL de miniatura para imágenes de Google Drive
  const getThumbnailUrl = (attachment: Attachment): string | null => {
    if (!attachment.mimeType?.includes("image")) {
      return null;
    }
    
    // Si tenemos googleDriveId, generar URL de thumbnail
    if (attachment.googleDriveId) {
      return `https://drive.google.com/thumbnail?id=${attachment.googleDriveId}&sz=w200`;
    }
    
    // Fallback: usar viewUrl si existe
    if (attachment.viewUrl) {
      return attachment.viewUrl.trim().replace("/view?", "/thumbnail?");
    }
    
    return null;
  };

  const handleDeleteClick = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
  };

  const handleDeleteConfirm = async () => {
    if (!attachmentToDelete) return;

    try {
      await deleteMutation.mutateAsync(attachmentToDelete.id);
      setAttachmentToDelete(null);
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive py-4">
        <AlertCircle className="w-4 h-4" />
        <span>Error al cargar los adjuntos</span>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay archivos adjuntos</p>
        <p className="text-xs mt-1">Sube un archivo para adjuntarlo a esta tarea</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {attachments.map((attachment) => {
        const thumbnailUrl = getThumbnailUrl(attachment);
        const isImage = attachment.mimeType?.includes("image");

        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* ✅ Thumbnail para imágenes o icono para otros archivos */}
            <div className="shrink-0">
              {isImage && thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={attachment.name}
                  className="w-10 h-10 object-cover rounded border"
                  onError={(e) => {
                    // Fallback a icono si falla la carga de miniatura
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.querySelector(".fallback-icon")?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={cn("fallback-icon", isImage && thumbnailUrl ? "hidden" : "")}>
                {getFileIcon(attachment.mimeType)}
              </div>
            </div>
            
            {/* File info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" title={attachment.name}>
                {attachment.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(attachment.size)}</span>
                <span>•</span>
                <span>{formatDate(attachment.createdAt)}</span>
                {attachment.description && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[150px]" title={attachment.description}>
                      {attachment.description}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* View button - solo para imágenes o si hay viewUrl */}
              {(isImage || attachment.viewUrl) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleView(attachment)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Vista previa"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              
              {/* Download button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(attachment)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Descargar"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(attachment)}
                disabled={deleteMutation.isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                title="Eliminar"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        );
      })}

      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={!!attachmentToDelete} 
        onOpenChange={() => setAttachmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo{" "}
              <span className="font-medium">{attachmentToDelete?.name}</span>{" "}
              será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AttachmentList;