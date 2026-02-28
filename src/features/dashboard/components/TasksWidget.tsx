import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useDashboardTasks, useToggleDashboardTask } from "../hooks/useDashboardTasks";

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-muted",
};

const priorityLabels = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const TasksWidget = () => {
  const { data, isLoading, error } = useDashboardTasks(10); // ✅ Aumentar limit para mostrar más tareas
  const toggleTaskMutation = useToggleDashboardTask();

  const handleToggleTask = async (task: { id: number; completed: boolean }) => {
    try {
      await toggleTaskMutation.mutateAsync({
        taskId: task.id,
        completed: !task.completed,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // ✅ Formatear fecha correctamente
  const formatDueDate = (dueDate: string, dueTime?: string) => {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return `Hoy${dueTime ? ` ${dueTime}` : ''}`;
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return `Mañana${dueTime ? ` ${dueTime}` : ''}`;
    }
    
    return date.toLocaleDateString('es-PA', { day: '2-digit', month: 'short' });
  };

  // ✅ Normalizar prioridad
  const normalizePriority = (priority?: string): 'high' | 'medium' | 'low' => {
    if (!priority) return 'medium';
    const lower = priority.toLowerCase();
    if (lower === 'high') return 'high';
    if (lower === 'medium') return 'medium';
    if (lower === 'low') return 'low';
    return 'medium';
  };

  // ✅ Verificar si está vencida
  const checkIsOverdue = (task: any): boolean => {
    if (!task.dueDate || task.completed) return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tareas Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tareas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Error al cargar tareas
          </p>
        </CardContent>
      </Card>
    );
  }

  const tasks = data?.data || [];
  const stats = data?.stats || { completed: 0, total: 0 };

  // ✅ ORDENAR TAREAS:
  // 1. Primero las pendientes (completed = false), luego las completadas
  // 2. Dentro de cada grupo, ordenar por fecha (más reciente primero)
  const sortedTasks = [...tasks].sort((a, b) => {
    // ✅ Primero: Separar por completadas vs pendientes
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Pendientes primero (false < true)
    }

    // ✅ Segundo: Ordenar por fecha (más reciente primero)
    const dateA = new Date(a.dueDate || a.startDate);
    const dateB = new Date(b.dueDate || b.startDate);
    return dateB.getTime() - dateA.getTime(); // Descendente (más reciente primero)
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">
            Tareas Pendientes
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.completed}/{stats.total} completadas
          </p>
        </div>
        <Button size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No hay tareas pendientes</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const normalizedPriority = normalizePriority(task.priority);
              const taskIsOverdue = checkIsOverdue(task);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all",
                    task.completed
                      ? "bg-muted/50 opacity-60"
                      : "bg-card hover:bg-muted/30",
                    taskIsOverdue && !task.completed && "border-destructive/50"
                  )}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task)}
                    className="mt-0.5"
                    disabled={toggleTaskMutation.isPending}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        task.completed && "line-through text-muted-foreground",
                        taskIsOverdue && !task.completed && "text-destructive"
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* ✅ Badge de prioridad - SIEMPRE se muestra */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-2 py-0.5",
                          priorityColors[normalizedPriority]
                        )}
                      >
                        {priorityLabels[normalizedPriority]}
                      </Badge>
                      
                      {/* ✅ Fecha */}
                      {task.dueDate && task.dueDate.trim() !== '' && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs",
                          taskIsOverdue && !task.completed ? "text-destructive" : "text-muted-foreground"
                        )}>
                          <Clock className="w-3 h-3" />
                          {formatDueDate(task.dueDate, task.dueTime)}
                        </div>
                      )}
                      
                      {/* ✅ Ubicación */}
                      {task.location && task.location.trim() !== '' && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {task.location}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default TasksWidget;