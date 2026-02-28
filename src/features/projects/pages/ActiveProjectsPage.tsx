import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, Folder } from "lucide-react";
import { usePagination } from "@/shared/hooks/use-pagination";
import { useConfirm } from "@/components/confirm-dialog";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Project } from "../types/projects";
import { useActiveProjects } from "../hooks/useActiveProjects";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Link } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard"; 

const ActiveProjectsPage = () => {
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data, isLoading, error, refetch } = useActiveProjects(page, 6, searchTerm);
  const deleteProjectMutation = useDeleteProject();
  const showConfirm = useConfirm();

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const activeProjects: Project[] = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = activeProjects.length;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error al cargar proyectos: {error.message}</p>
        </div>
      </div>
    );
  }

  const handleDeleteProject = async (projectId: number) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      refetch();
    } catch (error: any) {
      console.error('Error al eliminar proyecto:', error);
    }
  };

  const handleDeleteClick = (project: Project) => {
    showConfirm({
      title: "¿Eliminar proyecto?",
      description: `¿Estás seguro de eliminar el proyecto "${project.projectname}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: () => handleDeleteProject(project.projectid)
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-muted" />
            <Skeleton className="h-4 w-64 bg-muted" />
          </div>
          <Skeleton className="h-10 w-48 bg-muted" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="space-y-2 pb-2">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-12 bg-muted" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full bg-muted" />
                  <Skeleton className="h-2 w-4/5 bg-muted" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Skeleton className="h-4 w-1/3 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-20 bg-muted" />
                </div>
                <Skeleton className="h-5 w-24 bg-muted" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeProjects.length}
              </Badge>
              Proyectos Activos
            </h1>
            <p className="text-muted-foreground">
              Proyectos en curso y pendientes de finalizar
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              className="gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Search y Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, cliente o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(1)}>
              Todos
            </Button>
            <Button variant="default" size="sm" disabled>
              Activos
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">En Curso</span>
              <div className="text-2xl font-bold text-blue-600">
                {activeProjects.filter(p => p.projectstatus === 'In Progress' || p.projectstatus === 'En Curso').length}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">Pausados</span>
              <div className="text-2xl font-bold text-yellow-600">
                {activeProjects.filter(p => p.projectstatus === 'On Hold' || p.projectstatus === 'Pausado').length}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">Próximos a vencer</span>
              <div className="text-2xl font-bold text-orange-600">
                {activeProjects.filter(p => {
                  if (!p.targetenddate) return false;
                  const endDate = new Date(p.targetenddate);
                  const today = new Date();
                  const diffTime = endDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7 && diffDays > 0;
                }).length}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">Presupuesto Total</span>
              <div className="text-2xl font-bold">
                ${activeProjects.reduce((sum, p) =>
                  sum + (p.targetbudget ? parseInt(p.targetbudget) : 0), 0
                ).toLocaleString('es-PA')}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Projects Grid */}
        {activeProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay proyectos activos</h3>
              <p className="text-muted-foreground mb-4">
                Todos los proyectos están completados o no hay proyectos creados aún.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer proyecto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((project) => (
              <Link 
                to={`/dashboard/projects/${project.projectid}`} 
                key={project.projectid}
                className="block"
              >
                <ProjectCard 
                  project={project} 
                  onDelete={() => handleDeleteClick(project)}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {!isLoading && (
            <div className="text-sm text-muted-foreground">
              Mostrando {activeProjects.length} de {totalItems} proyectos activos
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Anterior
              </Button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ActiveProjectsPage;