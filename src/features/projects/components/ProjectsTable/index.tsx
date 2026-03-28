import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ProjectsTableProps } from './types';
import { ProjectsTableSkeleton } from './ProjectsTableSkeleton';
import { ProjectsTableCard } from './ProjectsTableCard';
import { ProjectsTableHeader } from './ProjectsTableHeader';
import { ProjectsTableRow } from './ProjectsTableRow';

export const ProjectsTable = ({
  // Datos
  projects,
  isLoading,
  
  // Ordenamiento
  sortBy = 'last_activity',
  sortOrder = 'desc',
  onSortChange,
  
  // Búsqueda
  searchValue = '',
  onSearchChange,
  
  // Acciones
  onView,
  onEdit,
  onDelete,
  

  renderProjectName,
  renderClient,
  renderActions,
  
  // Configuración
  showProgress = true,
  showBudget = true,
  compact = false,
  className = '',
}: ProjectsTableProps) => {
  
  // ✅ Filtrado (solo UI, sin ordenamiento)
  const filteredProjects = useMemo(() => {
    if (!searchValue) return projects;
    const search = searchValue.toLowerCase();
    return projects.filter(project => 
      project.projectname?.toLowerCase().includes(search) ||
      project.account_name?.toLowerCase().includes(search) ||
      project.project_no?.toLowerCase().includes(search)
    );
  }, [projects, searchValue]);



  // ✅ Loading state
  if (isLoading) {
    return <ProjectsTableSkeleton compact={compact} className={className} />;
  }

  

  return (
    <div className={className}>
      {/* Barra de búsqueda */}
      {onSearchChange && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por nombre, cliente o número..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label="Filtrar proyectos"
            />
          </div>
          {searchValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
            >
              Limpiar
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {filteredProjects.length} de {projects.length} proyectos
          </span>
        </div>
      )}

      {/* ✅ Vista móvil: Tarjetas */}
      <div className="space-y-3 sm:hidden">
        {filteredProjects.map((project) => (
          <ProjectsTableCard
            key={project.projectid}
            project={project}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            renderProjectName={renderProjectName}
            renderClient={renderClient}
            renderActions={renderActions}
            showProgress={showProgress}
            showBudget={showBudget}
            compact={compact}
          />
        ))}
      </div>

      {/* ✅ Vista desktop: Tabla */}
      <div className="hidden sm:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <ProjectsTableHeader
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              showProgress={showProgress}
              showBudget={showBudget}
            />
            <tbody>
              {filteredProjects.map((project) => (
                <ProjectsTableRow
                  key={project.projectid}
                  project={project}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  renderProjectName={renderProjectName}
                  renderClient={renderClient}
                  renderActions={renderActions}
                  showProgress={showProgress}
                  showBudget={showBudget}
                  compact={compact}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;