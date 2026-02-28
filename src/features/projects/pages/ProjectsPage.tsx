import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { usePagination } from "@/shared/hooks/use-pagination";
import { ProjectStatusBadge } from "../components/ProjectStatusBadge";
import { ProjectProgress } from "../components/ProjectProgress";
import type { Project } from "../types/projects";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Link } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard"; // ✅ Importar componente corregido

const ProjectsPage = () => {
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data, isLoading, error, refetch } = useProjects(page, 6, searchTerm);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const projects: Project[] = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error al cargar proyectos: {error.message}</p>
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
            <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
            <p className="text-muted-foreground">
              Visualiza y gestiona todos los proyectos
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o número de proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">En Curso</span>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.projectstatus === 'In Progress').length}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">Completados</span>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.projectstatus === 'Completed').length}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">Presupuesto Total</span>
              <div className="text-2xl font-bold">
                ${projects.reduce((sum, p) => sum + (parseInt(p.targetbudget || '0')), 0).toLocaleString('es-PA')}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-muted-foreground">Progreso Promedio</span>
              <div className="text-2xl font-bold">
                {Math.round(projects.reduce((sum, p) => sum + parseInt(p.progress || '0'), 0) / (projects.length || 1))}%
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Projects Grid - ✅ GRID EN EL CONTENEDOR PADRE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              to={`/dashboard/projects/${project.projectid}`} 
              key={project.projectid}
              className="block" // ✅ Hacer que el Link sea block para toda la tarjeta
            >
              <ProjectCard 
                project={project} 
                onDelete={() => {}} // ✅ El onDelete ya está manejado dentro del componente
              />
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {!isLoading && (
            <div className="text-sm text-muted-foreground">
              Mostrando {projects.length} de {totalItems} proyectos
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

export default ProjectsPage;