import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Building2,
  Users,
  CheckCircle,
  Pencil,
  Trash2,
  Folder,
  ListCheck,
  Clock,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectStatusBadge } from "../components/ProjectStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectDetail } from "../hooks/useProjectDetail";
import { useUpdateProject } from "../hooks/useUpdateProject";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExpandableText } from "@/components/ExpandableText";
import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/features/attachments/components/FileUploader";
import { AttachmentsList } from "@/features/attachments/components/AttachmentsList";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error, refetch } = useProjectDetail(projectId);
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const showConfirm = useConfirm();
  const [activeTab, setActiveTab] = useState("overview");

  // Calcular ITBMS (7%) si hay presupuesto
  const targetBudget = project?.targetbudget ? parseFloat(project.targetbudget) : 0;
  const itbms = targetBudget * 0.07;
  const totalWithTax = targetBudget + itbms;

  // Formateo de moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Formateo de fecha
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };

  // Calcular días restantes
  const getDaysRemaining = (endDate: string | null): number | null => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Acciones
  const handleEditProject = () => {
    navigate(`/dashboard/projects/${projectId}/edit`);
  };

  const handleDeleteProject = async () => {
    try {
      if (!projectId) return;
      await deleteProjectMutation.mutateAsync(parseInt(projectId));
      navigate('/dashboard/projects');
      toast.success('Proyecto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      toast.error('Error al eliminar el proyecto');
    }
  };

  const handleDeleteClick = () => {
    showConfirm({
      title: "¿Eliminar proyecto?",
      description: `¿Estás seguro de eliminar el proyecto "${project?.projectname}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: handleDeleteProject,
    });
  };

  const handleCompleteProject = async () => {
    if (!projectId || !project) return;

    showConfirm({
      title: "¿Marcar como completado?",
      description: `¿Estás seguro de marcar el proyecto "${project.projectname}" como completado?`,
      confirmLabel: "Completar",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        try {
          await updateProjectMutation.mutateAsync({
            projectId: parseInt(projectId),
            data: {
              projectstatus: 'Completado',
              actualenddate: new Date().toISOString().split('T')[0],
              progress: '100',
            }
          });
          toast.success('Proyecto marcado como completado');
          refetch();
        } catch (error) {
          console.error('Error al completar proyecto:', error);
          toast.error('Error al completar el proyecto');
        }
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/4 bg-muted" />
              </div>
              <div className="sm:col-span-2 flex items-center justify-end gap-4">
                <Skeleton className="h-10 w-24 bg-muted" />
                <Skeleton className="h-10 w-48 bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full bg-muted" />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-64 w-full bg-muted" />
              <Skeleton className="h-64 w-full bg-muted" />
              <Skeleton className="h-64 w-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-destructive mb-2">Error al cargar proyecto</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => navigate(-1)}>Volver a proyectos</Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Proyecto no encontrado</h2>
          <p className="text-muted-foreground mb-4">El proyecto que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate('/dashboard/projects')}>Volver a proyectos</Button>
        </div>
      </div>
    );
  }

  // Determinar si el proyecto está asignado a "Todos los usuarios" (ID=2)
  const isAssignedToAll = project.assigned_user_id === 2;
  const assignedUserName = isAssignedToAll
    ? "Todos los usuarios"
    : project.assigned_user_name || "Sin asignar";
  const avatarFallback = isAssignedToAll
    ? "T"
    : (project.assigned_user_name || '?').charAt(0).toUpperCase();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header con información clave */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Información principal */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground line-clamp-1">
                {project.projectname}
              </h1>
              <p className="text-muted-foreground text-lg">
                Proyecto #{project.project_no}
              </p>

              {/* Acciones y estado */}
              <div className="flex flex-col sm:items-end gap-4">
                <div className="flex items-center gap-3">
                  <ProjectStatusBadge status={project.projectstatus || 'En Curso'} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="gap-2"
                  >
                    ← Volver
                  </Button>
                </div>
              </div>

              {/* Información lateral */}
              <div className="space-y-4">
                {project.account_name && (
                  <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                    <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                      <p className="text-lg font-semibold">{project.account_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                  <Users className="h-6 w-6 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                    <p className="text-lg font-semibold">{assignedUserName}</p>
                  </div>
                </div>

                {project.startdate && (
                  <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                    <Calendar className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
                      <p className="text-lg font-semibold">{formatDate(project.startdate)}</p>
                    </div>
                  </div>
                )}

                {project.targetenddate && (
                  <div className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                    <Clock className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha límite</p>
                      <p className="text-lg font-semibold">{formatDate(project.targetenddate)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDaysRemaining(project.targetenddate)} días restantes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel financiero */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Presupuesto</div>
                  <div className="text-2xl font-bold">{formatCurrency(targetBudget)}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">ITBMS</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(itbms)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total con impuestos</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(totalWithTax)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Progreso</div>
                  <div className="text-2xl font-bold text-green-600">
                    {project.progress || '0'}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido con pestañas */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Información General
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Archivos Adjuntos
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Descripción general */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">Descripción general</h2>
                  <ExpandableText
                    text={project.description || 'Sin descripción'}
                    maxLines={3}
                    className="text-lg"
                    expandedClassName="text-lg whitespace-pre-line"
                  />
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ListCheck className="h-5 w-5" />
                      Tareas
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de tareas</p>
                        <p className="text-2xl font-bold">{project.totalTasks || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completadas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {project.completedTasks || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {(project.totalTasks || 0) - (project.completedTasks || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Métricas
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Prioridad</p>
                        <p className="text-lg font-semibold">
                          {project.projectpriority || 'Media'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="text-lg font-semibold">
                          {project.projecttype || 'General'}
                        </p>
                      </div>
                      {project.hits !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Hits</p>
                          <p className="text-lg font-semibold">{project.hits}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      Estado actual
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <ProjectStatusBadge status={project.projectstatus || 'En Curso'} />
                      </div>
                      {project.actualenddate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha de finalización</p>
                          <p className="text-lg font-semibold">
                            {formatDate(project.actualenddate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-6">
                {/* Subir archivos */}
                <FileUploader 
                  module="Project" 
                  recordId={parseInt(projectId || '0')}
                  maxFiles={10}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />

                {/* Listar archivos */}
                <AttachmentsList 
                  module="Project" 
                  recordId={parseInt(projectId || '0')}
                  onFileClick={(url) => window.open(url, '_blank')}
                />
              </TabsContent>

              <TabsContent value="comments" className="space-y-6">
                <CommentsSection 
                  module="Project" 
                  relatedId={parseInt(projectId || '0')} 
                />
              </TabsContent>
            </Tabs>

            {/* Acciones fijas en la parte inferior */}
            <div className="sticky bottom-6 bg-background/80 backdrop-blur-sm py-4 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-1 gap-2 py-6 text-lg"
                  onClick={handleEditProject}
                >
                  <Pencil className="h-6 w-6" />
                  Editar proyecto
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2 py-6 text-lg"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-6 w-6" />
                  Eliminar
                </Button>
                {project.projectstatus !== 'Completado' && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 py-6 text-lg"
                    onClick={handleCompleteProject}
                  >
                    <CheckCircle className="h-6 w-6" />
                    Marcar como completado
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProjectDetailPage;