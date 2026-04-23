import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { useToggleDashboardTask } from "@/features/dashboard/hooks/useDashboardTasks";
import type {   TaskViewMode } from "../types/task";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TaskView } from "../components/TaskView";
import { useConfirm } from "@/components/confirm-dialog";
import { useDeleteTask } from "../hooks/use-delete-task";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";

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
  const showConfirm = useConfirm();
  const deleteMutation = useDeleteTask();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const filters = useMemo(() => ({
    ...(selectedUserId && { assignedTo: selectedUserId }),
  }), [selectedUserId]);
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("tasksViewMode") as TaskViewMode) || "cards";
    }
    return "cards";
  });
  
  const { user: currentUser  } = useAuth();
  

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
   */
  const handleToggleTask = async (task: { id: number; completed: boolean }) => {
    await toggleTaskMutation.mutateAsync({
      taskId: task.id,
      completed: !task.completed,
    });
  };

  /**
   * Handles page change for pagination.
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
   */
  const handleViewTask = (task: { id: number }) => {
    navigate(`/dashboard/tasks/${task.id}`);
  };

  /**
   * Handles view mode changes (cards/table).
   */
  const handleViewModeChange = (mode: TaskViewMode) => {
    setViewMode(mode);
  };

  /**
   * ✅ CORREGIDO: Mostrar diálogo de confirmación y eliminar tarea
   */
  const handleDeleteTask = (task: { id: number; title: string }) => {
    showConfirm({
      title: "¿Eliminar tarea?",
      description: `¿Estás seguro de eliminar "${task.title}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          // ✅ CORREGIDO: useDeleteTask() sin parámetros → mutateAsync(taskId)
          await deleteMutation.mutateAsync(task.id);
          toast.success("Tarea eliminada correctamente");
          refetch(); // ✅ Refrescar lista después de eliminar
        } catch (error) {
          console.error("Error deleting task:", error);
          // El toast ya se muestra en el hook onError, pero podemos agregar uno adicional
          toast.error("Error al eliminar la tarea");
        }
      },
    });
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
        onDelete={handleDeleteTask}
        viewMode={viewMode}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        selectedUserId={selectedUserId}
        onUserFilterChange={setSelectedUserId}
        currentUserId={currentUser?.id}
      />
    </ErrorBoundary>
  );
};

export default TaskListPage;