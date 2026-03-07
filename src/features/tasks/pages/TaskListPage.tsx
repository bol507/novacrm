import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks } from "../hooks/useTasks";
import { useToggleDashboardTask } from "@/features/dashboard/hooks/useDashboardTasks";
import type { TaskFilters } from "../types/task";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Pagination } from "@/components/Pagination";

const priorityColors = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-muted text-muted-foreground border-muted",
};

const priorityLabels = {
  High: "Alta",
  Medium: "Media",
  Low: "Baja",
};

const statusLabels = {
  "Not Started": "No Iniciada",
  "In Progress": "En Progreso",
  "Completed": "Completada",
  "Pending Input": "Pendiente",
  "Planned": "Planificada",
};

const TaskListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({});
  const { data, isLoading } = useTasks(page, 20, filters);
  const toggleTaskMutation = useToggleDashboardTask();

  const handleToggleTask = async (task: { id: number; completed: boolean }) => {
    await toggleTaskMutation.mutateAsync({
      taskId: task.id,
      completed: !task.completed,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tasks = data?.data || [];
  const meta = data?.meta;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tareas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona todas tus tareas
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard/tasks/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tareas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {meta?.total || 0} tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay tareas
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""
                              }`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={priorityColors[task.priority]}
                            >
                              {priorityLabels[task.priority]}
                            </Badge>
                            <Badge variant="secondary">
                              {statusLabels[task.status]}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                🕐 {new Date(task.dueDate).toLocaleDateString("es-PA")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                           onClick={(e) => {
                            e.stopPropagation(); 
                            navigate(`/dashboard/tasks/${task.id}`);  
                          }}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ Pagination Component */}
        {meta && meta.total_pages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.current_page} de {meta.total_pages}
            </p>
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TaskListPage;