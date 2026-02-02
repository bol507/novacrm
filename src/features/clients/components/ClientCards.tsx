import { type Client } from '@/features/clients/types/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail,
    Phone,
    Building2,
    Briefcase,
    DollarSign,
    MoreVertical,
    MapPin,
    Trash2Icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

interface ClientCardsProps {
    clients: Client[];
    isLoading: boolean;
    onClientClick: (client: Client) => void;
    onEditClient?: (client: Client) => void;
}

// Formateador de moneda
const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Obtener color del estado
const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20";
};

export const ClientCards = ({ clients, isLoading, onClientClick, onEditClient }: ClientCardsProps) => {
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

    if (clients.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron clientes</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
                <Card key={client.accountid} className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Card Header */}
                        <div className="flex items-start justify-between p-4 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-semibold text-primary">
                                        {client.accountname.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">
                                        {client.accountname}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {client.account_no || 'Sin número'}
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
                                            onClientClick(client);
                                        }}
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditClient?.(client); 
                                        }}
                                    >
                                        <Briefcase className="h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                                        <Trash2Icon className="h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Card Body */}
                        <div className="px-4 pb-4 space-y-3">
                            {/* Tipo de cuenta e industria */}
                            {(client.account_type || client.industry) && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {client.account_type}{client.account_type && client.industry && " · "}{client.industry}
                                    </span>
                                </div>
                            )}

                            {/* Email */}
                            {client.email1 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground truncate">
                                        {client.email1}
                                    </span>
                                </div>
                            )}

                            {/* Teléfono */}
                            {client.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {client.phone}
                                    </span>
                                </div>
                            )}

                            {/* Dirección */}
                            {(client.bill_city || client.bill_state || client.bill_country) && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {client.bill_city}{client.bill_city && client.bill_state && ", "}{client.bill_state}
                                        {client.bill_country && `, ${client.bill_country}`}
                                    </span>
                                </div>
                            )}

                            {/* Ingresos anuales */}
                            {client.annualrevenue && (
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">
                                        {formatCurrency(client.annualrevenue)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
                            <Badge variant="outline" className={getStatusColor(client.is_active)}>
                                {client.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                            {client.rating && (
                                <span className="text-xs text-muted-foreground">
                                    {client.rating}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};