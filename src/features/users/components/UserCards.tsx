import { type User } from '@/features/users/types/user';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail,
    Phone,
    Building2,
    MoreVertical,
    Calendar,
    Shield,
    Trash2Icon,
    KeyIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardsProps {
    users: User[];
    isLoading: boolean;
    onUserClick: (user: User) => void;
    onEditUser?: (user: User) => void;
    onChangePassword?: (user: User) => void;
    onDeleteUser?: (user: User) => void;
}

// Formatear fecha
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Obtener color del estado
const getStatusColor = (status: string) => {
    return status === "Active"
        ? "bg-green-500/10 text-green-600 border-green-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20";
};

export const UserCards = ({ users, isLoading, onUserClick, onEditUser, onChangePassword, onDeleteUser }: UserCardsProps) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-muted animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 pb-4 space-y-3">
                                <div className="h-3 bg-muted rounded w-full" />
                                <div className="h-3 bg-muted rounded w-5/6" />
                                <div className="h-3 bg-muted rounded w-2/3" />
                            </div>
                            <div className="px-4 py-3 bg-muted/30 border-t">
                                <div className="h-4 bg-muted rounded w-1/4" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron usuarios</p>
                </CardContent>
            </Card>
        );
    }



    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Card Header */}
                        <div className="flex items-start justify-between p-4 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-semibold text-primary">
                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-foreground truncate">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        {user.role === 'Admin' && (
                                            <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        @{user.user_name}
                                    </p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover">
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUserClick(user);
                                        }}
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditUser?.(user);
                                        }}
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChangePassword?.(user);
                                        }}
                                    >
                                        <KeyIcon className="h-4 w-4" />
                                        Cambiar Contraseña
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteUser?.(user);
                                        }}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Card Body */}
                        <div className="px-4 pb-4 space-y-3">
                            {/* Department */}
                            {user.department && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {user.department}
                                    </span>
                                </div>
                            )}

                            {/* Email */}
                            {user.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground truncate">
                                        {user.email}
                                    </span>
                                </div>
                            )}

                            {/* Phone */}
                            {user.phone_crm && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {user.phone_crm}
                                    </span>
                                </div>
                            )}

                            {/* Role */}
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
                            <Badge variant="outline" className={getStatusColor(user.status)}>
                                {user.status === "Active" ? "Activo" : "Inactivo"}
                            </Badge>
                            {user.role === 'Admin' && (
                                <span className="text-xs text-amber-600 font-medium">
                                    Administrador
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};