import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MapPin, User, MessageSquare, Paperclip, Loader2Icon, Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommentList from "../components/CommentList";
import CommentForm from "../components/CommentForm";
import { useTask } from "../hooks/useTask";
import type { Task } from "../types/task";
import AttachmentList from "../components/AttachmentList";
import FileUploader from "../components/FileUploader";
import { useDeleteTask } from "../hooks/use-delete-task";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";

const priorityColors: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-muted text-muted-foreground border-muted",
};

const priorityLabels: Record<string, string> = {
  High: "Alta",
  Medium: "Media",
  Low: "Baja",
};

const statusLabels: Record<string, string> = {
  "Not Started": "No Iniciada",
  "In Progress": "En Progreso",
  "Completed": "Completada",
  "Pending Input": "Pendiente",
  "Planned": "Planificada",
};

const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const showConfirm = useConfirm();
  
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const { data: taskResponse, isLoading } = useTask(Number(taskId));
  
  // ✅ useDeleteTask sin parámetros (el ID se pasa en mutateAsync)
  const deleteMutation = useDeleteTask();

  const task: Task | undefined = taskResponse?.data;

  /**
   * Show confirmation dialog and delete task if confirmed
   */
  const handleDeleteClick = () => {
    // Guard against undefined taskId
    if (!taskId) {
      toast.error("ID de tarea no válido");
      return;
    }

    showConfirm({
      title: "¿Eliminar tarea?",
      description: `Esta acción no se puede deshacer. La tarea "${task?.title}" será eliminada permanentemente.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          // ✅ CORREGIDO: Pasar taskId al llamar mutateAsync
          await deleteMutation.mutateAsync(Number(taskId));
          toast.success("Tarea eliminada correctamente");
          navigate("/dashboard/tasks");
        } catch (error) {
          console.error("Error deleting task:", error);
          // El toast ya se muestra en el hook onError, pero podemos agregar uno adicional
          toast.error("Error al eliminar la tarea");
        }
      },
      onCancel: () => {
        console.log("Delete cancelled");
      },
    });
  };

  /**
   * Navigate to edit page
   */
  const handleEditClick = () => {
    if (!taskId) return;
    navigate(`/dashboard/tasks/${taskId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Tarea no encontrada</h2>
        <Button variant="link" onClick={() => navigate("/dashboard/tasks")}>
          Volver a tareas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/tasks")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{task.title}</h1>
      </div>

      {/* Task Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              {task.description && (
                <p className="text-muted-foreground mt-2">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={priorityColors[task.priority] ?? priorityColors.Medium}
              >
                {priorityLabels[task.priority] ?? task.priority}
              </Badge>
              <Badge variant="secondary">
                {statusLabels[task.status] ?? task.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Vence: {new Date(task.dueDate).toLocaleDateString("es-PA")}
              </span>
            </div>
            {task.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{task.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Asignado a: {task.assignedUserName || "Sin asignar"}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
            >
              Editar
            </Button>
            <Button variant="outline" size="sm">
              Cambiar estado
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteMutation.isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {deleteMutation.isPending ? (
                // ✅ Usar Loader2 de lucide-react para consistencia
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2Icon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comentarios
          </CardTitle>
          {!showCommentForm && (
            <Button size="sm" onClick={() => setShowCommentForm(true)}>
              Agregar comentario
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showCommentForm && (
            <div className="pb-4 border-b">
              <CommentForm
                taskId={task.id}
                parentCommentId={replyTo}
                onSuccess={() => {
                  setShowCommentForm(false);
                  setReplyTo(null);
                }}
                onCancel={() => {
                  setShowCommentForm(false);
                  setReplyTo(null);
                }}
              />
            </div>
          )}

          <CommentList
            taskId={task.id}
            onReply={(commentId) => {
              setReplyTo(commentId);
              setShowCommentForm(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Attachments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Adjuntos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploader
            taskId={task.id}
            onSuccess={() => {
              // Opcional: mostrar notificación de éxito
            }}
            maxFiles={5}
          />
          <AttachmentList taskId={task.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetailPage;