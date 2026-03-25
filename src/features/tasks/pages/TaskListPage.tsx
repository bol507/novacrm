import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { useToggleDashboardTask } from "@/features/dashboard/hooks/useDashboardTasks";
import type { TaskFilters, TaskViewMode } from "../types/task";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TaskView } from "../components/TaskView";

/**
 * TaskListPage component for displaying and managing tasks.
 *
 * Features:
 * - Displays paginated list of tasks with search and filtering
 * - Supports card and table view modes (persisted in localStorage)
 * - Task completion toggle with optimistic updates
 * - Navigation to create new tasks and view task details
 * - Smooth scroll to top on page change
 * - Error boundary for graceful error handling
 *
 * @component
 * @returns The rendered tasks list page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/tasks" element={<TaskListPage />} />
 */
const TaskListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters] = useState<TaskFilters>({});
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("tasksViewMode") as TaskViewMode) || "cards";
    }
    return "cards";
  });

  // Persist view mode preference to localStorage
  useMemo(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasksViewMode", viewMode);
    }
  }, [viewMode]);

  const { data, isLoading, error, refetch } = useTasks(page, 20, filters);
  const toggleTaskMutation = useToggleDashboardTask();

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const tasks = data?.data || [];
  const meta = data?.meta;
  const totalItems = meta?.total || 0;
  const totalPages = meta?.total_pages || 1;

  /**
   * Handles task completion toggle.
   *
   * @param task - The task to toggle with its ID and current completion status
   */
  const handleToggleTask = async (task: { id: number; completed: boolean }) => {
    await toggleTaskMutation.mutateAsync({
      taskId: task.id,
      completed: !task.completed,
    });
  };

  /**
   * Handles page change for pagination.
   *
   * @param newPage - The new page number to navigate to
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navigates to the task creation page.
   */
  const handleCreateClick = () => {
    navigate("/dashboard/tasks/new");
  };

  /**
   * Navigates to the task detail page.
   *
   * @param task - The task to view
   */
  const handleViewTask = (task: { id: number }) => {
    navigate(`/dashboard/tasks/${task.id}`);
  };

  /**
   * Handles view mode changes (cards/table).
   *
   * @param mode - The new view mode
   */
  const handleViewModeChange = (mode: TaskViewMode) => {
    setViewMode(mode);
  };

  return (
    <ErrorBoundary>
      <TaskView
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        searchTerm={search}
        onSearchChange={setSearch}
        onCreateClick={handleCreateClick}
        onViewModeChange={handleViewModeChange}
        onRefresh={refetch}
        onView={handleViewTask}
        onToggle={handleToggleTask}
        viewMode={viewMode}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
    </ErrorBoundary>
  );
};

export default TaskListPage;
