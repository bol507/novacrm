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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign, User, Building2, Search } from "lucide-react";
import { OPPORTUNITY_STAGES } from "../types/opportunity";
import { useClients } from "@/features/clients/hooks/use-clients";
import { useUsers } from "@/features/users/hooks/use-users";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";

// Nuevo esquema con campos para búsqueda
const opportunityFormSchema = z.object({
  potentialname: z.string().min(1, "Nombre requerido").max(255),
  sales_stage: z.enum(OPPORTUNITY_STAGES),
  amount: z.number().min(0).optional(),
  closingdate: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  related_to_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
  description: z.string().optional(),
});

export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>;

interface OpportunityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OpportunityFormValues) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

interface ClientSearchResult {
  id: number;
  accountname: string;
  email1: string;
}

interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  user_name: string;
}

const OpportunityFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData
}: OpportunityFormDialogProps) => {
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    mode === 'edit' && initialData?.related_to ? initialData.related_to : null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id ? initialData.assigned_user_id : null
  );
  const [isClientValid, setIsClientValid] = useState(
    mode === 'edit' && initialData?.related_to !== null
  );
  const [isUserValid, setIsUserValid] = useState(
    mode === 'edit' && initialData?.assigned_user_id !== null
  );


  const { data: clientResults, isLoading: clientsLoading } = useSearchClients(clientSearchTerm);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: useMemo(() => {
      if (mode === 'edit' && initialData) {
        return {
          potentialname: initialData.potentialname,
          sales_stage: initialData.sales_stage,
          amount: initialData.amount || undefined,
          closingdate: initialData.closingdate || undefined,
          probability: initialData.probability || undefined,
          related_to_search: initialData.related_to_name || '',
          assigned_user_search: initialData.assigned_user_name || '',
          description: initialData.description || '',
        };
      }
      return {
        potentialname: "",
        sales_stage: "Prospecting",
        amount: undefined,
        closingdate: undefined,
        probability: undefined,
        related_to_search: '',
        assigned_user_search: '',
        description: "",
      };
    }, [mode, initialData]),
  });

  const handleSubmit = (data: OpportunityFormValues) => {
    const payload = {
      ...data,
      related_to: selectedClientId,
      assigned_user_id: selectedUserId,
    };
    console.log('Datos enviados:', payload);
    onSubmit(payload);
    form.reset();
    onOpenChange(false);
  };


  const handleSelectClient = (client: any) => {
    form.setValue('related_to_search', client.accountname);
    setSelectedClientId(client.id);
    setIsClientValid(true);
    setClientSearchTerm('');
  };

  const handleSelectUser = (user: any) => {
    const userId = user.id || user.user_id;

    form.setValue('assigned_user_search',
      `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name
    );
    setSelectedUserId(userId);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('related_to_search', value);
    setClientSearchTerm(value);

    if (value === '') {
      setIsClientValid(false);
      setSelectedClientId(null);
    }
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('assigned_user_search', value);
    setUserSearchTerm(value);

    if (value === '') {
      setIsUserValid(false);
      setSelectedUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="potentialname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Oportunidad *</FormLabel>
                  <FormControl>
                    <Input placeholder="Implementación CRM para Empresa ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sales_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etapa *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar etapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OPPORTUNITY_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Valor estimado
                      </div>
                    </FormLabel>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closingdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Fecha de cierre
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probabilidad (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="75"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cliente relacionado */}
            <FormField
              control={form.control}
              name="related_to_search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Cliente relacionado *
                    </div>
                  </FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="Buscar cliente por nombre..."
                        className={`pl-10 transition-all ${isClientValid
                          ? 'border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]'
                          : ''
                          }`}
                        {...field}
                        onChange={handleClientInputChange} // 👈 Usar handler personalizado
                      />
                    </FormControl>
                  </div>

                  {/* Resultados de búsqueda */}
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
                        className={`pl-10 transition-all ${isUserValid
                          ? 'border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]'
                          : ''
                          }`}
                        {...field}
                        onChange={handleUserInputChange} // 👈 Usar handler personalizado
                      />
                    </FormControl>
                  </div>

                  {/* Resultados de búsqueda */}
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


            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales sobre la oportunidad..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'edit' ? 'Actualizar Oportunidad' : 'Crear Oportunidad'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

};

export default OpportunityFormDialog;