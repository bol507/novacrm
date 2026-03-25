import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, Folder, ListFilter, LayoutGrid, List, X } from "lucide-react";
import type { Project, ProjectViewMode } from "../types/projects";
import { ProjectsStats } from "../components/ProjectsStats";
import { ProjectsGrid } from "../components/ProjectsGrid";
import type { SortKey, SortOrder } from "../components/ProjectsTable/types";
import ProjectsTable from "../components/ProjectsTable";
import ListFooter from "@/components/ListFooter";

/**
 * Valid filter options for project list view.
 *
 * @remarks
 * - "all": Display all projects regardless of status
 * - "active": Display only projects that are not completed or cancelled
 */
export type ProjectFilter = "all" | "active";

/**
 * Props for the ProjectsView presentational component.
 *
 * This component is purely presentational and receives all data and callbacks
 * from its parent container. It handles rendering of the projects list UI
 * including header, search, statistics, project grid/table, and pagination.
 */
export interface ProjectsViewProps {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onFilterChange: (filter: ProjectFilter) => void;
  onViewModeChange: (mode: ProjectViewMode) => void;
  onRefresh: () => void;
  onEdit?: (project: Project) => void;
  onView?: (project: Project) => void;
  viewMode: ProjectViewMode;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  filter: ProjectFilter;
  projectCount: number;
  sortBy?: SortKey;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy: SortKey, sortOrder: SortOrder) => void;
  renderProjectName?: (project: Project) => React.ReactNode;
  renderClient?: (project: Project) => React.ReactNode;
  renderActions?: (project: Project) => React.ReactNode;
  clientIdNumber?: number | null;
  handleClearClientFilter?: () => void;
}

/**
 * Renders the projects list page with header controls, search input,
 * statistics cards, project list (grid or table view), and pagination.
 *
 * This component is purely presentational and contains no internal state
 * or side effects. All business logic, data fetching, and state management
 * are handled by the parent container component. It receives data and
 * callbacks via props and focuses solely on UI rendering.
 *
 * @param props - Component props containing data and callbacks
 * @param props.projects - Array of project objects to display
 * @param props.isLoading - Whether projects are currently being fetched
 * @param props.error - Error object if project fetching failed, null otherwise
 * @param props.searchTerm - Current search input value for filtering
 * @param props.onSearchChange - Callback invoked when search input changes
 * @param props.onCreateClick - Callback invoked when create project button is clicked
 * @param props.onFilterChange - Callback invoked when active/all filter toggles
 * @param props.onViewModeChange - Callback invoked when cards/table view mode toggles
 * @param props.onRefresh - Callback invoked to refresh the projects list
 * @param props.onEdit - Optional callback invoked when editing a project
 * @param props.onView - Optional callback invoked when viewing a project
 * @param props.viewMode - Current display mode: "cards" or "table"
 * @param props.page - Current pagination page number (1-indexed)
 * @param props.totalPages - Total number of pages available
 * @param props.totalItems - Total number of items across all pages
 * @param props.onPageChange - Callback invoked when pagination page changes
 * @param props.filter - Current filter state: "active" or "all"
 * @param props.projectCount - Number of projects matching the current filter
 * @param props.sortBy - Optional sort field key for table view
 * @param props.sortOrder - Optional sort direction: "asc" or "desc"
 * @param props.onSortChange - Optional callback invoked when table sorting changes
 * @param props.renderProjectName - Optional custom renderer for project name column
 * @param props.renderClient - Optional custom renderer for client column
 * @param props.renderActions - Optional custom renderer for actions column
 * @param props.clientIdNumber - Optional client ID filter currently applied
 * @param props.handleClearClientFilter - Optional callback to clear client ID filter
 * @returns The rendered projects list view
 *
 * @example
 * // Basic usage with required props
 * <ProjectsView
 *   projects={projects}
 *   isLoading={false}
 *   error={null}
 *   searchTerm=""
 *   onSearchChange={setSearchTerm}
 *   onCreateClick={handleCreateClick}
 *   onFilterChange={handleFilterChange}
 *   onViewModeChange={handleViewModeChange}
 *   onRefresh={refetchProjects}
 *   viewMode="cards"
 *   page={1}
 *   totalPages={5}
 *   totalItems={42}
 *   onPageChange={handlePageChange}
 *   filter="active"
 *   projectCount={15}
 * />
 *
 * @example
 * // Usage with optional render props for customization
 * <ProjectsView
 *   projects={projects}
 *   isLoading={false}
 *   error={null}
 *   searchTerm=""
 *   onSearchChange={setSearchTerm}
 *   onCreateClick={handleCreateClick}
 *   onFilterChange={handleFilterChange}
 *   onViewModeChange={handleViewModeChange}
 *   onRefresh={refetchProjects}
 *   viewMode="table"
 *   page={1}
 *   totalPages={5}
 *   totalItems={42}
 *   onPageChange={handlePageChange}
 *   filter="all"
 *   projectCount={42}
 *   sortBy="projectname"
 *   sortOrder="asc"
 *   onSortChange={handleSortChange}
 *   renderProjectName={(project) => (
 *     <span className="font-bold">{project.projectname}</span>
 *   )}
 *   renderClient={(project) => (
 *     <Badge>{project.account_name}</Badge>
 *   )}
 * />
 *
 * @remarks
 * - Pure presentational component: contains no internal state or side effects
 * - Error state displays a retry button that calls the onRefresh callback
 * - Search input changes are debounced by the parent component for performance
 * - Filter toggle switches between "all" and "active" project views
 * - View mode toggle switches between card grid and table layouts
 * - Statistics component receives the full projects array for accurate calculations
 * - Grid component handles responsive layout with 1-3 columns based on screen size
 * - Table component provides sortable columns and responsive mobile card view
 * - Pagination component is disabled during loading to prevent race conditions
 * - All interactive elements use stopPropagation to prevent event bubbling conflicts
 * - Supports render props for customizing project name, client, and action displays
 * - When clientIdNumber is present, displays a badge and clear button for active client filter
 *
 * @see {@link ProjectsStats} for statistics display component
 * @see {@link ProjectsGrid} for card-based project grid component
 * @see {@link ProjectsTable} for table-based project list component
 * @see {@link ListFooter} for pagination controls component
 */
export const ProjectsView = ({
  // Data props
  projects,
  isLoading,
  error,

  // Search props
  searchTerm,
  onSearchChange,

  // Action callbacks
  onCreateClick,
  onFilterChange,
  onViewModeChange,
  viewMode,
  onRefresh,
  onView,
  onEdit,

  // Pagination props
  page,
  totalPages,
  totalItems,
  onPageChange,

  // Filter props
  filter,
  projectCount,

  // Sorting props
  sortBy = 'last_activity',
  sortOrder = 'desc',

  // Render props for customization
  renderProjectName,
  renderClient,
  renderActions,

  clientIdNumber,
  handleClearClientFilter
}: ProjectsViewProps) => {


  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading projects: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with title, filter toggle, view mode toggle, refresh, and create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title and description section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Badge
              variant="secondary"
              className={filter === "active" ? "bg-blue-100 text-blue-800" : "bg-muted"}
            >
              {projectCount}
            </Badge>
            {filter === "active" ? "Active Projects" : "All Projects"}
          </h1>
          <p className="text-muted-foreground">
            {filter === "active"
              ? "Projects in progress and pending completion"
              : "View and manage all projects"}
          </p>
          {clientIdNumber && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-sm font-normal">
                Cliente ID: {clientIdNumber}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearClientFilter}
                className="h-6 px-2 text-xs hover:bg-muted"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtro
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons section: refresh, filter toggle, view mode toggle, create */}
        <div className="flex items-center gap-3">
          {/* Refresh button with loading spinner */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          {/* Filter toggle buttons: Active / All */}
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button
              variant={filter === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("active")}
              className="rounded-none border-r border-border"
            >
              <Folder className="h-4 w-4 mr-1" />
              Active
            </Button>
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("all")}
              className="rounded-none"
            >
              <ListFilter className="h-4 w-4 mr-1" />
              All
            </Button>
          </div>

          {/* View mode toggle buttons: Cards / Table */}
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("cards")}
              className="rounded-none border-r border-border"
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("table")}
              className="rounded-none"
              title="Table view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create new project button */}
          <Button className="gap-2" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Search input section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name or number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search projects"
          />
        </div>
      </div>

      {/* Statistics cards section displaying project metrics */}
      <ProjectsStats projects={projects} totalItems={totalItems} />

      {/* Project list section - renders grid or table based on viewMode */}
      {viewMode === "cards" ? (
        <ProjectsGrid projects={projects} />
      ) : (
        <ProjectsTable
          // Data props
          projects={projects}
          isLoading={isLoading}

          // Sorting props (controlled by parent)
          sortBy={sortBy}
          sortOrder={sortOrder}

          // Search props (controlled by parent)
          searchValue={searchTerm}
          onSearchChange={onSearchChange}

          // Action callbacks
          onRefresh={onRefresh}
          onView={onView}
          onEdit={onEdit}

          // Render props for UI customization
          renderProjectName={renderProjectName}
          renderClient={renderClient}
          renderActions={renderActions}

          // UI configuration props
          showProgress={true}
          showBudget={true}
          compact={false}
        />
      )}

      {/* Pagination controls section */}
      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={projects.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="projectos"
        className="mt-6"
      />
    </div>
  );
};