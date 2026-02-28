import { Progress } from "@/components/ui/progress";

interface ProjectProgressProps {
    progress: string;
    totalTasks: number;
    completedTasks: number;
}

export const ProjectProgress = ({ progress, totalTasks, completedTasks }: ProjectProgressProps) => {
    const progressValue = parseInt(progress) || 0;
    
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