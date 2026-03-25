import { Progress } from "@/components/ui/progress";

interface ProjectProgressProps {
    progress: string;
    totalTasks: number;
    completedTasks: number;
    compact?: boolean;
}

export const ProjectProgress = ({ progress, totalTasks, completedTasks, compact = false }: ProjectProgressProps) => {
    const progressValue = parseInt(progress) || 0;
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const displayProgress = isNaN(progressValue) ? percentage : progressValue;
    
    if (compact) {
        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        {completedTasks} / {totalTasks}
                    </span>
                    <span className="font-medium">{Math.round(displayProgress)}%</span>
                </div>
                <Progress value={displayProgress} className="h-1.5" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="font-medium">{completedTasks} / {totalTasks} tareas</span>
                <span>{progress}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
        </div>
    );
};