import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ProjectStatusBadgeProps {
    status: string;
}

const statusTranslationMap: Record<string, string> = {
    'in progress': 'In Progress',
    'initiated': 'Initiated',
    'completed': 'Completed',
    'on hold': 'On Hold',
    'cancelled': 'Cancelled',
    'draft': 'Draft',
    'in review': 'In Review',
    'en curso': 'In Progress',
    'iniciado': 'Initiated',
    'completado': 'Completed',
    'pausado': 'On Hold',
    'cancelado': 'Cancelled',
    'borrador': 'Draft',
    'en revisión': 'In Review',
};

const getDisplayStatus = (status: string): string => {
    const normalizedStatus = status.toLowerCase().trim();
    return statusTranslationMap[normalizedStatus] || status;
};

interface StatusStyle {
    bgClass: string;
    textClass: string;
}

const getStatusStyle = (status: string): StatusStyle => {
    const normalizedStatus = status.toLowerCase().trim();
    
    switch (normalizedStatus) {
        case 'in progress':
        case 'en curso':
            return { bgClass: 'bg-blue-100', textClass: 'text-blue-800' };
        case 'completed':
        case 'completado':
            return { bgClass: 'bg-green-100', textClass: 'text-green-800' };
        case 'on hold':
        case 'pausado':
            return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' };
        case 'cancelled':
        case 'cancelado':
            return { bgClass: 'bg-red-100', textClass: 'text-red-800' };
        case 'in review':
        case 'en revisión':
            return { bgClass: 'bg-purple-100', textClass: 'text-purple-800' };
        case 'draft':
        case 'borrador':
            return { bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
        case 'initiated':
        case 'iniciado':
            return { bgClass: 'bg-cyan-100', textClass: 'text-cyan-800' };
        default:
            return { bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
    }
};

/**
 * ProjectStatusBadge component for displaying project status with appropriate colors.
 *
 * @component
 * @param props - Component props
 * @param props.status - Project status string (supports both English and Spanish input)
 * @returns A badge with status text and color coding
 *
 * @example
 * <ProjectStatusBadge status="in progress" />
 * <ProjectStatusBadge status="Completado" />
 */
export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
    const displayStatus = getDisplayStatus(status);
    const { bgClass, textClass } = getStatusStyle(status);

    return (
        <Badge className={cn("text-xs px-2 py-1", bgClass, textClass)}>
            {displayStatus}
        </Badge>
    );
};