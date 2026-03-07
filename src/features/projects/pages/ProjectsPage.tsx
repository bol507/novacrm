import { useState, useEffect, useCallback, useMemo } from "react";
import { useProjects } from "../hooks/useProjects";
import { useActiveProjects } from "../hooks/useActiveProjects";
import { usePagination } from "@/shared/hooks/use-pagination";
import { ProjectsView } from "./ProjectsView";
import { ProjectFormDialog } from "../components/ProjectFormDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type ProjectFilter = "all" | "active";

export const ProjectsPage = () => {
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>("active");

  // ✅ CORRECCIÓN: Llamar AMBOS hooks siempre (mismo orden en cada render)
  const allProjectsQuery = useProjects(page, 6, searchTerm);
  const activeProjectsQuery = useActiveProjects(page, 6, searchTerm);

  // ✅ Seleccionar la query activa según el filtro
  const activeQuery = useMemo(() => 
    filter === "active" ? activeProjectsQuery : allProjectsQuery,
    [filter, activeProjectsQuery, allProjectsQuery]
  );

  // ✅ Extraer datos de la query activa
  const { data, isLoading, error, refetch } = activeQuery;

  // ✅ Resetear página al cambiar búsqueda o filtro
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filter, setPage]);

  // ✅ Callbacks para la vista
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, [setSearchTerm]);

  const handleFilterChange = useCallback((newFilter: ProjectFilter) => {
    setFilter(newFilter);
    setPage(1);
  }, [setPage]);

  const handleCreateClick = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, [setPage]);

  const handleProjectCreated = useCallback(() => {
    refetch();
    setIsCreateDialogOpen(false);
  }, [refetch]);

  // ✅ Extraer datos con valores por defecto
  const projects = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  return (
    <ErrorBoundary>
      <ProjectsView
        projects={projects}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onCreateClick={handleCreateClick}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        filter={filter}
        projectCount={projects.length}
      />

      <ProjectFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleProjectCreated}
      />
    </ErrorBoundary>
  );
};

export default ProjectsPage;