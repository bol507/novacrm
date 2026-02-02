import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    ACCOUNT_TYPES,
    INDUSTRIES,
    RATINGS,
    type Client
} from "@/features/clients/types/client";
import { toast } from "sonner";
import { useMemo } from "react";

const clientFormSchema = z.object({
    accountname: z.string().min(1, "El nombre es requerido").max(100),
    account_no: z.string().max(50).optional(),
    account_type: z.string().optional(),
    industry: z.string().optional(),
    annualrevenue: z.coerce.number().optional(),
    rating: z.string().optional(),
    ownership: z.string().max(50).optional(),
    siccode: z.string().max(50).optional(),
    tickersymbol: z.string().max(30).optional(),
    phone: z.string().max(30).optional(),
    otherphone: z.string().max(30).optional(),

    // 👇 Emails actualizados (sin deprecated)
    email1: z.string().max(100).email("Email inválido").optional().or(z.literal("")),
    email2: z.string().max(100).email("Email inválido").optional().or(z.literal("")),

    website: z.string().max(100).optional(),
    fax: z.string().max(30).optional(),
    employees: z.coerce.number().int().min(0).optional(),

    // Booleanos obligatorios
    emailoptout: z.boolean(),
    notify_owner: z.boolean(),
    isconvertedfromlead: z.boolean(),

    // Direcciones
    bill_street: z.string().max(250).optional(),
    bill_city: z.string().max(30).optional(),
    bill_state: z.string().max(30).optional(),
    bill_code: z.string().max(30).optional(),
    bill_country: z.string().max(30).optional(),
    bill_pobox: z.string().max(30).optional(),

    ship_street: z.string().max(250).optional(),
    ship_city: z.string().max(30).optional(),
    ship_state: z.string().max(30).optional(),
    ship_code: z.string().max(30).optional(),
    ship_country: z.string().max(30).optional(),
    ship_pobox: z.string().max(30).optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ClientFormValues) => void;
    mode?: 'create' | 'edit';
    initialData?: Client;
}

const ClientFormDialog = ({
    open,
    onOpenChange,
    onSubmit,
    mode = 'create',
    initialData
}: ClientFormDialogProps) => {

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: useMemo(() => {
            if (mode === 'edit' && initialData) {
                return {
                    accountname: initialData.accountname,
                    account_no: initialData.account_no || '',
                    account_type: initialData.account_type || '',
                    industry: initialData.industry || '',
                    annualrevenue: initialData.annualrevenue || undefined,
                    rating: initialData.rating || '',
                    ownership: initialData.ownership || '',
                    siccode: initialData.siccode || '',
                    tickersymbol: initialData.tickersymbol || '',
                    phone: initialData.phone || '',
                    otherphone: initialData.otherphone || '',
                    email1: initialData.email1 || '',
                    email2: initialData.email2 || '',
                    website: initialData.website || '',
                    fax: initialData.fax || '',
                    employees: initialData.employees || 0,
                    emailoptout: initialData.emailoptout === '1',
                    notify_owner: initialData.notify_owner === '1',
                    isconvertedfromlead: initialData.isconvertedfromlead === '1',

                    bill_street: initialData.bill_street || '',
                    bill_city: initialData.bill_city || '',
                    bill_state: initialData.bill_state || '',
                    bill_code: initialData.bill_code || '',
                    bill_country: initialData.bill_country || '',
                    bill_pobox: initialData.bill_pobox || '',

                    ship_street: initialData.ship_street || '',
                    ship_city: initialData.ship_city || '',
                    ship_state: initialData.ship_state || '',
                    ship_code: initialData.ship_code || '',
                    ship_country: initialData.ship_country || '',
                    ship_pobox: initialData.ship_pobox || '',
                };
            }


            return {
                accountname: "",
                account_no: "",
                account_type: "",
                industry: "",
                rating: "",
                ownership: "",
                siccode: "",
                tickersymbol: "",
                phone: "",
                otherphone: "",
                email1: "",
                email2: "",
                website: "",
                fax: "",
                employees: 0,
                emailoptout: false,
                notify_owner: false,
                isconvertedfromlead: false,

                bill_street: "",
                bill_city: "",
                bill_state: "",
                bill_code: "",
                bill_country: "",
                bill_pobox: "",
                ship_street: "",
                ship_city: "",
                ship_state: "",
                ship_code: "",
                ship_country: "",
                ship_pobox: "",
            };
        }, [mode, initialData]),
    });


    const handleSubmit = (data: ClientFormValues) => {

        

        onSubmit(data);
        form.reset();
        onOpenChange(false);

        if (mode === 'edit') {
            toast.success("Cliente actualizado exitosamente");
        } else {
            toast.success("Cliente creado exitosamente");
        }
    };

    const copyBillingToShipping = () => {
        const billing = form.getValues([
            'bill_street', 'bill_city', 'bill_state', 'bill_code', 'bill_country', 'bill_pobox'
        ]);
        form.setValue('ship_street', billing[0]);
        form.setValue('ship_city', billing[1]);
        form.setValue('ship_state', billing[2]);
        form.setValue('ship_code', billing[3]);
        form.setValue('ship_country', billing[4]);
        form.setValue('ship_pobox', billing[5]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {/* Información General */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Información General</h3>
                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="accountname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la Cuenta *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre del cliente" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="account_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Cuenta</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {ACCOUNT_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="industry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Industria</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar industria" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {INDUSTRIES.map((industry) => (
                                                            <SelectItem key={industry} value={industry}>
                                                                {industry}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="rating"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar estado" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {RATINGS.map((rating) => (
                                                            <SelectItem key={rating} value={rating}>
                                                                {rating}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ownership"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Propiedad</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tipo de propiedad" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Información Financiera */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Información Financiera</h3>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="annualrevenue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ingresos Anuales (MXN)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="employees"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número de Empleados</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="siccode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código SIC</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Código SIC" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tickersymbol"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Símbolo Bursátil</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: AAPL" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Información de Contacto</h3>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono Principal</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+52 555 123 4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="otherphone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono Secundario</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+52 555 123 4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Principal</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="correo@empresa.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Secundario</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="correo@empresa.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sitio Web</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://www.ejemplo.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="fax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fax</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+52 555 123 4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Configuración */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Configuración</h3>
                                <Separator />

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="emailoptout"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Email Opt-out</FormLabel>
                                                    <p className="text-sm text-muted-foreground">
                                                        El cliente no desea recibir correos
                                                    </p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notify_owner"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Notificar al Propietario</FormLabel>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enviar notificaciones al propietario
                                                    </p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isconvertedfromlead"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Convertido de Lead</FormLabel>
                                                    <p className="text-sm text-muted-foreground">
                                                        El cliente fue convertido desde un lead
                                                    </p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Dirección de Facturación */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Dirección de Facturación</h3>
                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="bill_street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calle y Número</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Calle Principal 123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bill_city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ciudad</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ciudad" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bill_state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado/Provincia</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Estado" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bill_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código Postal</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12345" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bill_country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>País</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="México" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bill_pobox"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>P.O. Box</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PO123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Dirección de Envío */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-foreground">Dirección de Envío</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={copyBillingToShipping}
                                    >
                                        Copiar dirección de facturación
                                    </Button>
                                </div>
                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="ship_street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calle y Número</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Av. Secundaria 456" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="ship_city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ciudad</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ciudad" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ship_state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado/Provincia</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Estado" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="ship_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código Postal</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="67890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ship_country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>País</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="México" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="ship_pobox"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>P.O. Box</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PO456" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {mode === 'edit' ? 'Actualizar Cliente' : 'Crear Cliente'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ClientFormDialog;