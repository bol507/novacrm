import { useState, useCallback, useMemo, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { usePagination } from '@/shared/hooks/use-pagination';
import { ProjectFormDialog } from '../components/ProjectFormDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Project, ProjectViewMode } from '../types/projects';
import type { SortKey, SortOrder } from '../components/ProjectsTable/types';
import { Badge } from '@/components/ui/badge';
import { ProjectsView } from './ProjectsView';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Valid filter options for the project list view.
 * 
 * @remarks
 * - "all": Display all projects regardless of their status
 * - "active": Display only projects that are not completed or cancelled
 */
type ProjectFilter = "all" | "active";

/**
 * ProjectsPage Component
 * 
 * Container component for the projects list page.
 * 
 * This component is responsible for:
 * - Managing local state for filters, pagination, view mode, and sorting
 * - Fetching project data via the useProjects React Query hook
 * - Handling user interactions (search, filter, sort, view mode, CRUD actions)
 * - Persisting user preferences (view mode) to localStorage
 * - Composing and passing props to the presentational ProjectsView component
 * - Managing the create project dialog state
 * - Handling navigation to project details and edit pages
 * 
 * The component follows the container/presentational pattern where all
 * business logic and state management are handled here, while UI rendering
 * is delegated to the ProjectsView presentational component.
 * 
 * @component
 * @returns {JSX.Element} The rendered projects page with error boundary wrapper
 * 
 * @example
 * // Usage in router configuration
 * <Route path="/dashboard/projects" element={<ProjectsPage />} />
 * 
 * @remarks
 * - Uses React Query (useProjects) for data fetching with caching and refetching
 * - Uses custom usePagination hook for managing page and search state
 * - Persists view mode preference to localStorage for consistent UX across sessions
 * - All handler functions are memoized with useCallback to prevent unnecessary re-renders
 * - Render props (renderProjectName, renderClient) allow customization of table/grid display
 * - ErrorBoundary wraps the component to catch and display runtime errors gracefully
 * - Navigation uses React Router v6 with state passing for context preservation
 * 
 * @state
 * - isCreateDialogOpen: boolean - Controls visibility of create project dialog
 * - filter: ProjectFilter - Current filter value ("all" or "active")
 * - viewMode: ProjectViewMode - Current view mode ("cards" or "table")
 * - sortBy: SortKey - Current sort column key
 * - sortOrder: SortOrder - Current sort direction ("asc" or "desc")
 * 
 * @derived
 * - projects: Project[] - Array of projects from API response or empty array
 * - totalPages: number - Total pages from API metadata or default 1
 * - totalItems: number - Total items count from API metadata or default 0
 * 
 * @see {@link useProjects} For data fetching logic with React Query
 * @see {@link usePagination} For pagination and search state management
 * @see {@link ProjectsView} For the presentational component that renders the UI
 * @see {@link ProjectFormDialog} For the create project modal dialog
 * @see {@link ErrorBoundary} For error handling wrapper component
 */
export const ProjectsPage = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { page, setPage, searchTerm, setSearchTerm } = usePagination();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>("active");
  const [viewMode, setViewMode] = useState<ProjectViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("projectsViewMode") as ProjectViewMode) || "cards";
    }
    return "cards";
  });
  const [sortBy, setSortBy] = useState<SortKey>('last_activity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useMemo(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("projectsViewMode", viewMode);
    }
  }, [viewMode]);

  const clientId = searchParams.get('clientId');
  const clientIdNumber = clientId ? parseInt(clientId, 10) : null;

  const { data, isLoading, error, refetch } = useProjects(
    page,
    6,
    searchTerm, {
    status: filter === "active" ? "active" : undefined,
    clientId: clientIdNumber ?? undefined
  }

  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, clientId]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, [setSearchTerm, setPage]);

  const handleFilterChange = useCallback((newFilter: ProjectFilter) => {
    setFilter(newFilter);
    setPage(1);
  }, [setPage]);
  const handleViewModeChange = useCallback((mode: ProjectViewMode) => {
    setViewMode(mode);
    setPage(1);
  }, [setPage]);
  const handleSortChange = useCallback((newSortBy: SortKey, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  }, [setPage]);
  const handleCreateClick = useCallback(() => {
    navigate(`/dashboard/projects/new`);
  }, []);
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, [setPage]);
  const handleProjectCreated = useCallback(() => {
    refetch();
    setIsCreateDialogOpen(false);
  }, [refetch]);
  const handleEdit = useCallback((project: Project) => {
    navigate(`/dashboard/projects/${project.projectid}/edit`);
  }, [navigate]);
  const handleViewProject = useCallback((project: Project) => {
   

    // Navigate to project details page with optional context state
    navigate(`/dashboard/projects/${project.projectid}`, {
      state: { from: 'projects-list' }
    });
  }, [navigate]);
  const renderProjectName = useCallback((project: Project) => (
    <div className="flex items-center gap-2">
      <span className="font-medium truncate max-w-xs" title={project.projectname}>
        {project.projectname}
      </span>
      {project.hits && project.hits > 0 && (
        <Badge variant="outline" className="text-xs">
          {project.hits} 👁
        </Badge>
      )}
    </div>
  ), []);
  const renderClient = useCallback((project: Project) => (
    <span className="truncate" title={project.account_name}>
      {project.account_name || <span className="text-muted-foreground italic">Sin cliente</span>}
    </span>
  ), []);
  const projects = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;
  const totalItems = data?.meta?.total || 0;

  const handleClearClientFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('clientId');
    navigate(`?${newParams.toString()}`, { replace: true });
    setPage(1);
  };

  return (
    <ErrorBoundary>
      <ProjectsView
        // Data props: projects list and loading/error states
        projects={projects}
        isLoading={isLoading}
        error={error}

        // Search props: current term and change handler
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}

        // Action callbacks: CRUD and view operations
        onCreateClick={handleCreateClick}
        onFilterChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        onRefresh={refetch}
        onView={handleViewProject}
        onEdit={handleEdit}

        // View mode prop: controls grid vs table layout
        viewMode={viewMode}

        // Pagination props: current page and metadata
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}

        // Filter props: current filter and project count
        filter={filter}
        projectCount={projects.length}

        // Sorting props: current sort preferences and change handler
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}

        // Render props: custom display functions for table/grid cells
        renderProjectName={renderProjectName}
        renderClient={renderClient}
        clientIdNumber={clientIdNumber}
        handleClearClientFilter={handleClearClientFilter}
      />

      {/* Create project dialog modal */}
      <ProjectFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleProjectCreated}
      />
    </ErrorBoundary>
  );
};

export default ProjectsPage;