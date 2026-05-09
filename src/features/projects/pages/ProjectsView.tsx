import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RefreshCw, Folder, ListFilter, LayoutGrid, List, X, Settings, Check } from "lucide-react";
import type { Project, ProjectViewMode } from "../types/projects";
import { ProjectsStats } from "../components/ProjectsStats";
import { ProjectsGrid } from "../components/ProjectsGrid";
import type { SortKey, SortOrder } from "../components/ProjectsTable/types";
import ProjectsTable from "../components/ProjectsTable";
import ListFooter from "@/components/ListFooter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type ProjectFilter = "all" | "active";

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
 * are handled by the parent container component.
 *
 * @param props - Component props containing data and callbacks
 * @returns The rendered projects list view
 */
export const ProjectsView = ({
  projects,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onFilterChange,
  onViewModeChange,
  viewMode,
  onRefresh,
  onView,
  onEdit,
  page,
  totalPages,
  totalItems,
  onPageChange,
  filter,
  projectCount,
  sortBy = 'last_activity',
  sortOrder = 'desc',
  renderProjectName,
  renderClient,
  renderActions,
  clientIdNumber,
  handleClearClientFilter
}: ProjectsViewProps) => {

  if (error) {
    return (
      <div className="p-4">
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
    <div className="space-y-4 sm:space-y-6">

      <div className="flex flex-col gap-4">

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={filter === "active" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" : "bg-muted"}
            >
              {projectCount}
            </Badge>
            <span className="truncate">
              {filter === "active" ? "Active Projects" : "All Projects"}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {filter === "active"
              ? "Projects in progress and pending completion"
              : "View and manage all projects"}
          </p>
          {clientIdNumber && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs font-normal">
                Client ID: {clientIdNumber}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearClientFilter}
                className="h-6 px-2 text-xs hover:bg-muted"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 text-sm"
              aria-label="Search projects"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto md:ml-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 w-9"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <div className="flex rounded-md border border-border overflow-hidden">
              <Button
                variant={filter === "active" ? "default" : "ghost"}
                size="sm"
                onClick={() => onFilterChange("active")}
                className="rounded-none border-r border-border h-9 px-3"
              >
                <Folder className="h-4 w-4 mr-1" />
                Active
              </Button>
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => onFilterChange("all")}
                className="rounded-none h-9 px-3"
              >
                <ListFilter className="h-4 w-4 mr-1" />
                All
              </Button>
            </div>

            <div className="flex rounded-md border border-border overflow-hidden">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("cards")}
                className="rounded-none border-r border-border h-9 w-9"
                title="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("table")}
                className="rounded-none h-9 w-9"
                title="Table view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button size="sm" onClick={onCreateClick} className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">New Project</span>
              <span className="lg:hidden">New</span>
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="h-4 w-4 mr-1" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => onFilterChange("active")}
                  className={filter === "active" ? "bg-accent" : ""}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Active
                  {filter === "active" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange("all")}
                  className={filter === "all" ? "bg-accent" : ""}
                >
                  <ListFilter className="h-4 w-4 mr-2" />
                  All
                  {filter === "all" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCreateClick} className="text-primary font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ProjectsStats projects={projects} totalItems={totalItems} />

      <div className="min-h-[200px]">

        <div className="block md:hidden">
          <ProjectsGrid projects={projects} />
        </div>

        <div className="hidden md:block">
          {viewMode === "cards" ? (
            <ProjectsGrid projects={projects} />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <ProjectsTable
                projects={projects}
                isLoading={isLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                onRefresh={onRefresh}
                onView={onView}
                onEdit={onEdit}
                renderProjectName={renderProjectName}
                renderClient={renderClient}
                renderActions={renderActions}
                showProgress={true}
                showBudget={true}
              />
            </div>
          )}
        </div>
      </div>

      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={projects.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="projects"
        className="mt-4 sm:mt-6"
      />
    </div>
  );
};