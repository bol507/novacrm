import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  DollarSign,
  User,
  Building2,
  Search,
  Package,
  Plus,
  Trash2,
  Percent,
  Loader2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";
import type { Quote, QuoteFormData } from "../types/quote";

// Esquema de validación
const quoteFormSchema = z.object({
  subject: z.string().min(1, "Título requerido").max(255),
  accountid: z.number().min(1, "Cliente requerido"),
  assigned_user_id: z.number().min(1, "Usuario asignado requerido"),
  quote_stage: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']).default('Draft'),
  validtill: z.string().optional(),
  description: z.string().optional(),
  account_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuoteFormData) => void;
  mode?: 'create' | 'edit';
  initialData?: Quote;
}

const QuoteFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData
}: QuoteFormDialogProps) => {
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    mode === 'edit' && initialData?.accountid ? initialData.accountid : null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id ? initialData.assigned_user_id : null
  );
  const [isClientValid, setIsClientValid] = useState(
    mode === 'edit' && initialData?.accountid !== null
  );
  const [isUserValid, setIsUserValid] = useState(
    mode === 'edit' && initialData?.assigned_user_id !== null
  );

  // ✅ CORRECCIÓN 1: Usar useState con valor inicial vacío
  const [items, setItems] = useState<QuoteFormData['items']>([]);

  // ✅ CORRECCIÓN 2: Cargar ítems cuando initialData cambie
  useEffect(() => {
    if (mode === 'edit' && initialData?.items) {
      console.log('Loading initial items:', initialData.items);

      const loadedItems = initialData.items.map(item => {
        // ✅ CORRECCIÓN 3: Agregar fallback para productname
        const productName = item.productname || item.description || `Producto ${item.productid || 'N/A'}`;

        return {
          productid: item.productid,
          sequence_no: item.sequence_no,
          productname: productName,
          quantity: item.quantity,
          listprice: item.listprice,
          discount_percent: item.discount_percent || 0,
          description: item.description,
        };
      });

      console.log('Loaded items:', loadedItems);
      setItems(loadedItems);
    } else {
      // Modo create o sin datos
      setItems([{ productid: null, sequence_no: 1, productname: '', quantity: 1, listprice: 0, discount_percent: 0, description: '' }]);
    }
  }, [mode, initialData]);

  // ✅ CORRECCIÓN: Destructurar 'data' en lugar de propiedades inexistentes
  const { data: clientResults, isLoading: clientsLoading } = useSearchClients(clientSearchTerm);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: useMemo(() => {
      if (mode === 'edit' && initialData) {
        return {
          subject: initialData.subject,
          accountid: initialData.accountid,
          assigned_user_id: initialData.assigned_user_id,
          quote_stage: initialData.quote_stage,
          validtill: initialData.validtill || undefined,
          description: initialData.description || '',
          account_search: initialData.account_name || '',
          assigned_user_search: initialData.assigned_user_name || '',
        };
      }
      return {
        subject: "",
        accountid: 0,
        assigned_user_id: 0,
        quote_stage: "Draft",
        validtill: undefined,
        description: "",
        account_search: '',
        assigned_user_search: '',
      };
    }, [mode, initialData]),
  });

  // Calcular totales con impuestos
  const calculateTotals = () => {
    let subtotal = 0;
    const updatedItems = items.map((item, index) => {
      const netprice = item.listprice * (1 - (item.discount_percent || 0) / 100);
      const total = (item.quantity || 0) * netprice;
      subtotal += total;
      return { ...item, sequence_no: index + 1 };
    });

    // ITBMS 7%
    const itbms = subtotal * 0.07;
    const totalWithTax = subtotal + itbms;

    return { subtotal, itbms, totalWithTax, items: updatedItems };
  };

  const { subtotal, itbms, totalWithTax } = calculateTotals();

  // ✅ CORRECCIÓN 4: Agregar validación más robusta
  const handleSubmit = async (data: QuoteFormValues) => {
    console.log('📝 Formulario submit iniciado:', data);
    console.log('📦 Items:', items);

    try {
      console.log('🔍 Validando items...');

      // ✅ CORRECCIÓN 5: Validación más robusta
      const validItems = items.filter(item =>
        item.productname && item.productname.trim().length > 0 &&
        item.quantity > 0 &&
        item.listprice > 0
      );

      console.log('Valid items count:', validItems.length);
      console.log('Valid items:', validItems);

      if (validItems.length === 0) {
        console.log('❌ Validación fallida: No hay ítems válidos');
        form.setError('root', {
          message: 'Debe agregar al menos un ítem válido a la cotización (con nombre, cantidad y precio)'
        });
        return;
      }

      console.log('✅ Validación pasada');
      console.log('⚙️ Construyendo payload...');

      const payload: QuoteFormData = {
        subject: data.subject,
        potentialid: initialData?.potentialid || null,
        accountid: selectedClientId || data.accountid,
        assigned_user_id: selectedUserId || data.assigned_user_id,
        quote_stage: mode === 'create' ? 'Draft' : data.quote_stage,
        validtill: data.validtill || null,
        description: data.description || null,
        items: validItems.map(item => ({
          productid: item.productid,
          sequence_no: item.sequence_no,
          productname: item.productname,
          quantity: item.quantity,
          listprice: item.listprice,
          discount_percent: item.discount_percent || 0,
          description: item.description || null,
        }))
      };

      console.log('✅ Payload construido:', payload);
      console.log('📤 Llamando a onSubmit...');
      console.log('onSubmit function:', onSubmit);

      // Verificar si onSubmit está definido
      if (!onSubmit) {
        console.error('❌ ERROR: onSubmit es undefined!');
        return;
      }

      // Llamar a onSubmit
      await onSubmit(payload);

      console.log('✅ onSubmit completado exitosamente');

      // Limpiar formulario
      form.reset();
      setItems([{ productid: null, sequence_no: 1, productname: '', quantity: 1, listprice: 0, discount_percent: 0, description: '' }]);
      onOpenChange(false);

    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      console.error('Error details:', error);
      // Opcional: mostrar error al usuario
    }
  };

  const handleSelectClient = (client: any) => {
    form.setValue('account_search', client.accountname);
    form.setValue('accountid', client.id);
    setSelectedClientId(client.id);
    setIsClientValid(true);
    setClientSearchTerm('');
  };

  const handleSelectUser = (user: any) => {
    const userId = user.id || user.user_id;
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name;

    form.setValue('assigned_user_search', userName);
    form.setValue('assigned_user_id', userId);
    setSelectedUserId(userId);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('account_search', value);
    setClientSearchTerm(value);

    if (value === '') {
      setIsClientValid(false);
      setSelectedClientId(null);
      form.setValue('accountid', 0);
    }
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('assigned_user_search', value);
    setUserSearchTerm(value);

    if (value === '') {
      setIsUserValid(false);
      setSelectedUserId(null);
      form.setValue('assigned_user_id', 0);
    }
  };

  const updateItem = (index: number, field: keyof QuoteFormData['items'][0], value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    const itemsWithSequence = newItems.map((item, i) => ({
      ...item,
      sequence_no: i + 1
    }));

    setItems(itemsWithSequence);
  };

  const addItem = () => {
    const newItem = {
      productid: null,
      sequence_no: items.length + 1,
      productname: '',
      quantity: 1,
      listprice: 0,
      discount_percent: 0,
      description: ''
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;

    const newItems = items.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, sequence_no: i + 1 }));

    setItems(newItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Cotización' : 'Nueva Cotización'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la cotización *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cotización para proyecto ABC..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quote_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={mode === 'create'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Borrador</SelectItem>
                        <SelectItem value="Sent">Enviada</SelectItem>
                        <SelectItem value="Accepted">Aceptada</SelectItem>
                        <SelectItem value="Rejected">Rechazada</SelectItem>
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
                name="validtill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Válida hasta
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cliente relacionado */}
            <FormField
              control={form.control}
              name="account_search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Cliente *
                    </div>
                  </FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="Buscar cliente por nombre..."
                        className={`pl-10 transition-all ${isClientValid ? 'border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]' : ''}`}
                        {...field}
                        onChange={handleClientInputChange}
                      />
                    </FormControl>
                  </div>

                  {(clientResults?.length > 0 || clientsLoading) && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border">
                      {clientsLoading ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Buscando...
                        </div>
                      ) : (
                        clientResults?.map((client: any) => (
                          <button
                            key={client.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                            onClick={() => handleSelectClient(client)}
                          >
                            <span>{client.accountname}</span>
                            <span className="text-xs text-muted-foreground">ID: {client.id}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {!isClientValid && (
                    <p className="text-sm text-destructive mt-1">
                      Por favor selecciona un cliente de la lista
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asignado a */}
            <FormField
              control={form.control}
              name="assigned_user_search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Asignado a *
                    </div>
                  </FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="Buscar usuario por nombre..."
                        className={`pl-10 transition-all ${isUserValid ? 'border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]' : ''}`}
                        {...field}
                        onChange={handleUserInputChange}
                      />
                    </FormControl>
                  </div>

                  {(userResults?.length > 0 || usersLoading) && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border">
                      {usersLoading ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Buscando...
                        </div>
                      ) : (
                        userResults?.map((user: any) => (
                          <button
                            key={user.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                            onClick={() => handleSelectUser(user)}
                          >
                            <span>{user.first_name} {user.last_name}</span>
                            <span className="text-xs text-muted-foreground">@{user.user_name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {!isUserValid && (
                    <p className="text-sm text-destructive mt-1">
                      Por favor selecciona un usuario de la lista
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ítems de la cotización */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ítems de la cotización *
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar ítem
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-background">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div className="lg:col-span-2">
                        <label className="text-sm font-medium mb-2 block">
                          Nombre del elemento *
                        </label>
                        <Textarea
                          placeholder="Ej: SUMINISTRO E INSTALACION DE PUERTAS DE WPC TIPO P1 COLOR TAUPE MATE..."
                          className="min-h-[60px]"
                          value={item.productname}
                          onChange={(e) => updateItem(index, 'productname', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Cantidad</label>
                        <Input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Precio unitario ($)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.listprice}
                          onChange={(e) => updateItem(index, 'listprice', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Descuento (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={item.discount_percent}
                          onChange={(e) => updateItem(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Total neto</label>
                        <div className="font-mono font-medium p-2 bg-muted rounded">
                          ${(item.quantity * item.listprice * (1 - (item.discount_percent || 0) / 100)).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">Descripción adicional</label>
                      <Textarea
                        placeholder="Notas adicionales para este ítem..."
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-destructive gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar ítem
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Resumen financiero con impuestos */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="text-sm font-semibold mb-3">Resumen financiero</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Subtotal</div>
                    <div className="font-bold text-lg">{new Intl.NumberFormat('es-PA', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(subtotal)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      ITBMS (7%)
                    </div>
                    <div className="font-bold text-lg text-blue-600">{new Intl.NumberFormat('es-PA', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(itbms)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total</div>
                    <div className="font-bold text-lg text-primary">{new Intl.NumberFormat('es-PA', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalWithTax)}</div>
                  </div>
                </div>
              </div>

              {/* Nota sobre impuestos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Percent className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">ITBMS (7%)</p>
                    <p className="text-xs text-blue-800">
                      El impuesto ITBMS se aplicará automáticamente al total de la cotización.
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Automático
                  </Badge>
                </div>
              </div>
            </div>

            {/* Descripción general */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción general</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales sobre la cotización..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="gap-2"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Actualizar Cotización' : 'Crear Cotización'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteFormDialog;