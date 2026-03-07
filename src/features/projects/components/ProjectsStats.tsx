import { Card, CardHeader } from "@/components/ui/card";
import type { Project } from "../types/projects";

interface ProjectsStatsProps {
  projects: Project[];
}

export const ProjectsStats = ({ projects }: ProjectsStatsProps) => {
  // ✅ Cálculos puros (sin efectos secundarios)
  const inProgressCount = projects.filter(p => p.projectstatus === 'In Progress').length;
  const completedCount = projects.filter(p => p.projectstatus === 'Completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (parseInt(p.targetbudget || '0')), 0);
  const averageProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + parseInt(p.progress || '0'), 0) / projects.length)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <StatCard label="En Curso" value={inProgressCount} />
      <StatCard label="Completados" value={completedCount} />
      <StatCard 
        label="Presupuesto Total" 
        value={`$${totalBudget.toLocaleString('es-PA')}`} 
      />
      <StatCard label="Progreso Promedio" value={`${averageProgress}%`} />
    </div>
  );
};

// ✅ Sub-componente reutilizable para stats
const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-2xl font-bold">{value}</div>
    </CardHeader>
  </Card>
);