import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { Button } from "@/components/ui/button";
import { ProjectProgress } from "./ProjectProgress";
import { useConfirm } from "@/components/confirm-dialog";
import type { Project } from "../types/projects";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { MoreVertical } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const deleteProjectMutation = useDeleteProject();
  const showConfirm = useConfirm();

  // ✅ Determinar si el proyecto está asignado a "Todos los usuarios" (ID=2)
  const isAssignedToAll = project.assigned_user_id === 2;

  // ✅ Determinar el nombre del responsable
  const assignedUserName = isAssignedToAll
    ? "Todos los usuarios"
    : project.assigned_user_name || "Sin asignar";

  // ✅ Determinar el avatar fallback
  const avatarFallback = isAssignedToAll
    ? "T"
    : (project.assigned_user_name || '?').charAt(0).toUpperCase();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ Prevenir navegación al hacer clic en eliminar
    showConfirm({
      title: "¿Eliminar proyecto?",
      description: `¿Estás seguro de eliminar el proyecto "${project.projectname}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await deleteProjectMutation.mutateAsync(project.projectid);
        } catch (error: any) {
          console.error('Error al eliminar proyecto:', error);
        }
      }
    });
  };

  return (
    <Card className="flex flex-col h-full border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {project.projectname}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <ProjectStatusBadge status={project.projectstatus || 'En Curso'} />
            {project.projectpriority && (
              <Badge variant="outline" className="text-xs">
                {project.projectpriority}
              </Badge>
            )}
            {project.targetenddate && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Vence: {new Date(project.targetenddate).toLocaleDateString('es-PA')}
              </Badge>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDeleteClick}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-4">
          <ProjectProgress
            progress={project.progress || '0'}
            totalTasks={project.totalTasks || 0}
            completedTasks={project.completedTasks || 0}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tareas</p>
              <p className="font-medium">
                {project.completedTasks || 0} / {project.totalTasks || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hits</p>
              <p className="font-medium">{project.hits || 0} hits</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-medium line-clamp-1">{project.account_name || 'Sin cliente'}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Fecha de inicio</p>
            <p className="font-medium">
              {project.startdate
                ? new Date(project.startdate).toLocaleDateString('es-PA')
                : '-'
              }
            </p>
          </div>

          {project.targetenddate && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Fecha límite</p>
              <p className="font-medium text-orange-600">
                {new Date(project.targetenddate).toLocaleDateString('es-PA')}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {avatarFallback}
          </div>
          <span className="text-sm line-clamp-1">{assignedUserName}</span>
        </div>
        <div className="font-bold text-lg">
          ${project.targetbudget
            ? parseInt(project.targetbudget).toLocaleString('es-PA')
            : '0'}
        </div>
      </CardFooter>
    </Card>
  );
};