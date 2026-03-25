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
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ClientDetailDialog = ({ client, open, onOpenChange }: ClientDetailDialogProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const updateClientMutation = useUpdateClient();
    const deleteClientMutation = useDeleteClient();

    if (!client) return null;

    const formatCurrency = (value: number | null) => {
        if (!value) return "-";
        return new Intl.NumberFormat("es-PA", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

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

    const handleUpdateClient = async (data: any) => {
        if (!client) return;

        try {
            await updateClientMutation.mutateAsync({ id: client.accountid, data });
            toast(
                "Cliente actualizado", {
                description: "Los cambios han sido guardados exitosamente.",
            });
        } catch (error) {
            toast("Error al actualizar", {
                description: "Ocurrió un error al guardar los cambios."
            },);
        }
    };

    const handleDelete = async () => {
        if (!client || !confirm("¿Estás seguro de eliminar este cliente?")) return;

        try {
            await deleteClientMutation.mutateAsync(client.accountid);
            onOpenChange(false);
            toast.success("Cliente eliminado exitosamente");
        } catch (error) {
            toast.error("Error al eliminar el cliente");
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
                                {client.rating || "Sin estado"}
                            </Badge>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar Cliente
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteClientMutation.isPending}
                            >
                                {deleteClientMutation.isPending ? "Eliminando..." : "Eliminar Cliente"}
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Información General */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Información General
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                <InfoItem icon={Tag} label="Tipo de Cuenta" value={client.account_type} />
                                <InfoItem icon={Building2} label="Industria" value={client.industry} />
                                <InfoItem icon={FileText} label="Propiedad" value={client.ownership} />
                                <InfoItem icon={Users} label="Empleados" value={client.employees} />
                            </div>
                        </div>

                        <Separator />

                        {/* Información Financiera */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Información Financiera
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                <InfoItem icon={DollarSign} label="Ingresos Anuales" value={formatCurrency(client.annualrevenue)} />
                                <InfoItem icon={Hash} label="Código SIC" value={client.siccode} />
                                <InfoItem icon={Tag} label="Símbolo Bursátil" value={client.tickersymbol} />
                            </div>
                        </div>

                        <Separator />

                        {/* Información de Contacto */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Información de Contacto
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                <InfoItem icon={Phone} label="Teléfono Principal" value={client.phone} />
                                <InfoItem icon={Phone} label="Otro Teléfono" value={client.otherphone} />
                                <InfoItem icon={Mail} label="Email Principal" value={client.email1} />
                                <InfoItem icon={Mail} label="Email Secundario" value={client.email2} />
                                <InfoItem icon={Globe} label="Sitio Web" value={client.website} />
                                <InfoItem icon={FileText} label="Fax" value={client.fax} />
                            </div>
                        </div>

                        <Separator />

                        {/* Información de Dirección */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Direcciones
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                                {/* Dirección de Facturación */}
                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Facturación</h4>
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
                                            <p className="text-sm text-muted-foreground italic">No definida</p>
                                        )}
                                    </div>
                                </div>

                                {/* Dirección de Envío */}
                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Envío</h4>
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
                                            <p className="text-sm text-muted-foreground italic">No definida</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Configuración */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Configuración
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                                <div>
                                    <p className="text-xs text-muted-foreground">Email Marketing</p>
                                    <p className={`text-sm font-medium ${client.emailoptout === "1" ? "text-red-600" : "text-green-600"}`}>
                                        {client.emailoptout === "1" ? "Deshabilitado" : "Habilitado"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Notificaciones al propietario</p>
                                    <p className={`text-sm font-medium ${client.notify_owner === "1" ? "text-green-600" : "text-muted-foreground"}`}>
                                        {client.notify_owner === "1" ? "Activas" : "Inactivas"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Origen del cliente</p>
                                    <p className={`text-sm font-medium ${client.isconvertedfromlead === "1" ? "text-blue-600" : "text-muted-foreground"}`}>
                                        {client.isconvertedfromlead === "1" ? "Convertido de lead" : "Creado directamente"}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </DialogContent>
            </Dialog >

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
