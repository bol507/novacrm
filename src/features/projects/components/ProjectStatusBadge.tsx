import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ProjectStatusBadgeProps {
    status: string;
}

/**
 * Translation map from English (API values) to Spanish (display values)
 */
const statusTranslationMap: Record<string, string> = {
    // English to Spanish
    'in progress': 'En Curso',
    'initiated': 'Iniciado',
    'completed': 'Completado',
    'on hold': 'Pausado',
    'cancelled': 'Cancelado',
    'draft': 'Borrador',
    'in review': 'En Revisión',
    // Spanish originals (for backward compatibility)
    'en curso': 'En Curso',
    'iniciado': 'Iniciado',
    'completado': 'Completado',
    'pausado': 'Pausado',
    'cancelado': 'Cancelado',
    'borrador': 'Borrador',
    'en revisión': 'En Revisión',
};

/**
 * Get Spanish display value from API status value
 */
const getDisplayStatus = (status: string): string => {
    const normalizedStatus = status.toLowerCase().trim();
    return statusTranslationMap[normalizedStatus] || status;
};

interface StatusStyle {
    bgClass: string;
    textClass: string;
}

/**
 * Get CSS classes for status badge styling based on project status
 */
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

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
    const displayStatus = getDisplayStatus(status);
    const { bgClass, textClass } = getStatusStyle(status);

    return (
        <Badge className={cn("text-xs px-2 py-1", bgClass, textClass)}>
            {displayStatus}
        </Badge>
    );
};
