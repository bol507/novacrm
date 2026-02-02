import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueTime: string;
  assignee: string;
  completed: boolean;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Llamar a cliente ABC Corp",
    priority: "high",
    dueTime: "10:00 AM",
    assignee: "Tú",
    completed: false,
  },
  {
    id: "2",
    title: "Preparar propuesta comercial",
    priority: "high",
    dueTime: "11:30 AM",
    assignee: "Tú",
    completed: false,
  },
  {
    id: "3",
    title: "Revisar cotización pendiente",
    priority: "medium",
    dueTime: "2:00 PM",
    assignee: "Tú",
    completed: false,
  },
  {
    id: "4",
    title: "Actualizar información de leads",
    priority: "low",
    dueTime: "4:00 PM",
    assignee: "Tú",
    completed: true,
  },
  {
    id: "5",
    title: "Enviar reporte semanal",
    priority: "medium",
    dueTime: "5:00 PM",
    assignee: "Tú",
    completed: false,
  },
];

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
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">
            Tareas Pendientes
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount}/{tasks.length} completadas
          </p>
        </div>
        <Button size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {tasks.map((task) => (
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
                  : "bg-card hover:bg-muted/30"
              )}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", priorityColors[task.priority])}
                  >
                    {priorityLabels[task.priority]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {task.dueTime}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default TasksWidget;