import { type Client } from '@/features/clients/types/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail,
    Phone,
    Building2,
    DollarSign,
    MoreVertical,
    MapPin,
    Trash2Icon,
    Eye,
    Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Props interface for the ClientCards presentational component.
 */
export interface ClientCardsProps {
    /**
     * Array of client objects to display in the grid.
     */
    clients: Client[];

    /**
     * Loading state indicator for async data fetching.
     */
    isLoading: boolean;

    /**
     * Callback fired when "View details" action is triggered.
     * Also triggered when the card itself is clicked.
     */
    onView?: (client: Client) => void;

    /**
     * Callback fired when "Edit" action is triggered.
     */
    onEdit?: (client: Client) => void;

    /**
     * Callback fired when "Delete" action is triggered.
     * Parent should handle confirmation dialog.
     */
    onDelete?: (client: Client) => void;
}

/**
 * Formats a number as USD currency with Panamanian locale.
 *
 * @param value - The number to format (can be null or undefined)
 * @returns Formatted currency string or '-' if value is falsy
 */
const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Returns status badge color classes based on client active status.
 *
 * @param isActive - Whether the client is active
 * @returns Tailwind CSS classes for the status badge
 */
const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20";
};

/**
 * ClientCards component for displaying clients in a responsive card grid.
 *
 * Features:
 * - Responsive design with simplified mobile cards and full desktop cards
 * - Skeleton loading state while fetching data
 * - Empty state when no clients are found
 * - Clickable cards for viewing details (when onView is provided)
 * - Dropdown menu with view, edit, and delete actions
 * - Keyboard navigation support for accessibility
 * - Currency formatting for annual revenue
 * - Status badges with appropriate colors
 *
 * @component
 * @param props - Component props
 * @param props.clients - Array of client objects to display
 * @param props.isLoading - Whether data is currently loading
 * @param props.onView - Callback fired when viewing client details
 * @param props.onEdit - Callback fired when editing a client
 * @param props.onDelete - Callback fired when deleting a client
 * @returns The rendered client cards component
 *
 * @example
 * // Basic usage
 * <ClientCards
 *   clients={clients}
 *   isLoading={isLoading}
 *   onView={handleViewClient}
 *   onEdit={handleEditClient}
 *   onDelete={handleDeleteClient}
 * />
 *
 * @example
 * // Read-only mode without actions
 * <ClientCards
 *   clients={clients}
 *   isLoading={false}
 *   onView={handleViewClient}
 * />
 */
export const ClientCards = ({
    clients,
    isLoading,
    onView,
    onEdit,
    onDelete
}: ClientCardsProps) => {
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
                    <p className="text-muted-foreground">No clients found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Mobile View: Simplified cards */}
            <div className="space-y-3 sm:hidden">
                {clients.map((client) => (
                    <Card
                        key={client.accountid}
                        className="overflow-hidden"
                        onClick={() => onView?.(client)}
                        role={onView ? "button" : undefined}
                        tabIndex={onView ? 0 : undefined}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-foreground truncate">
                                        {client.accountname}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{client.account_no}</p>
                                </div>
                                <Badge variant="outline" className={getStatusColor(client.is_active)}>
                                    {client.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                                {client.email1 && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{client.email1}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.annualrevenue && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-medium">{formatCurrency(client.annualrevenue)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                                {onView && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(client)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                                {onEdit && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(client)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(client)}>
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View: Full cards with dropdown menu */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                    <Card
                        key={client.accountid}
                        className="overflow-hidden"
                        onClick={() => onView?.(client)}
                        role={onView ? "button" : undefined}
                        tabIndex={onView ? 0 : undefined}
                        onKeyDown={(e) => {
                            if (onView && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                onView(client);
                            }
                        }}
                    >
                        <CardContent className="p-0">
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
                                            {client.account_no || 'No number'}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover">
                                        {onView && (
                                            <DropdownMenuItem
                                                className="gap-2 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(client);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View details
                                            </DropdownMenuItem>
                                        )}
                                        {onEdit && (
                                            <DropdownMenuItem
                                                className="gap-2 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(client);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        {onDelete && (
                                            <DropdownMenuItem
                                                className="gap-2 cursor-pointer text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(client);
                                                }}
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="px-4 pb-4 space-y-3">
                                {(client.account_type || client.industry) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground">
                                            {client.account_type}{client.account_type && client.industry && " · "}{client.industry}
                                        </span>
                                    </div>
                                )}

                                {client.email1 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground truncate">
                                            {client.email1}
                                        </span>
                                    </div>
                                )}

                                {client.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground">
                                            {client.phone}
                                        </span>
                                    </div>
                                )}

                                {(client.bill_city || client.bill_state || client.bill_country) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground">
                                            {client.bill_city}{client.bill_city && client.bill_state && ", "}{client.bill_state}
                                            {client.bill_country && `, ${client.bill_country}`}
                                        </span>
                                    </div>
                                )}

                                {client.annualrevenue && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground">
                                            {formatCurrency(client.annualrevenue)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
                                <Badge variant="outline" className={getStatusColor(client.is_active)}>
                                    {client.is_active ? "Active" : "Inactive"}
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
        </>
    );
};