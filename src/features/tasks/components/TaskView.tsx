import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, RefreshCw, LayoutGrid, List, Filter } from "lucide-react";
import type { Task, TaskViewMode } from "../types/task";
import ListFooter from "@/components/ListFooter";

/**
 * Priority color mapping for task badges.
 */
const priorityColors = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-muted text-muted-foreground border-muted",
};

/**
 * Priority labels in Spanish.
 */
const priorityLabels = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

/**
 * Status labels in Spanish.
 */
const statusLabels = {
  "Not Started": "Not Started",
  "In Progress": "In Progress",
  "Completed": "Completed",
  "Pending Input": "Pending Input",
  "Planned": "Planned",
};

export interface TaskViewProps {
  /** Array of tasks to display */
  tasks: Task[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error object if data fetching failed */
  error: Error | null;
  /** Current search term value */
  searchTerm: string;
  /** Callback for search input changes */
  onSearchChange: (value: string) => void;
  /** Callback for create task action */
  onCreateClick: () => void;
  /** Callback for view mode toggle */
  onViewModeChange: (mode: TaskViewMode) => void;
  /** Callback for refresh action */
  onRefresh: () => void;
  /** Callback for viewing task details */
  onView?: (task: Task) => void;
  /** Callback for toggling task completion */
  onToggle?: (task: Task) => void;
  /** Current view mode ('cards' or 'table') */
  viewMode: TaskViewMode;
  /** Current page number */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Callback for page changes */
  onPageChange: (page: number) => void;
  /** Callback for deleting a task */
  onDelete?: (task: { id: number; title: string }) => void;
}

/**
 * TaskView component - Main presentational component for the tasks page.
 *
 * Features:
 * - Displays tasks in either card or table view mode
 * - Search functionality with filter input
 * - Create, view, and toggle task completion actions
 * - Pagination controls via ListFooter
 * - Error state handling with retry button
 * - Loading states for async operations
 * - Responsive design with card view on mobile
 *
 * @component
 * @param props - Component props
 * @returns The rendered task view component
 *
 * @example
 * // Basic usage
 * <TaskView
 *   tasks={tasks}
 *   isLoading={isLoading}
 *   error={null}
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onCreateClick={handleCreate}
 *   onViewModeChange={setViewMode}
 *   onRefresh={refetch}
 *   onView={handleViewTask}
 *   onToggle={handleToggleTask}
 *   viewMode="cards"
 *   page={1}
 *   totalPages={5}
 *   totalItems={42}
 *   onPageChange={setPage}
 * />
 */
export const TaskView = ({
  tasks,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onCreateClick,
  onViewModeChange,
  onRefresh,
  onView,
  onToggle,
  viewMode,
  page,
  totalPages,
  totalItems,
  onPageChange,
}: TaskViewProps) => {

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error loading tasks: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalItems}
            </Badge>
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Manage all your tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

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

          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {totalItems} tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found
            </div>
          ) : viewMode === "cards" ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onView={onView}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ) : (
            <TaskTable
              tasks={tasks}
              onView={onView}
              onToggle={onToggle}
            />
          )}
        </CardContent>
      </Card>

      <ListFooter
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        displayedItems={tasks.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
        entityLabel="tasks"
        className="mt-6"
      />
    </div>
  );
};

interface TaskCardProps {
  /** Task to display */
  task: Task;
  /** Callback for viewing task details */
  onView?: (task: Task) => void;
  /** Callback for toggling task completion */
  onToggle?: (task: Task) => void;
}

/**
 * TaskCard component for displaying a single task in card view.
 *
 * Displays task title, description, priority, status, and due date.
 * Includes a checkbox for completion toggling and a view button.
 *
 * @component
 * @param props - Component props
 * @returns The rendered task card
 */
const TaskCard = ({
  task,
  onView,
  onToggle,
}: TaskCardProps) => {
  return (
    <div
      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle?.(task)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
              <Badge variant="secondary">
                {statusLabels[task.status]}
              </Badge>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(task);
            }}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TaskTableProps {
  /** Array of tasks to display */
  tasks: Task[];
  /** Callback for viewing task details */
  onView?: (task: Task) => void;
  /** Callback for toggling task completion */
  onToggle?: (task: Task) => void;
}

/**
 * TaskTable component for displaying tasks in a responsive table format.
 *
 * Features:
 * - Sortable columns (not implemented in this version)
 * - Checkbox for task completion toggle
 * - Displays title, priority, status, due date, and assigned user
 * - Responsive with horizontal scroll on small screens
 *
 * @component
 * @param props - Component props
 * @returns The rendered task table
 */
const TaskTable = ({
  tasks,
  onView,
  onToggle,
}: TaskTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-10"></th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Assigned</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
           </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggle?.(task)}
                  className="mt-1"
                />
               </td>
              <td className="px-4 py-3">
                <div className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-xs">
                    {task.description}
                  </div>
                )}
               </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
               </td>
              <td className="px-4 py-3">
                <Badge variant="secondary">
                  {statusLabels[task.status]}
                </Badge>
               </td>
              <td className="px-4 py-3">
                {task.dueDate && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
               </td>
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {task.assignedUserName || '-'}
                </span>
               </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView?.(task)}
                >
                  View
                </Button>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskView;