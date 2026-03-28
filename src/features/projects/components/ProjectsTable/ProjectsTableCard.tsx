import { cn } from '@/shared/lib/utils';
import { Calendar, User, Building, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from '../ProjectStatusBadge';
import { ProjectProgress } from '../ProjectProgress';
import type { Project } from '../../types/projects';
import type { SortKey, SortOrder } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectsTableCardProps {
    project: Project;
    sortBy: SortKey;
    sortOrder: SortOrder;
    onView?: (project: Project) => void;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    renderProjectName?: (project: Project) => React.ReactNode;
    renderClient?: (project: Project) => React.ReactNode;
    renderActions?: (project: Project) => React.ReactNode;
    showProgress: boolean;
    showBudget: boolean;
    compact: boolean;
}

export const ProjectsTableCard = ({
    project,
    onView,
    onEdit,
    onDelete,
    renderProjectName,
    renderClient,
    renderActions,
    showProgress,
    showBudget,
}: ProjectsTableCardProps) => {
    const formatCurrency = (value: string | number | undefined): string => {
        if (!value) return '$0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    const isOverdue = project.targetenddate && new Date(project.targetenddate) < new Date();

    return (
        <div
            className={cn(
                'border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer',
                onView && 'active:scale-[0.99] active:transition-transform'
            )}
            onClick={() => onView?.(project)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onView?.(project)}
            aria-label={`Ver detalles de ${project.projectname}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {renderProjectName ? (
                        renderProjectName(project)
                    ) : (
                        <>
                            <h3 className="font-semibold text-base truncate" title={project.projectname}>
                                {project.projectname}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono">{project.project_no}</p>
                        </>
                    )}
                </div>
                <ProjectStatusBadge status={project.projectstatus || 'in progress'} />
            </div>

            {/* Info Rows */}
            <div className="space-y-2 text-sm">
                {project.account_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {renderClient ? (
                            renderClient(project)
                        ) : (
                            <span className="truncate" title={project.account_name}>
                                {project.account_name}
                            </span>
                        )}
                    </div>
                )}

                {project.assigned_user_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{project.assigned_user_name}</span>
                    </div>
                )}

                {project.targetenddate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar
                            className={cn(
                                'h-4 w-4 shrink-0',
                                isOverdue && 'text-orange-600'
                            )}
                            aria-hidden="true"
                        />
                        <span className={cn(isOverdue && 'text-orange-600 font-medium')}>
                            {formatDate(project.targetenddate)}
                        </span>
                    </div>
                )}
            </div>

            {/* Progress */}
            {showProgress && (
                <div className="pt-2 border-t">
                    <ProjectProgress
                        progress={project.progress || '0'}
                        totalTasks={project.totalTasks || 0}
                        completedTasks={project.completedTasks || 0}
                        compact
                    />
                </div>
            )}

            {/* Footer: Budget + Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
                {showBudget && (
                    <span className="font-semibold">{formatCurrency(project.targetbudget)}</span>
                )}

                {renderActions ? (
                    <div onClick={(e) => e.stopPropagation()}>{renderActions(project)}</div>
                ) : (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                onView?.(project);
                            }}
                            aria-label="Ver detalles"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(project)}
                                aria-label="Editar"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => onDelete(project)}
                                aria-label="Eliminar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};