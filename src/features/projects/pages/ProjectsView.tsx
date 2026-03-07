import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, Folder, ListFilter, Loader2 } from "lucide-react";
import type { Project } from "../types/projects";
import { ProjectsStats } from "../components/ProjectsStats";
import { ProjectsGrid } from "../components/ProjectsGrid";
import { ProjectsPagination } from "../components/ProjectsPagination";

interface ProjectsViewProps {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onFilterChange: (filter: "all" | "active") => void; // ✅ Nuevo prop
  onRefresh: () => void; // ✅ Nuevo prop
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  filter: "all" | "active"; // ✅ Nuevo prop
  projectCount: number; // ✅ Nuevo prop
}

export const ProjectsView = ({
  projects,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onFilterChange,
  onRefresh,
  page,
  totalPages,
  totalItems,
  onPageChange,
  filter,
  projectCount,
}: ProjectsViewProps) => {
  // ✅ Estado de error manejado visualmente
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error al cargar proyectos: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Header con contador, refresh, filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={filter === "active" ? "bg-blue-100 text-blue-800" : "bg-muted"}
            >
              {projectCount}
            </Badge>
            {filter === "active" ? "Proyectos Activos" : "Todos los Proyectos"}
          </h1>
          <p className="text-muted-foreground">
            {filter === "active" 
              ? "Proyectos en curso y pendientes de finalizar" 
              : "Visualiza y gestiona todos los proyectos"}
          </p>
        </div>
        <div className="flex gap-3">
          {/* ✅ Botón de refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Actualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          
          {/* ✅ Toggle de filtros */}
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button
              variant={filter === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("active")}
              className="rounded-none border-r border-border"
            >
              <Folder className="h-4 w-4 mr-1" />
              Activos
            </Button>
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("all")}
              className="rounded-none"
            >
              <ListFilter className="h-4 w-4 mr-1" />
              Todos
            </Button>
          </div>
          
          {/* ✅ Botón de crear proyecto */}
          <Button className="gap-2" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o número de proyecto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <ProjectsStats projects={projects} />

      {/* Projects Grid */}
      <ProjectsGrid projects={projects} />

      {/* Pagination */}
      <ProjectsPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
        isLoading={isLoading}
        filter={filter}
      />
    </div>
  );
};