import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ProjectStatusBadgeProps {
    status: string;
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
    const getStatusVariant = () => {
        switch (status.toLowerCase()) {
            case 'en curso':
                return 'bg-blue-100 text-blue-800';
            case 'completado':
                return 'bg-green-100 text-green-800';
            case 'borrador':
                return 'bg-gray-100 text-gray-800';
            case 'pausado':
                return 'bg-yellow-100 text-yellow-800';
            case 'en revisión':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Badge className={cn("text-xs px-2 py-1", getStatusVariant())}>
            {status}
        </Badge>
    );
};