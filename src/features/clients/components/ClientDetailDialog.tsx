import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    Phone,
    Mail,
    Globe,
    Users,
    DollarSign,
    Briefcase,
    Tag,
    FileText,
    Hash,
    Settings,
    MapPin,
    Pencil,
} from "lucide-react";
import type { Client } from "@/features/clients/types/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUpdateClient } from "@/features/clients/hooks/use-update-client";
import ClientFormDialog from "./ClientFormDialog";
import { toast } from "sonner";
import { useDeleteClient } from "@/features/clients/hooks/use-delete-client";

interface ClientDetailDialogProps {
    /** The client to display, or null if no client is selected */
    client: Client | null;
    /** Whether the dialog is open */
    open: boolean;
    /** Callback invoked when the dialog open state changes */
    onOpenChange: (open: boolean) => void;
}

/**
 * ClientDetailDialog component for displaying client details in a modal dialog.
 *
 * Features:
 * - Displays comprehensive client information in organized sections
 * - Includes edit and delete actions
 * - Opens an edit dialog for updating client information
 * - Handles client deletion with confirmation
 * - Responsive layout with scrolling for long content
 *
 * @component
 * @param props - Component props
 * @param props.client - The client to display, or null if no client is selected
 * @param props.open - Whether the dialog is open
 * @param props.onOpenChange - Callback invoked when the dialog open state changes
 * @returns The rendered client detail dialog
 *
 * @example
 * // Basic usage
 * <ClientDetailDialog
 *   client={selectedClient}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */
const ClientDetailDialog = ({ client, open, onOpenChange }: ClientDetailDialogProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const updateClientMutation = useUpdateClient();
    const deleteClientMutation = useDeleteClient();

    if (!client) return null;

    /**
     * Formats a number as USD currency with Panamanian locale.
     *
     * @param value - The number to format
     * @returns Formatted currency string or '-' if value is falsy
     */
    const formatCurrency = (value: number | null) => {
        if (!value) return "-";
        return new Intl.NumberFormat("es-PA", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    /**
     * Returns rating badge color classes based on client rating.
     *
     * @param rating - The client rating string
     * @returns Tailwind CSS classes for the rating badge
     */
    const getRatingColor = (rating: string | null) => {
        switch (rating) {
            case "Active":
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case "Acquired":
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "Shutdown":
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    /**
     * Reusable component for displaying a labeled information item.
     */
    const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | null }) => (
        <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium truncate">{value || "-"}</p>
            </div>
        </div>
    );

    /**
     * Handles client update form submission.
     * Shows success or error toast based on the result.
     *
     * @param data - The updated client data
     */
    const handleUpdateClient = async (data: any) => {
        if (!client) return;

        try {
            await updateClientMutation.mutateAsync({ id: client.accountid, data });
            toast("Client updated", {
                description: "Changes have been saved successfully.",
            });
        } catch (error) {
            toast("Error updating client", {
                description: "An error occurred while saving changes."
            });
        }
    };

    /**
     * Handles client deletion with confirmation.
     * Shows success or error toast based on the result.
     */
    const handleDelete = async () => {
        if (!client || !confirm("Are you sure you want to delete this client?")) return;

        try {
            await deleteClientMutation.mutateAsync(client.accountid);
            onOpenChange(false);
            toast.success("Client deleted successfully");
        } catch (error) {
            toast.error("Error deleting client");
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">{client.accountname}</DialogTitle>
                                    <p className="text-sm text-muted-foreground">{client.account_no}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className={getRatingColor(client.rating)}>
                                {client.rating || "No status"}
                            </Badge>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Client
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteClientMutation.isPending}
                            >
                                {deleteClientMutation.isPending ? "Deleting..." : "Delete Client"}
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* General Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                General Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                <InfoItem icon={Tag} label="Account Type" value={client.account_type} />
                                <InfoItem icon={Building2} label="Industry" value={client.industry} />
                                <InfoItem icon={FileText} label="Ownership" value={client.ownership} />
                                <InfoItem icon={Users} label="Employees" value={client.employees} />
                            </div>
                        </div>

                        <Separator />

                        {/* Financial Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Financial Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                <InfoItem icon={DollarSign} label="Annual Revenue" value={formatCurrency(client.annualrevenue)} />
                                <InfoItem icon={Hash} label="SIC Code" value={client.siccode} />
                                <InfoItem icon={Tag} label="Ticker Symbol" value={client.tickersymbol} />
                            </div>
                        </div>

                        <Separator />

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                <InfoItem icon={Phone} label="Primary Phone" value={client.phone} />
                                <InfoItem icon={Phone} label="Secondary Phone" value={client.otherphone} />
                                <InfoItem icon={Mail} label="Primary Email" value={client.email1} />
                                <InfoItem icon={Mail} label="Secondary Email" value={client.email2} />
                                <InfoItem icon={Globe} label="Website" value={client.website} />
                                <InfoItem icon={FileText} label="Fax" value={client.fax} />
                            </div>
                        </div>

                        <Separator />

                        {/* Address Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Addresses
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                {/* Billing Address */}
                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Billing</h4>
                                    <div className="space-y-1">
                                        {client.bill_street && (
                                            <p className="text-sm">{client.bill_street}</p>
                                        )}
                                        {(client.bill_city || client.bill_state) && (
                                            <p className="text-sm">
                                                {client.bill_city}{client.bill_city && client.bill_state ? ', ' : ''}
                                                {client.bill_state}
                                            </p>
                                        )}
                                        {client.bill_code && (
                                            <p className="text-sm">{client.bill_code}</p>
                                        )}
                                        {client.bill_country && (
                                            <p className="text-sm">{client.bill_country}</p>
                                        )}
                                        {client.bill_pobox && (
                                            <p className="text-sm">P.O. Box: {client.bill_pobox}</p>
                                        )}
                                        {!client.bill_street && !client.bill_city && !client.bill_state && !client.bill_code && !client.bill_country && !client.bill_pobox && (
                                            <p className="text-sm text-muted-foreground italic">Not defined</p>
                                        )}
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Shipping</h4>
                                    <div className="space-y-1">
                                        {client.ship_street && (
                                            <p className="text-sm">{client.ship_street}</p>
                                        )}
                                        {(client.ship_city || client.ship_state) && (
                                            <p className="text-sm">
                                                {client.ship_city}{client.ship_city && client.ship_state ? ', ' : ''}
                                                {client.ship_state}
                                            </p>
                                        )}
                                        {client.ship_code && (
                                            <p className="text-sm">{client.ship_code}</p>
                                        )}
                                        {client.ship_country && (
                                            <p className="text-sm">{client.ship_country}</p>
                                        )}
                                        {client.ship_pobox && (
                                            <p className="text-sm">P.O. Box: {client.ship_pobox}</p>
                                        )}
                                        {!client.ship_street && !client.ship_city && !client.ship_state && !client.ship_code && !client.ship_country && !client.ship_pobox && (
                                            <p className="text-sm text-muted-foreground italic">Not defined</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Settings */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                                <div>
                                    <p className="text-xs text-muted-foreground">Email Marketing</p>
                                    <p className={`text-sm font-medium ${client.emailoptout === "1" ? "text-red-600" : "text-green-600"}`}>
                                        {client.emailoptout === "1" ? "Disabled" : "Enabled"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Owner Notifications</p>
                                    <p className={`text-sm font-medium ${client.notify_owner === "1" ? "text-green-600" : "text-muted-foreground"}`}>
                                        {client.notify_owner === "1" ? "Active" : "Inactive"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Client Origin</p>
                                    <p className={`text-sm font-medium ${client.isconvertedfromlead === "1" ? "text-blue-600" : "text-muted-foreground"}`}>
                                        {client.isconvertedfromlead === "1" ? "Converted from lead" : "Created directly"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ClientFormDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSubmit={handleUpdateClient}
                mode="edit"
                initialData={client}
            />
        </>
    );
};

export default ClientDetailDialog;