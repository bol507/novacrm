import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Role } from '../types/role';
import { useRoles } from '../hooks/use-roles';

interface RoleSelectProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    minDepth?: number;
    onRolesLoaded?: (roles: Role[]) => void;
}

/**
 * Generic Role Selector component that fetches hierarchical roles from Vtiger
 * and displays them in a shadcn/ui Select dropdown.
 *
 * @example
 * <RoleSelect 
 *   value={form.watch('role_id')} 
 *   onChange={(v) => form.setValue('role_id', v)} 
 *   minDepth={1}
 * />
 */
export const RoleSelect = ({
    value,
    onChange,
    disabled = false,
    placeholder = 'Select role...',
    className,
    minDepth = 0,
    onRolesLoaded,
}: RoleSelectProps) => {
    const { roles, isLoading, error } = useRoles({ minDepth });

    // ✅ Callback opcional cuando cargan los roles
    if (roles && onRolesLoaded) {
        onRolesLoaded(roles);
    }

    // ✅ Loading state
    if (isLoading) {
        return (
            <Select disabled>
                <SelectTrigger className={cn('w-full', className)}>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading roles...</span>
                </SelectTrigger>
            </Select>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <Select disabled>
                <SelectTrigger className={cn('w-full border-destructive', className)}>
                    <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                    <span className="text-destructive">Error loading roles</span>
                </SelectTrigger>
            </Select>
        );
    }

    // ✅ Empty state
    if (roles.length === 0) {
        return (
            <Select disabled>
                <SelectTrigger className={cn('w-full', className)}>
                    <span className="text-muted-foreground">No roles available</span>
                </SelectTrigger>
            </Select>
        );
    }

    const normalizedValue = value?.toString().trim() ?? "";
    return (
        <Select
            key={`role-select-${roles.length}-${normalizedValue}`}
            value={normalizedValue}              // ✅ Garantizar string definido
            onValueChange={(newValue) => {
                const trimmedNew = newValue?.toString().trim();
                const trimmedCurrent = value?.toString().trim();
                if (trimmedNew !== trimmedCurrent) {
                    onChange(trimmedNew);
                }
            }}
            disabled={disabled || isLoading}
        >
            <SelectTrigger className={cn('w-full', className)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {roles.map(role => {

                    const roleValue = role.value?.toString().trim();

                    return (
                        <SelectItem
                            key={roleValue}
                            value={roleValue}
                            className={cn(
                                "flex items-center gap-2",
                                roleValue === normalizedValue && "bg-accent font-medium"
                            )}
                        >
                            {/* visual Indentation  for profundidad */}
                            <span className={cn(
                                'inline-block',
                                role.depth > 0 && 'pl-4 border-l-2 border-muted ml-2'
                            )}>
                                {role.label}
                            </span>
                            {/* Badge optional for root */}
                            {role.depth === 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">(Root)</span>
                            )}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
};